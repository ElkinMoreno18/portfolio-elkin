# Portafolio de Elkin Moreno

Portafolio personal con estilo de producto tech premium: oscuro, sobrio y con un solo color de acento. En la portada hay un portátil en 3D que **se abre con el scroll** y ejecuta en su pantalla un flujo de automatización en vivo. Cada tramo de scroll convierte una tarea manual en automatizada.

- **React 19 + Vite 7 + TypeScript + Tailwind v4**, con animación en **GSAP** (ScrollTrigger, SplitText, Flip, DrawSVG y MotionPath).
- **Bilingüe ES/EN**, solo en modo oscuro y con estado final estático si el sistema pide "reducir movimiento".
- **Proyectos dinámicos** desde Supabase, que se editan en `/admin`, más un buzón con los mensajes del formulario de contacto.
- Si Supabase no está configurado, el sitio **funciona igual** con los proyectos de ejemplo de `src/data/seedProjects.ts`.

---

## 1. Arrancar en local

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # compila a dist/ (con comprobación de tipos)
npm run design:check # detector de Impeccable: marcadores de "hecho por IA" y problemas de calidad
```

---

## 2. Dónde se edita cada cosa

| Qué | Archivo |
|---|---|
| Tu CV: experiencia, formación, stack, "sobre mí" | `src/data/profile.ts` |
| Proyectos de ejemplo (mientras no uses Supabase) | `src/data/seedProjects.ts` |
| Textos de portada, navegación y pie | `src/site/copy.ts` |
| La demostración del portátil (tareas, nodos y rutas) | `src/data/automation.ts` |
| Colores, tipografía y sombras | `src/index.css` (variables al principio) |
| Fuentes (Host Grotesk y Fragment Mono, alojadas en el propio sitio) | `public/fonts/*.woff2` y los `@font-face` de `src/index.css` |
| Capturas de proyectos | `public/projects/*.webp` |
| Imagen para redes sociales (1200×630) | `public/og.png` |
| Retrato (opcional; si no existe, no se muestra nada) | `public/portrait.jpg` |

Todo el texto tiene versión ES y EN (`{ es: '…', en: '…' }`).

---

## 3. Supabase (para usar el panel `/admin`)

1. Crea un proyecto en <https://supabase.com> (plan gratuito, región **EU West** o **EU Central**).
2. En **SQL Editor**, pega [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo. Crea las tablas, el bucket de imágenes y las políticas **RLS**, que son las que protegen tus datos.
3. En **Authentication → Users → Add user**, crea tu usuario con **Auto Confirm**. Después desactiva el registro público en **Sign In / Providers → Email → Allow new users to sign up = OFF**.
4. En **Project Settings → API**, copia la `Project URL` y la clave `anon public`, y ponlas en un archivo `.env`:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> La clave `anon` es pública por diseño; lo que protege tus datos es RLS. **Nunca** pongas la `service_role` en el frontend.

**Pausa por inactividad:** los proyectos gratuitos de Supabase se pausan tras **7 días sin actividad**. Cada visita a tu web cuenta como actividad. Si aun así se pausa, la web sigue funcionando con los proyectos de ejemplo, pero `/admin` y el formulario de contacto no funcionan hasta que la reactives desde el panel de Supabase.

Para evitarlo del todo, el repositorio incluye [`.github/workflows/supabase-keepalive.yml`](.github/workflows/supabase-keepalive.yml), que hace una lectura diaria. Se activa creando dos *secrets* en GitHub (**Settings → Secrets and variables → Actions**): `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

---

## 4. Desplegar gratis

### Opción recomendada: Cloudflare Pages

Es gratis, sin tarjeta, con **ancho de banda ilimitado** y **uso comercial permitido**, que importa porque también buscas clientes freelance.

**1. Sube el código a GitHub**

1. En <https://github.com/new> crea un repositorio **vacío**: nombre `portfolio-elkin`, sin README, sin `.gitignore` y sin licencia. Puede ser público o privado.
2. En la terminal, dentro de la carpeta del proyecto:

```bash
git remote add origin https://github.com/ElkinMoreno18/portfolio-elkin.git
git push -u origin main
```

**2. Conecta Cloudflare Pages**

1. Crea una cuenta gratuita en <https://dash.cloudflare.com/sign-up> (o entra si ya tienes).
2. Menú lateral: **Compute (Workers) → Workers & Pages → Create → pestaña Pages → Import an existing Git repository**.
3. **Connect GitHub**, autoriza a Cloudflare y elige el repositorio `portfolio-elkin`.
4. En **Set up builds and deployments**:
   - **Project name:** `elkin-moreno`. Así la web queda en `https://elkin-moreno.pages.dev`, que es la dirección que ya pusimos en `index.html` para la vista previa en LinkedIn. Si ese nombre está ocupado, elige otro y cambia esa dirección en `index.html` (líneas `canonical`, `og:url` y `og:image`).
   - **Production branch:** `main`
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Abre **Environment variables (advanced)**:
   - `NODE_VERSION` = `22`
   - Cuando tengas Supabase: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Sin ellas la web funciona igual, con los proyectos de ejemplo.
6. **Save and Deploy.** El primer despliegue tarda 1–2 minutos. Después, cada `git push` a `main` publica solo.

Si añades las variables de Supabase más tarde, hazlo en **Settings → Variables and Secrets** del proyecto y lanza un nuevo despliegue (**Deployments → Retry deployment**), porque Vite las incrusta al compilar.

Si Cloudflare crea el proyecto como **Worker** (el flujo por defecto del panel actual), `wrangler.jsonc` ya lo configura: sirve `dist/` y activa el modo SPA para que recargar `/proyecto/…` no dé 404. La URL será `https://elkin-moreno.<tu-subdominio>.workers.dev`; ponla en `index.html` (`canonical`, `og:url`, `og:image`).

**3. Comprueba**

- Abre `https://elkin-moreno.pages.dev` y prueba el scroll del portátil, el cambio ES/EN y la descarga del CV.
- Pega la URL en el [Post Inspector de LinkedIn](https://www.linkedin.com/post-inspector/) para ver la vista previa con la imagen.

### Alternativa: Vercel

El plan Hobby es gratis (100 GB/mes) pero solo para **uso personal no comercial**. Para un portafolio personal está bien.

1. <https://vercel.com> → **Add New → Project** → importa el repositorio. Detecta Vite solo.
2. Añade las mismas dos variables de entorno.
3. **Deploy.** El `vercel.json` ya incluye la reescritura para las rutas de la SPA.

### Dominio propio (opcional, unos 10–15 €/año)

Cuando lo tengas, conéctalo desde el panel del hosting y sustituye `https://elkinmoreno.dev/` por tu dominio real en `index.html` (etiquetas `canonical`, `og:url` y `og:image`).

---

## 5. Pendiente (lo decides tú)

**Ya hecho:** GitHub enlazado a `ElkinMoreno18`; permiso de trabajo y modalidad visibles en la portada y en Contacto; dirección gratuita `elkin-moreno.pages.dev` en las etiquetas para compartir; los textos se ciñen a tu CV.

- [ ] **Captura de Aviatur**: la actual es un fotograma a mitad de un fundido. Sustitúyela cuando puedas, desde `/admin` o en `public/projects/aviatur-colombia.webp`.
- [ ] **Aviatur, MindHack y Yes Sir**: confirma el año real, el CMS de cada web, qué hiciste tú y si Yes Sir es la marca de Si Señor SAS.
- [ ] Opcional: una o dos cifras reales de Closer, las bases de datos que usaste en cada trabajo (la fila "Bases de datos" del stack no enlaza con ningún puesto) y un retrato en `public/portrait.jpg`.
- [ ] Si compras dominio propio: conéctalo en Cloudflare (**Custom domains**) y cambia `elkin-moreno.pages.dev` en `index.html`.

**Herramientas de diseño:** `.claude/` (skills de Impeccable y de Emil Kowalski) no se sube a git. Para usar `npm run design:check` en otra máquina, reinstálalas con `npx impeccable install` y `npx skills add emilkowalski/skills`.

## 6. Estructura

```
src/
├── site/                 el sitio público
│   ├── hero/             portátil 3D + app de automatización + coreografía de scroll
│   ├── sections/         Proyectos, Experiencia, Stack, Sobre mí, Contacto
│   ├── projects/         marcos de navegador, esquemas de flujo, página de detalle
│   ├── experience/  stack/  about/
│   ├── ui.tsx  icons.tsx  motion.ts  copy.ts  Nav.tsx  Footer.tsx
│   ├── Home.tsx  ProjectPage.tsx  NotFoundPage.tsx
├── pages/admin/          panel (login, proyectos, mensajes)
├── components/admin/     campos del panel
├── data/                 profile.ts (CV), seedProjects.ts, automation.ts
├── lib/                  supabase.ts, projectsApi.ts, types.ts
├── hooks/  i18n/
supabase/schema.sql       tablas, RLS y storage
PRODUCT.md                contexto de producto (lo usa la skill de diseño Impeccable)
.claude/skills/           skills de diseño instaladas (Impeccable y las de Emil Kowalski)
```

**Rendimiento:** la web pública lee de Supabase con `fetch` simple. El SDK completo (unos 110 kB) solo se descarga al entrar en `/admin`.

**Fuentes:** se sirven desde `public/fonts`, sin pedir nada a Google Fonts, así que las IP de los visitantes no salen hacia terceros. Host Grotesk va solo con el eje de peso (el sitio nunca usó el de anchura), unos 55 kB en total. Los archivos no llevan hash en el nombre: si alguna vez cambias uno, cámbiale también el nombre. En Vercel conviene añadir en `vercel.json` una cabecera `Cache-Control: public, max-age=31536000, immutable` para `/fonts/(.*)`, igual que la que ya tiene `/assets/(.*)`.
