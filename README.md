# Portafolio de Elkin Moreno

Portafolio personal con estilo de producto tech premium: sobrio, con un solo color de acento y **modo claro y oscuro**. En la portada hay un portátil en 3D que **se abre con el scroll** y ejecuta en su pantalla un flujo de automatización en vivo. Cada tramo de scroll convierte una tarea manual en automatizada.

- **React 19 + Vite 7 + TypeScript + Tailwind v4**, con animación en **GSAP** (ScrollTrigger, SplitText, Flip, DrawSVG y MotionPath).
- **Bilingüe ES/EN** y **claro/oscuro**: al entrar sigue el tema del sistema; el botón de la cabecera lo cambia y lo recuerda. Con "reducir movimiento", estado final estático.
- **Todo el contenido se edita en `/admin`** (Supabase): proyectos, perfil y portada, experiencia, formación e idiomas, stack y "sobre mí", además del CV en PDF y la foto. También hay un buzón con los mensajes del formulario de contacto.
- Si Supabase no está configurado, el sitio **funciona igual** con el contenido de `src/data/profile.ts` y los proyectos de ejemplo de `src/data/seedProjects.ts`.

---

## 1. Arrancar en local

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # compila a dist/ (con comprobación de tipos)
npm run design:check # detector de Impeccable: marcadores de "hecho por IA" y problemas de calidad
```

---

## 2. Qué se edita y dónde

Desde **`/admin`** (con Supabase conectado), sin tocar código:

| Pestaña | Qué cambia en el sitio |
|---|---|
| **Proyectos** | Las tarjetas y las páginas de cada proyecto: textos ES/EN, capturas, tecnologías, años, orden, destacados, borradores |
| **Perfil** | Titular y entradilla de la portada, disponibilidad ("Abierto a ofertas"), permiso y modalidad, ubicación, email, LinkedIn, GitHub, **CV en PDF** y **foto** |
| **Experiencia** | Los puestos (se ordenan solos por fecha). El puesto sin fecha de fin da el "Ahora en…" de la portada |
| **Formación** | Formación e idiomas |
| **Stack** | Las áreas y sus tecnologías. El sitio cruza cada tecnología con los puestos donde aparece |
| **Sobre mí** | Historia, tu frase, principios y "en qué ando ahora" |
| **Mensajes** | Lo que llega por el formulario de contacto |

Cada pestaña guarda su sección entera con **Guardar** (o `Cmd/Ctrl + S`) y el cambio se ve al momento. Si un texto en inglés se deja vacío, la versión inglesa del sitio muestra el español.

En el código queda lo que no es contenido:

| Qué | Archivo |
|---|---|
| Contenido inicial (lo que se ve mientras una sección no se ha guardado en el panel) | `src/data/profile.ts` |
| Proyectos de ejemplo (los que importa el botón del panel) | `src/data/seedProjects.ts` |
| Textos de interfaz: menú, botones, títulos de sección | `src/site/copy.ts` y `src/site/*/copy.ts` |
| La demostración del portátil (tareas, nodos y rutas) | `src/data/automation.ts` |
| Colores de los dos temas, tipografía y sombras | `src/index.css` (variables al principio) |
| Fuentes (Hanken Grotesk y JetBrains Mono, alojadas en el propio sitio) | `public/fonts/*.woff2` y los `@font-face` de `src/index.css` |
| Imagen para redes sociales (1200×630) | `public/og.png` |

---

## 3. Supabase (para usar el panel `/admin`)

1. Crea un proyecto en <https://supabase.com> (plan gratuito, región **EU West** o **EU Central**).
2. En **SQL Editor**, pega [`supabase/schema.sql`](supabase/schema.sql) entero y pulsa **Run**. Crea las tablas (proyectos, contenido del sitio y mensajes), el bucket de archivos y las políticas **RLS**, que son las que protegen tus datos. Si ya lo habías ejecutado con una versión anterior, **vuelve a ejecutarlo**: es idempotente y añade lo nuevo sin borrar nada.
3. En **Authentication → Users → Add user**, crea tu usuario con **Auto Confirm**. Después desactiva el registro público en **Sign In / Providers → Email → Allow new users to sign up = OFF**.
4. En **Project Settings → API**, copia la `Project URL` y la clave `anon public`, y ponlas en un archivo `.env` (en local) y en las variables de compilación del hosting (paso 4):

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> La clave `anon` es pública por diseño; lo que protege tus datos es RLS. **Nunca** pongas la `service_role` en el frontend.

**Primera carga del contenido.** Entra en `/admin` con tu usuario y:

1. **Proyectos → Importar los 9 proyectos.** Copia a Supabase los proyectos de ejemplo (redactados desde tu CV, con sus capturas). Después edita cada uno: textos, año, capturas reales, orden.
2. **Perfil → CV en PDF → Subir otro PDF** cuando actualices el CV, y **Foto** si quieres que "Sobre mí" lleve retrato. Pulsa **Guardar**.
3. Repasa **Experiencia**, **Formación**, **Stack** y **Sobre mí**. Mientras no guardes una sección, el sitio usa la versión inicial del código (el panel lo indica arriba de cada pestaña).

**Pausa por inactividad:** los proyectos gratuitos de Supabase se pausan tras **7 días sin actividad**. Cada visita a tu web cuenta como actividad. Si aun así se pausa, la web sigue funcionando (con la última copia que tenga cada navegador, o con el contenido del código), pero `/admin` y el formulario de contacto no funcionan hasta que la reactives desde el panel de Supabase.

Para evitarlo del todo, el repositorio incluye [`.github/workflows/supabase-keepalive.yml`](.github/workflows/supabase-keepalive.yml), que hace una lectura diaria. Se activa creando dos *secrets* en GitHub (**Settings → Secrets and variables → Actions**): `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

---

## 4. Desplegar gratis (Cloudflare Workers)

El proyecto ya está creado en Cloudflare como **Worker** con despliegue desde GitHub: cada `git push` a `main` publica solo. `wrangler.jsonc` sirve `dist/` y activa el modo SPA (recargar `/proyecto/…` no da 404).

**Variables de compilación.** Vite incrusta estas variables al compilar, así que van en la configuración de *build* del Worker:

1. <https://dash.cloudflare.com> → **Workers & Pages** → `elkin-moreno` → **Settings** → **Build** → **Variables and secrets** (las de compilación, no las de ejecución).
2. Añade:
   - `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (las del paso 3).
   - `VITE_SITE_URL` = la dirección de tu Worker, por ejemplo `https://elkin-moreno.tu-subdominio.workers.dev`. Se usa para la vista previa en LinkedIn (`canonical`, `og:url`, `og:image`); sin ella queda la dirección provisional de `index.html`.
   - `NODE_VERSION` = `22`, si el build se queja de la versión de Node.
3. Lanza un despliegue nuevo (**Deployments → Retry deployment**, o un `git push`).

**Comprueba**

- Abre tu dirección `*.workers.dev`: prueba el scroll del portátil, el cambio ES/EN, el modo claro/oscuro y la descarga del CV.
- Entra en `/admin`, inicia sesión y revisa que cargan las pestañas.
- Pega la URL en el [Post Inspector de LinkedIn](https://www.linkedin.com/post-inspector/) para ver la vista previa con la imagen.

### Alternativa: Vercel

El plan Hobby es gratis (100 GB/mes) pero solo para **uso personal no comercial**. Importa el repositorio en <https://vercel.com> (detecta Vite), añade las mismas variables y despliega. El `vercel.json` ya incluye la reescritura para las rutas de la SPA.

### Dominio propio (opcional, unos 10–15 €/año)

Conéctalo desde el panel del hosting (**Custom domains**) y cambia `VITE_SITE_URL` por tu dominio.

---

## 5. Pendiente (lo decides tú)

- [ ] Ejecutar `supabase/schema.sql`, crear tu usuario y poner las variables en Cloudflare (pasos 3 y 4).
- [ ] En `/admin`: **Importar los 9 proyectos** y repasarlos uno a uno.
- [ ] **Captura de Aviatur**: la actual es un fotograma a mitad de un fundido. Sustitúyela desde `/admin`.
- [ ] **Aviatur, MindHack y Yes Sir**: confirma el año real, el CMS de cada web, qué hiciste tú y si Yes Sir es la marca de Si Señor SAS.
- [ ] Opcional: una o dos cifras reales de Closer, las bases de datos que usaste en cada trabajo (la fila "Bases de datos" del stack no enlaza con ningún puesto: añádelas a las tecnologías del puesto en **Experiencia**) y una foto en **Perfil**.

**Herramientas de diseño:** `.claude/` (skills de Impeccable y de Emil Kowalski) no se sube a git. Para usar `npm run design:check` en otra máquina, reinstálalas con `npx impeccable install` y `npx skills add emilkowalski/skills`.

## 6. Estructura

```
src/
├── site/                 el sitio público
│   ├── hero/             portátil 3D + app de automatización + coreografía de scroll
│   ├── sections/         Proyectos, Experiencia, Stack, Sobre mí, Contacto
│   ├── projects/         marcos de navegador, esquemas de flujo, página de detalle
│   ├── experience/  stack/  about/
│   ├── ui.tsx  icons.tsx  motion.ts  copy.ts  theme.ts  ThemeToggle.tsx
│   ├── Nav.tsx  Footer.tsx  Home.tsx  ProjectPage.tsx  NotFoundPage.tsx
├── content/              contenido editable: tipos, carga (store.ts), arranque (boot.ts) y derivados
├── pages/admin/          panel: login, proyectos, mensajes y content/ (editores de cada sección)
├── components/admin/     campos del panel
├── data/                 profile.ts (contenido inicial), seedProjects.ts, automation.ts
├── lib/                  supabase.ts, projectsApi.ts, contentApi.ts, types.ts
├── hooks/  i18n/
supabase/schema.sql       tablas, RLS y storage
PRODUCT.md                contexto de producto (lo usa la skill de diseño Impeccable)
```

**Rendimiento:** la web pública lee de Supabase con `fetch` simple (sin SDK). Antes de pintar, espera como mucho 1,5 s por el contenido y los proyectos para salir ya con los datos definitivos; si tardan más, pinta con la última copia guardada en el navegador. El SDK completo (unos 110 kB) solo se descarga al entrar en `/admin`.

**Temas:** los colores de cada tema son variables en `src/index.css` (`:root` es el claro y `.dark` el oscuro). El portátil de la portada es siempre oscuro, en los dos temas. Todos los textos cumplen contraste AA en ambos.

**Fuentes:** se sirven desde `public/fonts`, sin pedir nada a Google Fonts, así que las IP de los visitantes no salen hacia terceros. Hanken Grotesk va en un solo archivo variable (todos los pesos) y JetBrains Mono solo en peso normal; unos 56 kB en total para el latín. Los archivos no llevan hash en el nombre: si alguna vez cambias uno, cámbiale también el nombre.
