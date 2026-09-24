"""Check the production build on a static host mounted at /kz/, like GitHub Pages."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
import shutil

from playwright.sync_api import sync_playwright, expect

DIST = Path(__file__).resolve().parents[1] / 'dist'
if not (DIST / 'index.html').is_file():
    raise SystemExit('Run npm run build before this check.')


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


with TemporaryDirectory(prefix='qadam-pages-') as directory:
    shutil.copytree(DIST, Path(directory) / 'kz')
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=directory))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    origin = f'http://127.0.0.1:{server.server_port}'
    errors = []
    failed_assets = []
    loaded_assets = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
            page.on('pageerror', lambda error: errors.append(str(error)))

            def check_response(response):
                if response.url.startswith(origin) and response.request.resource_type in ('script', 'stylesheet'):
                    (failed_assets if response.status >= 400 else loaded_assets).append(response.url)

            page.on('response', check_response)
            page.goto(f'{origin}/kz/')
            expect(page.get_by_role('button', name='Empezar mi lección')).to_be_visible()
            assert loaded_assets and not failed_assets, f'Failed assets: {failed_assets}'
            assert all('/kz/assets/' in url for url in loaded_assets), loaded_assets
            assert page.locator('script[src$=".tsx"]').count() == 0, 'Production must not load TypeScript source'
            assert page.locator('.bottom-nav').evaluate("el => getComputedStyle(el).position") == 'fixed', 'CSS did not load'
            page.get_by_role('button', name='Empezar mi lección').click()
            expect(page.locator('.word-card > strong')).to_have_text('Сәлем')
            page.get_by_role('button', name='Continuar', exact=True).click()
            expect(page.locator('.word-card > strong')).to_have_text('Рахмет')
            page.reload()
            page.get_by_role('button', name='Continuar mi lección').click()
            expect(page.locator('.word-card > strong')).to_have_text('Рахмет')
            assert not errors, errors
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join()

print('PASS: production renders at /kz/, all JS/CSS load from /kz/assets/, and lessons work after refresh.')
