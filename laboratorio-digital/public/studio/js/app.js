import { html, mount, toast } from "./dom.js"
import { icon } from "./icons.js"
import { loadMeta } from "./state.js"

// Router por hash (#/seccion/id). Cada vista exporta `render(el, params, ctx)`.
const ROUTES = [
  { path: "", label: "Panel", icon: "panel", load: () => import("./views/dashboard.js"), group: "Operaciones" },
  { path: "ideas", label: "Ideas", icon: "ideas", load: () => import("./views/ideas.js"), group: "Operaciones" },
  { path: "guiones", label: "Guiones", icon: "guiones", load: () => import("./views/guiones.js"), group: "Operaciones" },
  { path: "produccion", label: "Producción", icon: "produccion", load: () => import("./views/produccion.js"), group: "Operaciones" },
  { path: "calendario", label: "Calendario", icon: "calendario", load: () => import("./views/calendario.js"), group: "Operaciones" },
  { path: "analiticas", label: "Analíticas", icon: "analiticas", load: () => import("./views/analiticas.js"), group: "Operaciones" },
  { path: "biblioteca", label: "Biblioteca", icon: "biblioteca", load: () => import("./views/biblioteca.js"), group: "Conocimiento" },
  { path: "estrategia", label: "Estrategia", icon: "estrategia", load: () => import("./views/estrategia.js"), group: "Conocimiento" },
  { path: "negocio", label: "Modelo de negocio", icon: "negocio", load: () => import("./views/negocio.js"), group: "Conocimiento" },
  { path: "ajustes", label: "Datos y copias", icon: "ajustes", load: () => import("./views/ajustes.js"), group: "Sistema" },
]

const view = document.getElementById("view")
const sidebar = document.getElementById("sidebar")
const menu = document.getElementById("menu")
let leaveGuard = null
let resizeHandler = null
let currentHash = location.hash

function renderNav(active) {
  const groups = [...new Set(ROUTES.map((route) => route.group))]
  mount(
    document.getElementById("nav"),
    groups.map(
      (group) => html`<div class="nav-label">${group}</div>
        ${ROUTES.filter((route) => route.group === group).map(
          (route) =>
            html`<a href="#/${route.path}" ${route.path === active ? html`aria-current="page"` : ""}>${icon(route.icon)}<span>${route.label}</span></a>`,
        )}`,
    ),
  )
}

async function navigate({ keepScroll = false } = {}) {
  if (leaveGuard && !leaveGuard()) {
    history.replaceState(null, "", currentHash || "#/")
    return
  }
  leaveGuard = null
  resizeHandler = null
  currentHash = location.hash
  const [section = "", ...params] = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent)
  const route = ROUTES.find((entry) => entry.path === section) ?? ROUTES[0]
  renderNav(route.path)
  closeMenu()
  document.title = `${route.label} · Content Studio · EL LABORATORIO DIGITAL`
  const module = await route.load()
  const ctx = {
    onLeave: (guard) => (leaveGuard = guard),
    onResize: (handler) => (resizeHandler = handler),
    refresh: () => navigate({ keepScroll: true }),
  }
  view.onclick = null
  view.onchange = null
  view.oninput = null
  view.onsubmit = null
  view.onkeydown = null
  view.ondragstart = view.ondragend = view.ondragover = view.ondragleave = view.ondrop = null
  await module.render(view, params, ctx).catch((error) => {
    console.error(error)
    mount(view, html`<div class="empty"><strong>No se pudo cargar esta sección.</strong>${error.message}</div>`)
  })
  if (!keepScroll) window.scrollTo(0, 0)
}

function closeMenu() {
  sidebar.classList.remove("open")
  menu.setAttribute("aria-expanded", "false")
  document.querySelector(".scrim")?.remove()
}

menu.addEventListener("click", () => {
  sidebar.classList.add("open")
  menu.setAttribute("aria-expanded", "true")
  const scrim = document.createElement("div")
  scrim.className = "scrim"
  scrim.addEventListener("click", closeMenu)
  document.body.append(scrim)
})

let resizeTimer
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => resizeHandler?.(), 150)
})
window.addEventListener("beforeunload", (event) => {
  if (leaveGuard && !leaveGuard(true)) event.preventDefault()
})
window.addEventListener("hashchange", () => navigate())

loadMeta()
  .then(() => navigate())
  .catch(() => {
    mount(
      view,
      html`<div class="empty">
        <strong>No hay conexión con el servidor local.</strong>
        Arráncalo con <code>bun run start</code> en la carpeta del proyecto y recarga esta página.
      </div>`,
    )
    toast("Servidor no disponible", "error")
  })
