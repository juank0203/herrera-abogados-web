# Herrera Abogados — Sitio web

Sitio multipágina con rutas reales (sin scroll de una sola página), generado
como HTML5 + CSS3 estático puro a partir de plantillas reutilizables.
Sin frameworks, sin dependencias de npm — solo el `fs`/`http` de Node para
la construcción y la vista previa local.

## Rutas

| Enlace del menú  | Ruta         | Archivo generado             |
|-------------------|--------------|-------------------------------|
| Inicio            | `/`          | `dist/index.html`             |
| Nosotros          | `/nosotros`  | `dist/nosotros/index.html`    |
| Servicios         | `/servicios` | `dist/servicios/index.html`   |
| Casos de Éxito    | `/casos`     | `dist/casos/index.html`       |
| Contacto          | `/contacto`  | `dist/contacto/index.html`    |

Cada opción del menú navega a una página HTML independiente (recarga real
de documento), no a un ancla dentro de una página larga.

## Estructura del proyecto

```
herrera-abogados-web/
├── build.js                 # Generador estático (ensambla src/ → dist/)
├── serve.js                 # Servidor local de vista previa con rutas limpias
├── package.json             # npm run build / npm run serve
├── src/
│   ├── layout.html          # Esqueleto HTML compartido por todas las páginas
│   ├── partials/            # Fragmentos reutilizables (evitan duplicar código)
│   │   ├── head.html            <meta>, <title>, fuentes, CSS
│   │   ├── header.html          Header + navegación
│   │   ├── footer.html          Footer + navegación
│   │   └── whatsapp-float.html  Botón flotante de WhatsApp
│   ├── pages/                # Un fragmento de contenido por página/ruta
│   │   ├── inicio.html
│   │   ├── nosotros.html
│   │   ├── servicios.html
│   │   ├── casos.html
│   │   └── contacto.html
│   ├── css/
│   │   ├── base.css             Tokens de marca, reset, header, footer,
│   │   │                        botones, whatsapp flotante y componentes
│   │   │                        compartidos entre varias páginas
│   │   ├── page-inicio.css      Estilos exclusivos de Inicio
│   │   ├── page-nosotros.css    Estilos exclusivos de Nosotros
│   │   ├── page-servicios.css   Estilos exclusivos de Servicios
│   │   ├── page-casos.css       Estilos exclusivos de Casos de Éxito
│   │   └── page-contacto.css    Estilos exclusivos de Contacto
│   └── img/                  # Logotipos e isotipo (extraídos del manual de marca)
└── dist/                     # ← Carpeta generada. Esto es lo que se despliega.
```

## Cómo funciona (sin dependencias externas)

`build.js` implementa un motor de plantillas mínimo en ~150 líneas de Node
puro:

- **`{{> nombre}}`** dentro de `layout.html` incluye el parcial
  `src/partials/nombre.html` (header, footer, head, whatsapp flotante).
- **`{{VARIABLE}}`** se reemplaza por el valor correspondiente (título,
  descripción, CSS de la página, contenido, año del footer, etc.).
- La navegación (desktop, móvil y footer) se genera **una sola vez** a
  partir del arreglo `NAV_ITEMS` en `build.js`. Agregar una página nueva al
  menú es agregar una línea ahí — no hay que tocar cinco archivos HTML.
- El motivo gráfico de la balanza (SVG) también se define una sola vez en
  `build.js` y se inyecta donde el fragmento de página lo solicite con
  `{{BALANZA_SVG_HERO}}`, `{{BALANZA_SVG_BAND}}` o `{{BALANZA_SVG_WATERMARK}}`.
- **`{{BASE}}`** al inicio de cualquier ruta interna (`{{BASE}}/nosotros`,
  `{{BASE}}/assets/...`) se reemplaza por la variable de entorno
  `BASE_PATH` (vacía por defecto). Esto es lo que permite publicar el
  mismo sitio tanto en la raíz de un dominio como en una subcarpeta de
  GitHub Pages sin tocar el HTML — ver la sección "Publicar en GitHub
  Pages" más abajo.

Nada de esto usa JavaScript en el navegador: el resultado en `dist/` es
HTML y CSS estático plano. Node solo se usa como herramienta de
construcción, igual que un preprocesador.

## Comandos

```bash
npm run build   # genera/regenera ./dist a partir de ./src
npm run serve   # sirve ./dist en http://localhost:4000 con rutas limpias
npm start        # build + serve en un solo paso
```

`serve.js` es exclusivamente para previsualizar localmente con el mismo
comportamiento de "carpeta → index.html" que usan los hostings estáticos
en producción. **No se necesita para el sitio ya desplegado.**

> Nota sobre abrir los archivos con doble clic (`file://`): las rutas del
> menú son absolutas (`/nosotros`, `/servicios`…) porque así deben ser en
> producción. Al abrir `dist/index.html` directamente desde el explorador
> de archivos esos enlaces no resolverán correctamente — para probar la
> navegación real en local, usa `npm run serve`.

