"""Validate the complete 53-lesson course in a real browser against dist/."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import re

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
LESSONS = json.loads((ROOT / 'src/data/lessons.json').read_text(encoding='utf-8'))
assert [lesson['id'] for lesson in LESSONS] == list(range(1, 54))
assert len({lesson['title'] for lesson in LESSONS}) == 53
assert {lesson['unitId'] for lesson in LESSONS} == set(range(1, 12))
WORDS = [word for lesson in LESSONS for word in lesson['words']]
assert len(WORDS) == len({word['kazakh'] for word in WORDS}) == 159
for lesson in LESSONS:
    assert len(lesson['words']) == 3
    assert len({word['spanish'] for word in lesson['words']}) == 3
    for word in lesson['words']:
        assert all(isinstance(value, str) and value.strip() for value in word.values())
        assert re.search('[А-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі]', word['kazakh'])
        assert '\ufffd' not in ''.join(word.values())


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT / 'dist')))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(f'http://127.0.0.1:{server.server_port}/')
        page.get_by_role('button', name='Aprender', exact=True).click()
        expect(page.get_by_text('53 lecciones, 11 temas y 159 preguntas.', exact=False)).to_be_visible()
        # Inspect a later unit before unlocking it: all five lessons must be locked.
        page.get_by_label('Explorar por tema').select_option('11')
        expect(page.locator('.path-item.locked')).to_have_count(5)
        expect(page.locator('.path-label').last).to_contain_text('LECCIÓN 53')
        page.get_by_role('button', name='Ver mi siguiente paso').click()
        expect(page.get_by_label('Explorar por tema')).to_have_value('1')
        for lesson in LESSONS:
            expect(page.get_by_label('Explorar por tema')).to_have_value(str(lesson['unitId']))
            page.locator('.path-item').filter(has_text=lesson['title']).click()
            for word in lesson['words']:
                expect(page.locator('.word-card > strong')).to_have_text(word['kazakh'])
                expect(page.locator('.translation')).to_have_text(word['spanish'])
                if len(word['kazakh']) > 10:
                    page.set_viewport_size({'width': 320, 'height': 568})
                    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), word['kazakh']
                    page.set_viewport_size({'width': 390, 'height': 844})
                page.locator('.lesson-action button').click()
            for index, word in enumerate(lesson['words']):
                expect(page.locator('.word-card > strong')).to_have_text(word['kazakh'])
                expect(page.locator('.lesson-action button')).to_be_disabled()
                wrong = lesson['words'][(index + 1) % 3]['spanish']
                page.locator('.answer').filter(has_text=re.compile(r'^\s*\d\s*' + re.escape(wrong) + r'\s*$')).click()
                expect(page.locator('.answer.wrong')).to_have_count(1)
                expect(page.locator('.lesson-action button')).to_be_disabled()
                page.locator('.answer').filter(has_text=re.compile(r'^\s*\d\s*' + re.escape(word['spanish']) + r'\s*$')).click()
                expect(page.locator('.answer.correct')).to_have_count(1)
                page.locator('.lesson-action button').click()
            expect(page.get_by_role('heading', name='Ya sabes un poco más.')).to_be_visible()
            state = json.loads(page.evaluate("localStorage.getItem('qadam-progress-v2')"))
            assert state['completed'] == list(range(1, lesson['id'] + 1))
            assert len(state['days']) == 1 and state['session'] is None
            page.get_by_role('button', name='Seguir aprendiendo').click()
            if lesson['id'] % 10 == 0:
                print(f"Completed lessons 1-{lesson['id']}", flush=True)
            if lesson['id'] == 3:
                # Old progress from the original three lessons must lead to lesson 4.
                page.reload()
                expect(page.locator('.hero-number')).to_contain_text('LECCIÓN 04')
                page.get_by_role('button', name='Aprender', exact=True).click()
        page.get_by_role('button', name='Mi progreso', exact=True).click()
        expect(page.locator('.stat-card strong')).to_have_text(['1', '53', '159'])
        page.get_by_role('button', name='Repasar', exact=True).click()
        expect(page.locator('.vocabulary-word')).to_have_count(159)
        page.get_by_label('Tema para repasar').select_option('11')
        expect(page.locator('.review-button')).to_have_count(5)
        page.get_by_role('searchbox').fill('No entiendo')
        expect(page.locator('.vocabulary-word')).to_have_count(1)
        page.set_viewport_size({'width': 320, 'height': 568})
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
        page.locator('.review-button').filter(has_text=LESSONS[-1]['title']).click()
        page.get_by_role('button', name='Salir y guardar la lección').click()
        page.reload()
        page.get_by_role('button', name='Continuar mi lección').click()
        for word in LESSONS[-1]['words']:
            page.locator('.answer').filter(has_text=re.compile(r'^\s*\d\s*' + re.escape(word['spanish']) + r'\s*$')).click()
            page.locator('.lesson-action button').click()
        page.get_by_role('button', name='Ver mi progreso', exact=True).click()
        expect(page.locator('.stat-card strong')).to_have_text(['1', '53', '159'])
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
    server.server_close()
    thread.join()

print('PASS: 53 complete lessons, 159 correct and incorrect answers, sequential unlocks, old progress, all units, long phrases at 320px, vocabulary search and review resume.')
