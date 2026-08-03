#!/usr/bin/env node
/**
 * Herrera Abogados — generador estático de sitio multipágina.
 *
 * Ensambla src/layout.html + src/partials/*.html + src/pages/*.html
 * en páginas HTML independientes con rutas limpias tipo carpeta:
 *
 *   /              → dist/index.html
 *   /nosotros      → dist/nosotros/index.html
 *   /servicios     → dist/servicios/index.html
 *   /casos         → dist/casos/index.html
 *   /contacto      → dist/contacto/index.html
 *
 * Sin dependencias externas — solo Node.js (fs/path).
 * Uso:  node build.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const SITE_URL = "https://www.herreraabogados.co"; // ajustar al dominio real

// Prefijo de ruta para cuando el sitio se publica en una subcarpeta, como
// pasa con un "Project Site" de GitHub Pages (https://usuario.github.io/repo/).
// Déjalo vacío ("") si el sitio vive en la raíz del dominio (dominio propio,
// o un "User/Organization Site" de GitHub Pages tipo usuario.github.io).
// Se puede fijar por variable de entorno al construir, por ejemplo:
//   BASE_PATH=/herrera-abogados-web node build.js
const BASE_PATH = (process.env.BASE_PATH || "").replace(/\/+$/, "");

// --------------------------------------------------------------------------
// 1. Fuente única de verdad para la navegación.
//    Agregar una página nueva = agregar una línea aquí; el header, el menú
//    móvil y el footer se generan solos a partir de esta lista.
// --------------------------------------------------------------------------

const NAV_ITEMS = [
  { key: "inicio", label: "Inicio", href: "/" },
  { key: "nosotros", label: "Nosotros", href: "/nosotros" },
  { key: "servicios", label: "Servicios", href: "/servicios" },
  { key: "casos", label: "Casos de Éxito", href: "/casos" },
  { key: "contacto", label: "Contacto", href: "/contacto" },
];

// --------------------------------------------------------------------------
// 2. Configuración de páginas: una entrada por ruta/plantilla.
// --------------------------------------------------------------------------

const PAGES = [
  {
    key: "inicio",
    route: "/",
    page: "inicio.html",
    css: "page-inicio.css",
    bodyClass: "page-inicio",
    title: "Herrera Abogados — Firma de Abogados en Zipaquirá, Cundinamarca",
    description:
      "Herrera Abogados asesora a empresas y personas naturales en los asuntos de mayor complejidad: derecho corporativo, litigios, laboral, familia, notarial y más, en Zipaquirá, Cundinamarca.",
  },
  {
    key: "nosotros",
    route: "/nosotros",
    page: "nosotros.html",
    css: "page-nosotros.css",
    bodyClass: "page-nosotros",
    title: "Nosotros — Herrera Abogados",
    description:
      "Conozca la filosofía, la trayectoria y el método de trabajo de Herrera Abogados: equilibrio, imparcialidad y rigor técnico en cada mandato.",
  },
  {
    key: "servicios",
    route: "/servicios",
    page: "servicios.html",
    css: "page-servicios.css",
    bodyClass: "page-servicios",
    title: "Servicios — Áreas de Práctica | Herrera Abogados",
    description:
      "Derecho corporativo, laboral y empresarial, penal económico, propiedad intelectual, inmobiliario, civil, familiar, pensional, notarial y tutelas constitucionales.",
  },
  {
    key: "casos",
    route: "/casos",
    page: "casos.html",
    css: "page-casos.css",
    bodyClass: "page-casos",
    title: "Casos de Éxito — Herrera Abogados",
    description:
      "Ejemplos representativos y anonimizados de mandatos gestionados por Herrera Abogados en distintos sectores económicos.",
  },
  {
    key: "contacto",
    route: "/contacto",
    page: "contacto.html",
    css: "page-contacto.css",
    bodyClass: "page-contacto",
    title: "Contacto — Herrera Abogados",
    description:
      "Escríbanos por WhatsApp o visítenos en nuestra oficina en Zipaquirá, Cundinamarca. Respuesta directa y personal, sin formularios ni esperas.",
  },
  {
    key: "404",
    route: "/404",
    page: "404.html",
    css: "page-404.css",
    bodyClass: "page-404",
    title: "Página no encontrada — Herrera Abogados",
    description: "La página que busca no existe o fue movida.",
    flatFile: true, // se escribe como /404.html, no /404/index.html
    excludeFromNav: true,
  },
];

// --------------------------------------------------------------------------
// 3. Motor de plantillas mínimo: incluye parciales {{> nombre}} y
//    sustituye variables {{VARIABLE}}. Sin dependencias externas.
// --------------------------------------------------------------------------

function readFile(...segments) {
  return fs.readFileSync(path.join(...segments), "utf8");
}

function resolvePartials(template) {
  return template.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    const partial = readFile(SRC, "partials", `${name}.html`);
    return resolvePartials(partial); // soporta parciales anidados
  });
}

function renderVars(template, vars) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match
  );
}

// --------------------------------------------------------------------------
// 4. Motivo gráfico compartido (balanza inscrita en círculo, eco del
//    isotipo HO). Se usa en las páginas interiores (Nosotros, Servicios,
//    Casos, Contacto, 404); en Inicio se reemplazó por la foto de la firma.
// --------------------------------------------------------------------------

function balanzaSvg(variantClass) {
  return `<svg class="svg-motif ${variantClass}" viewBox="0 0 520 520" aria-hidden="true">
      <circle cx="260" cy="260" r="210" />
      <line x1="260" y1="110" x2="260" y2="330" />
      <line x1="140" y1="180" x2="380" y2="180" />
      <line x1="140" y1="180" x2="90" y2="255" />
      <line x1="140" y1="180" x2="190" y2="255" />
      <path d="M90 255 A50 42 0 0 0 190 255" />
      <line x1="380" y1="180" x2="330" y2="255" />
      <line x1="380" y1="180" x2="430" y2="255" />
      <path d="M330 255 A50 42 0 0 0 430 255" />
      <line x1="220" y1="365" x2="300" y2="365" />
      <line x1="260" y1="330" x2="260" y2="365" />
    </svg>`;
}

// --------------------------------------------------------------------------
// 5. Generadores de navegación (desktop, móvil, footer) a partir de
//    NAV_ITEMS — una sola fuente de verdad para los cinco enlaces.
// --------------------------------------------------------------------------

function withBase(href) {
  if (href === "/") return `${BASE_PATH}/`;
  return `${BASE_PATH}${href}`;
}

function navList(activeKey, { indent }) {
  return NAV_ITEMS.map((item) => {
    const active = item.key === activeKey;
    const cls = active ? ' class="is-active"' : "";
    const aria = active ? ' aria-current="page"' : "";
    return `${indent}<li><a href="${withBase(item.href)}"${cls}${aria}>${item.label}</a></li>`;
  }).join("\n");
}

// --------------------------------------------------------------------------
// 6. Copia recursiva de directorios (para assets estáticos)
// --------------------------------------------------------------------------

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const from = path.join(srcDir, entry.name);
    const to = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

// --------------------------------------------------------------------------
// 7. Build
// --------------------------------------------------------------------------

function build() {
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const layoutRaw = readFile(SRC, "layout.html");
  const layoutWithPartials = resolvePartials(layoutRaw);
  const year = new Date().getFullYear();

  for (const cfg of PAGES) {
    let content = readFile(SRC, "pages", cfg.page);

    // Inyecta el motivo gráfico compartido donde el fragmento lo solicite
    // (todas las páginas interiores, no en Inicio — ahí va la foto)
    content = content
      .replace(/\{\{BALANZA_SVG_HERO\}\}/g, balanzaSvg("svg-motif--hero"))
      .replace(/\{\{BALANZA_SVG_BAND\}\}/g, balanzaSvg("svg-motif--band"))
      .replace(/\{\{BALANZA_SVG_WATERMARK\}\}/g, balanzaSvg("svg-motif--watermark"))
      .replace(/\{\{BASE\}\}/g, BASE_PATH);

    const vars = {
      TITLE: cfg.title,
      DESCRIPTION: cfg.description,
      CANONICAL: SITE_URL + BASE_PATH + (cfg.route === "/" ? "/" : cfg.route + "/"),
      PAGE_CSS: cfg.css,
      BODY_CLASS: cfg.bodyClass,
      YEAR: String(year),
      BASE: BASE_PATH,
      CONTENT: content,
      NAV_DESKTOP: navList(cfg.key, { indent: "        " }),
      NAV_MOBILE: navList(cfg.key, { indent: "      " }),
      NAV_FOOTER: NAV_ITEMS.map((item) => {
        const active = item.key === cfg.key ? ' class="is-active"' : "";
        return `      <a href="${withBase(item.href)}"${active}>${item.label}</a>`;
      }).join("\n"),
    };

    const html = renderVars(layoutWithPartials, vars);

    const outDir =
      cfg.route === "/" || cfg.flatFile
        ? DIST
        : path.join(DIST, cfg.route.replace(/^\//, ""));
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = cfg.flatFile
      ? path.join(outDir, `${cfg.key}.html`)
      : path.join(outDir, "index.html");
    fs.writeFileSync(outFile, html.trim() + "\n");

    console.log(`  ✓ ${cfg.route.padEnd(12)} → ${path.relative(ROOT, outFile)}`);
  }

  // Copia de CSS e imágenes a /dist/assets
  copyDir(path.join(SRC, "css"), path.join(DIST, "assets", "css"));
  copyDir(path.join(SRC, "img"), path.join(DIST, "assets", "img"));

  console.log(`\nSitio generado en ./${path.relative(ROOT, DIST)} (${PAGES.length} páginas).`);
}

build();
