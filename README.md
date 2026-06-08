# 🏀 English Coach

App para aprender el inglés que necesitas para **dirigir entrenamientos de baloncesto**: vocabulario, frases de instrucción, guiones de ejercicios completos y práctica con audio. Español → Inglés, con guía de pronunciación pensada para hispanohablantes.

Es una **PWA** (web app instalable): se añade a la pantalla de inicio del móvil y funciona sin conexión una vez cargada.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La app (entrada principal — dirección visual *Noche*) |
| `app.jsx` | Lógica y pantallas (Hoy, Vocabulario, Frases, Ejercicios, Práctica) |
| `content.js` | Todo el contenido: términos, frases y guiones (ES↔EN) |
| `styles.css` | Estilos |
| `manifest.webmanifest`, `sw.js`, `icons/` | Soporte PWA (instalar + offline) |
| `Coach English.html` | Exploración de diseño (las 3 direcciones lado a lado) — opcional |

No hay paso de compilación: es HTML/CSS/JS estático.

## Probar en local

Por el service worker conviene servirlo con un servidor (no abrir el `file://` directamente):

```bash
npx serve .
# o
python3 -m http.server
```

Luego abre `http://localhost:3000` (o el puerto que indique).

## Desplegar en Vercel

1. Sube este repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo `basketouch/english_coach`.
3. Framework Preset: **Other**. No hace falta build command ni output dir (es estático).
4. **Deploy**. Listo: tendrás una URL `https://….vercel.app`.

### Instalar en el móvil
Abre la URL en el navegador del móvil → menú → **Añadir a pantalla de inicio**.

## Hoja de ruta

- [x] v1 — Vocabulario, frases, guiones de ejercicios, práctica (tarjetas + escucha), audio, instalable.
- [ ] **Ejercicios** — ampliar y detallar los guiones (siguiente paso).
- [ ] **Supabase** — añadir tus propios conceptos desde la app y sincronizar progreso entre dispositivos.
- [ ] Más áreas además del baloncesto.
