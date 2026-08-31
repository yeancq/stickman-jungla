# Scape of the Monster — Stickman Jungla 🌿🕷️

Juego de escape hecho con React + Vite. Incluye creador de personaje, más de una
docena de habilidades especiales (compradas con monedas), personajes animales
desbloqueables, niveles temáticos que cambian con el progreso, monstruo con IA
propia, y música/efectos generados con Web Audio API. Configurado como **PWA**
para poder "instalarse" en el celular u otros dispositivos, y listo para
publicarse en **GitHub Pages**.

## 1. Requisitos

- [Node.js](https://nodejs.org) 18 o superior (recomendado 20+)
- Una cuenta de GitHub

## 2. Probarlo en tu computadora

```bash
npm install
npm run dev
```

Abrí la URL que te muestra la terminal (normalmente `http://localhost:5173`).

## 3. Antes de publicar: ajustá el nombre del repo

Este proyecto está pensado para publicarse en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.
Abrí **`vite.config.js`** y cambiá esta línea para que coincida con el nombre real
de tu repositorio en GitHub:

```js
base: "/stickman-jungla/", // ← cambiá "stickman-jungla" por el nombre de tu repo
```

También actualizá `start_url` y `scope` dentro del mismo archivo (en la sección
`manifest`) para que tengan el mismo valor que `base`.

> Si vas a publicar en la raíz de un dominio propio o en `TU-USUARIO.github.io`
> (repo especial de usuario), usá `base: "/"` en su lugar.

## 4. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Primer commit: Scape of the Monster"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/NOMBRE-DEL-REPO.git
git push -u origin main
```

## 5. Publicar en GitHub Pages (automático)

Este repo ya incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`)
que compila y publica el sitio automáticamente cada vez que hacés push a `main`.

Solo tenés que activarlo una vez:

1. En GitHub, andá a tu repo → **Settings → Pages**.
2. En "Build and deployment" → **Source**, elegí **GitHub Actions**.
3. Hacé un push a `main` (o volvé a correr el workflow desde la pestaña **Actions**).
4. En unos minutos tu juego va a estar en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

### Alternativa manual (sin Actions)

```bash
npm run build
npm run deploy
```

Esto usa el paquete `gh-pages` para publicar la carpeta `dist/` directamente en la
rama `gh-pages` del repo. En ese caso, en **Settings → Pages** elegí como *Source*
la rama `gh-pages` en vez de GitHub Actions.

## 6. Instalarlo en el celular (PWA)

- **Android (Chrome)**: abrí el sitio → menú ⋮ → **"Instalar app"**.
- **iPhone/iPad (Safari)**: abrí el sitio → botón compartir 􀈂 → **"Agregar a
  pantalla de inicio"**.
- **Escritorio (Chrome/Edge)**: aparece un ícono de instalación ⊕ en la barra de
  direcciones.

## 7. Progreso guardado

El nombre del personaje, las monedas, las habilidades compradas y el
desbloqueo de personajes animales se guardan en `localStorage` del navegador,
así que persisten entre sesiones en el mismo dispositivo/navegador.

## Estructura del proyecto

```
├── public/
│   ├── icons/              íconos de la PWA
│   └── favicon.svg
├── src/
│   ├── App.jsx              intro + creador de personaje + juego completo
│   ├── main.jsx              punto de entrada de React
│   └── index.css             Tailwind
├── vite.config.js            base path + configuración PWA
├── tailwind.config.js
└── .github/workflows/deploy.yml   despliegue automático a GitHub Pages
```
