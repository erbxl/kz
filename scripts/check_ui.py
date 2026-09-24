"""Browser smoke test. Requires Python Playwright and its Chromium browser."""
import json
import os
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ.get('QADAM_TEST_URL', 'http://127.0.0.1:5173')
ARTIFACTS = Path(tempfile.gettempdir()) / 'qadam-ui-check'
ARTIFACTS.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=1, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE_URL)
    page.evaluate('document.fonts.ready')
    page.screenshot(path=str(ARTIFACTS / 'home-mobile.png'), full_page=True)
    expect(page.get_by_role('button', name='Empezar mi lección')).to_be_visible()
    expect(page.locator('.path-item.locked')).to_have_count(2)
    page.get_by_role('button', name='Repasar', exact=True).click()
    expect(page.get_by_text('Tu colección empieza con un hola.')).to_be_visible()
    page.get_by_role('button', name='Inicio', exact=True).click()
    page.get_by_role('button', name='Un alfabeto diferente', exact=False).click()
    expect(page.get_by_role('dialog')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_have_count(0)
    page.get_by_role('button', name='Empezar mi lección').click()
    for width, height in [(320, 568), (390, 844)]:
        page.set_viewport_size({'width': width, 'height': height})
        page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        box = page.locator('.lesson-action').bounding_box()
        assert abs(box['y'] + box['height'] - height) < 2, 'Lesson action must stay at the viewport bottom'
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    page.get_by_role('button', name='Continuar', exact=True).click()
    expect(page.locator('.word-card > strong')).to_have_text('Рахмет')
    page.get_by_role('button', name='Salir y guardar la lección').click()
    page.reload()
    page.get_by_role('button', name='Continuar mi lección').click()
    expect(page.locator('.word-card > strong')).to_have_text('Рахмет')
    page.get_by_role('button', name='Continuar', exact=True).click()
    page.get_by_role('button', name='Vamos a practicar').click()
    expect(page.locator('.lesson-action button')).to_be_disabled()
    page.locator('.answer').filter(has_text='Gracias').click()
    expect(page.locator('.answer.wrong')).to_have_count(1)
    expect(page.locator('.lesson-action button')).to_be_disabled()
    page.screenshot(path=str(ARTIFACTS / 'quiz-mobile.png'), full_page=True)
    for answer in ['Hola', 'Gracias', 'Sí']:
        page.locator('.answer').filter(has_text=answer).click()
        expect(page.locator('.answer.correct')).to_have_count(1)
        page.locator('.lesson-action button').click()
    expect(page.get_by_role('heading', name='Ya sabes un poco más.')).to_be_visible()
    page.get_by_role('button', name='Seguir aprendiendo').click()
    expect(page.locator('.path-item.locked')).to_have_count(1)
    for title, answers in [('Conoce a alguien', ['Yo', 'Tú', 'Mi nombre']), ('Uno, dos, tres', ['Uno', 'Dos', 'Tres'])]:
        page.locator('.path-item').filter(has_text=title).click()
        for _ in range(3):
            page.locator('.lesson-action button').click()
        for answer in answers:
            page.locator('.answer').filter(has_text=answer).click()
            page.locator('.lesson-action button').click()
        page.get_by_role('button', name='Seguir aprendiendo').click()
    page.get_by_label('Explorar por tema').select_option('1')
    expect(page.locator('.path-item.completed')).to_have_count(3)
    page.get_by_role('button', name='Repasar', exact=True).click()
    expect(page.locator('.vocabulary-word')).to_have_count(9)
    page.get_by_role('searchbox').fill('si')
    expect(page.locator('.vocabulary-word')).to_have_count(1)
    page.get_by_role('searchbox').fill('not-a-word')
    expect(page.get_by_role('status')).to_contain_text('No hay palabras')
    page.get_by_role('searchbox').fill('')
    page.locator('.review-button').first.click()
    for answer in ['Hola', 'Gracias', 'Sí']:
        page.locator('.answer').filter(has_text=answer).click()
        page.locator('.lesson-action button').click()
    page.get_by_role('button', name='Ver mi progreso', exact=True).click()
    expect(page.locator('.stat-card strong')).to_have_text(['1', '3', '9'])
    state = json.loads(page.evaluate("localStorage.getItem('qadam-progress-v2')"))
    assert len(state['days']) == 1 and len(state['completed']) == 3 and state['session'] is None
    page.screenshot(path=str(ARTIFACTS / 'progress-mobile.png'), full_page=True)
    for width in [320, 360, 390, 430, 768, 1024, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        nav = page.locator('.bottom-nav' if width < 760 else '.sidebar-nav')
        for label in ['Inicio', 'Aprender', 'Repasar', 'Mi progreso']:
            nav.get_by_role('button', name=label, exact=True).click()
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), f'Overflow: {width}, {label}'
        nav.get_by_role('button', name='Inicio', exact=True).click()
        if width == 1440:
            page.screenshot(path=str(ARTIFACTS / 'home-desktop.png'), full_page=True)
    page.set_viewport_size({'width': 390, 'height': 844})
    page.evaluate("localStorage.setItem('qadam-progress-v2', '{broken')")
    page.reload()
    expect(page.get_by_role('button', name='Empezar mi lección')).to_be_visible()
    page.evaluate("localStorage.setItem('qadam-progress-v2', JSON.stringify({completed: [], days: [], session: {lessonId: 1, practice: true, step: 0}}))")
    page.reload()
    expect(page.get_by_role('button', name='Empezar mi lección')).to_be_visible()
    page.get_by_role('button', name='Escuchar Рахмет').click()
    expect(page.get_by_role('status')).to_contain_text('voz de kazajo')
    page.add_init_script("Storage.prototype.setItem = function() { throw new DOMException('Storage unavailable', 'SecurityError') }")
    page.reload()
    expect(page.get_by_role('status')).to_contain_text('no permite guardar')
    assert not errors, errors
    browser.close()
    print('PASS: lesson flow, wrong answers, resume, unlocks, all lessons, search, review, real stats, storage recovery, alphabet, audio fallback and 7 viewport sizes.')
    print(f'Screenshots: {ARTIFACTS}')
