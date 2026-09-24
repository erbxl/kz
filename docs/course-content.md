# Contenido del curso

El catálogo de `src/data/lessons.json` contiene **53 lecciones y 159 preguntas**:
las tres lecciones originales conservan sus identificadores y se añaden otras
50, con tres entradas de vocabulario por lección. Las unidades se definen en
`src/data/course.ts`.

Cada entrada incluye escritura kazaja, transliteración de apoyo, traducción al
español y una nota original de uso. Primero se estudian las tres entradas y
después se responde una pregunta por entrada. Los distractores proceden de la
misma lección y su posición se mezcla al mostrar cada pregunta.

## Organización

| Unidad | Tema | Lecciones |
| --- | --- | --- |
| 01 | Primeros pasos | 01–03 |
| 02 | Conversaciones | 04–08 |
| 03 | Números y orden | 09–13 |
| 04 | Mi familia | 14–18 |
| 05 | Comer y beber | 19–23 |
| 06 | En casa | 24–28 |
| 07 | Por la ciudad | 29–33 |
| 08 | La naturaleza | 34–38 |
| 09 | Días y momentos | 39–43 |
| 10 | Acciones cotidianas | 44–48 |
| 11 | Describir y pedir ayuda | 49–53 |

## Referencias de consulta

Para contrastar vocabulario y diferencias de uso se han consultado los
materiales de Tatyana Valyayeva en Kaz-tili:

- [Familia y parentesco](https://kaz-tili.kz/slovar02_17.htm).
- [Alimentos](https://kaz-tili.kz/slovar02_5.htm).
- [Calendario y días de la semana](https://kaz-tili.kz/slovar02_1.htm).
- [Verbos frecuentes](https://kaz-tili.kz/slovar01.htm).
- [Naturaleza](https://kaz-tili.kz/slovar02_3.htm).
- [Guía de conversación](https://kaz-tili.kz/razgov0.htm).

Las traducciones españolas, los ejemplos de las notas y la organización del
curso se han redactado para Qadam. La transliteración es una ayuda de lectura,
no un alfabeto oficial ni una transcripción fonética. Conserva distinciones
como ә/ä, ө/ö, ү/ü, ұ/ū, ғ/ğ, қ/q, ң/ñ y ш/ş. La escritura cirílica es la
referencia principal.

## Comprobación

Tras `npm run build`, ejecutar `python scripts/check_course.py`. Requiere
Python, Playwright y Chromium. La prueba recorre las 53 lecciones, responde
cada pregunta primero mal y después bien, verifica los desbloqueos y confirma
que el repaso no duplica el progreso.
