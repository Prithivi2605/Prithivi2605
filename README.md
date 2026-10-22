# Prithiviraj B — interactive desk

A React recreation of the original desk portfolio. Vite serves development. Express serves the production build.

## Commands

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

```powershell
npm run build
npm start
```

The production server listens on `http://127.0.0.1:3000`. Set `PORT` to use another port.

## Edit your details

All personal content lives in `src/data/portfolio.js`.

- Email, phone, GitHub, and LinkedIn
- Projects, including Hallora and SoulSync (`enabled: false` hides a project)
- Skills, experience, and education fields that are still blank
- Resume path

Put the PDF at `public/resume/Prithiviraj-B-Resume.pdf`.

## Desk

Drag objects with the mouse. On a phone, use **Move items** before dragging so the page can still scroll. The lamp switches light and dark. Drop an object on the dustbin, or shake the bin while dragging it, to set things aside. Shake the mug for a spill. Browse, find, reset, organize, and the quick tour are on the bottom toolbar.

The original HTML reference is kept at `backup/portfolio-desk-bin-animation-sfx.html`.
