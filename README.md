# Scape of the Monster — Stickman Jungla 🌿🕷️

Juego de escape hecho con React + Vite, pensado para jugarse **en horizontal en
el celular**. Al presionar "Empezar"/"Siguiente" el juego intenta entrar en
pantalla completa y bloquear la orientación a horizontal automáticamente; si
el navegador no lo permite (por ejemplo iOS Safari, que no soporta bloqueo de
orientación), aparece un aviso pidiendo girar el teléfono.

## 1. Requisitos

- [Node.js](https://nodejs.org) 18 o superior (recomendado 20+)
- Una cuenta de GitHub

## 2. Probarlo en tu computadora

```bash
npm install
npm run dev
```

## 3. Antes de publicar: ajustá el nombre del repo

Abrí **`vite.config.js`** y cambiá:

```js
base: "/stickman-jungla/", // ← cambiá "stickman-jungla" por el nombre de tu repo
```

También actualizá `start_url` y `scope` dentro de `manifest` para que coincidan.

## 4. Subir a GitHub

```bash
git init
git add .
git commit -m "Primer commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/NOMBRE-DEL-REPO.git
git push -u origin main
```

## 5. Publicar en GitHub Pages

1. En GitHub: **Settings → Pages → Source: GitHub Actions**.
2. Hacé push a `main` (el workflow ya incluido compila y publica solo).
3. Tu juego queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## 6. Instalarlo en el celular (PWA)

- **Android (Chrome)**: menú ⋮ → "Instalar app" (se abre directo en horizontal).
- **iPhone (Safari)**: compartir 􀈂 → "Agregar a pantalla de inicio".

## 7. Orientación horizontal / pantalla completa

Esto se maneja en `src/App.jsx`:
- Función `tryEnterLandscapeFullscreen()`: pide pantalla completa y bloquea
  la orientación a horizontal (Android Chrome). Se llama al presionar
  "Empezar" y "Siguiente".
- Aviso `.rotate-hint`: si el teléfono queda en vertical igual (por ejemplo
  en iOS, que no soporta bloqueo de orientación), se muestra un mensaje
  pidiendo girar el teléfono.
- `vite.config.js` también declara `orientation: "landscape"` en el manifest
  de la PWA, para que al abrir la app instalada arranque directo en horizontal.

## Progreso guardado

Nombre, monedas, habilidades compradas y desbloqueo de animales se guardan en
`localStorage` del navegador.
