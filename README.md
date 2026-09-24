# Qadam

Aprende kazajo desde el móvil, paso a paso. Aplicación React + TypeScript + Vite.

## Desarrollo

```sh
npm ci
npm run dev
```

## Publicar en GitHub Pages

La web necesita compilarse: GitHub Pages no puede ejecutar directamente
`src/main.tsx`. El archivo `index.html` de la raíz es para desarrollo; la versión
publicable se genera en `dist/`.

1. En el repositorio, abre **Settings → Pages → Build and deployment** y elige
   **GitHub Actions** en **Source**, en lugar de **Deploy from a branch**.
2. Sube estos cambios a `main`. El flujo **Deploy Qadam to GitHub Pages** instala
   las dependencias, compila la aplicación y publica únicamente `dist/`.
3. Si el cambio ya estaba subido antes de seleccionar GitHub Actions, abre
   **Actions → Deploy Qadam to GitHub Pages → Run workflow**.
4. Cuando termine el despliegue, abre <https://erbxl.github.io/kz/>.

Vite usa `base: './'` para que JavaScript y CSS se carguen desde la misma carpeta
que la página, tanto en `/kz/` como en la raíz de un dominio.

## Comprobar producción

```sh
npm run build
npm run preview
```

La prueba de publicación sirve `dist/` bajo `/kz/`, sin Vite ni rutas de respaldo,
y verifica que carguen JavaScript, CSS y la primera lección:

```sh
python scripts/check_pages.py
```

Requiere Python con Playwright y Chromium instalados. `scripts/check_ui.py`
contiene las pruebas completas de navegación, lecciones y tamaños de pantalla.