## Cómo agregar una página nueva

1. Crear `src/pages/nueva-pagina.html` con el fragmento de contenido
   (sin header/footer — eso ya lo pone el layout).
2. Si necesita estilos propios, crear `src/css/page-nueva-pagina.css`.
3. Agregar una entrada en el arreglo `PAGES` de `build.js` (ruta, título,
   descripción, CSS) y, si debe aparecer en el menú, una línea en
   `NAV_ITEMS`.
4. `npm run build`.

## Despliegue

`dist/` es un sitio 100% estático. Cualquiera de estas opciones sirve
`carpeta/index.html` para rutas sin extensión de forma automática, sin
configuración adicional:

- **Netlify / Vercel / Cloudflare Pages**: conectar el repositorio y
  apuntar el "publish directory" a `dist/` (o correr `npm run build` como
  build command y usar `dist` como output).
- **Servidor propio (nginx)**: sirve `dist/` como raíz; con
  `try_files $uri $uri/ =404;` en el `location /` ya resuelve `/nosotros`
  hacia `/nosotros/index.html` automáticamente.
- **GitHub Pages**: ver la sección siguiente — tiene un detalle importante
  que hay que resolver antes de subirlo.

### Publicar en GitHub Pages

GitHub Pages publica un sitio de dos formas distintas, y afecta cómo deben
verse los enlaces internos del sitio (`/nosotros`, `/assets/css/...`, etc.):

| Tipo de repositorio | URL resultante | Enlaces `/nosotros` funcionan tal cual |
|---|---|---|
| Se llama exactamente `usuario.github.io` ("User/Organization Site") | `https://usuario.github.io/` | Sí, sin nada que ajustar |
| Cualquier otro nombre, ej. `herrera-abogados-web` ("Project Site") | `https://usuario.github.io/herrera-abogados-web/` | No — hay que agregar el prefijo `/herrera-abogados-web` a cada enlace, o los menús y el CSS no van a cargar |

Como lo más probable es que subas esto a un repo con nombre propio (no
`tuusuario.github.io`), el proyecto ya soporta ese prefijo automáticamente
mediante la variable de entorno `BASE_PATH`:

```bash
BASE_PATH=/nombre-del-repositorio node build.js
```

Esto regenera `dist/` con todos los enlaces (`href`, `src`, CSS, imágenes)
apuntando a `/nombre-del-repositorio/...` en vez de `/...`. **El nombre debe
coincidir exactamente con el nombre del repositorio en GitHub.**

**Opción A — Automático con GitHub Actions (recomendado)**

El proyecto ya incluye `.github/workflows/deploy.yml`, que construye el
sitio con el `BASE_PATH` correcto y lo publica automáticamente cada vez que
haces push a `main`. Pasos:

1. Sube todo el proyecto (tal cual está, con `src/`, `build.js`,
   `.github/`, etc. — no hace falta subir `dist/`) a un repositorio nuevo
   en GitHub.
2. En el repositorio: **Settings → Pages → Build and deployment → Source**
   → selecciona **"GitHub Actions"**.
3. Listo. En la pestaña **Actions** vas a ver el flujo corriendo; cuando
   termine (~30 segundos), el sitio queda publicado en
   `https://tuusuario.github.io/nombre-del-repositorio/`.
4. Cada vez que hagas push de un cambio a `main`, se reconstruye y
   republica solo.

Si más adelante conectas un dominio propio o renombras el repo a
`tuusuario.github.io`, abre `.github/workflows/deploy.yml` y borra el
bloque `env: BASE_PATH: ...` (ya no se necesita prefijo).

**Opción B — Manual, sin GitHub Actions**

1. Corre localmente: `BASE_PATH=/nombre-del-repositorio node build.js`
2. Sube **solo el contenido de `dist/`** (no el proyecto completo) a la
   raíz de una rama llamada `gh-pages`, o a una carpeta `/docs` en `main`.
3. En **Settings → Pages → Source**, selecciona esa rama (o `/docs`) como
   origen.

La Opción A es preferible porque no hay que acordarse de reconstruir y
resubir cada vez que cambias algo en `src/`.

## Pendientes antes de producción

- Reemplazar el número de WhatsApp de ejemplo (`573001234567`) por el
  número real, en `src/partials/header.html`, `src/partials/whatsapp-float.html`
  y en `src/pages/inicio.html`, `nosotros.html`, `servicios.html`,
  `casos.html`, `contacto.html` — luego `npm run build`.
- Ajustar `SITE_URL` en `build.js` (se usa para las URLs canónicas) al
  dominio real una vez esté definido.
- Las cifras de la sección "Trayectoria" y los casos de la sección
  "Casos de Éxito" son contenido de ejemplo — deben reemplazarse por
  información real de la firma.
