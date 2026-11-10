import { subscribe } from "./store.js"
import { replace } from "./ui/dom.js"
import { calculatorView } from "./ui/views/calculatorView.js"
import { dashboardView } from "./ui/views/dashboard.js"
import { dossierView, letterView } from "./ui/views/dossier.js"
import { guideView } from "./ui/views/guide.js"
import { invoiceDetailView } from "./ui/views/invoiceDetail.js"
import { invoiceFormView } from "./ui/views/invoiceForm.js"
import { settingsView } from "./ui/views/settings.js"

const ROUTES = [
  [/^$/, () => dashboardView(), "panel"],
  [/^nueva$/, () => invoiceFormView(null), "nueva"],
  [/^editar\/([\w-]+)$/, (id) => invoiceFormView(id), "panel"],
  [/^factura\/([\w-]+)$/, (id) => invoiceDetailView(id), "panel"],
  [/^expediente\/([\w-]+)$/, (id) => dossierView(id), "panel"],
  [/^carta\/([\w-]+)$/, (id) => letterView(id), "panel"],
  [/^calculadora$/, () => calculatorView(), "calculadora"],
  [/^guia$/, () => guideView(), "guia"],
  [/^ajustes$/, () => settingsView(), "ajustes"],
]

const viewEl = document.getElementById("view")

function currentRoute() {
  // "#/factura/abc?x=1#ancla" → path "factura/abc", ancla "ancla"
  const [path, anchor] = location.hash.replace(/^#\/?/, "").split("#")
  return { path: path.split("?")[0], anchor, query: new URLSearchParams(path.split("?")[1] ?? "") }
}

function render({ scroll }) {
  const route = currentRoute()
  const match = ROUTES.map(([pattern, view, nav]) => ({ found: pattern.exec(route.path), view, nav })).find((entry) => entry.found)
  const resolved = match ?? { found: [""], view: () => dashboardView(), nav: "panel" }
  const y = window.scrollY
  replace(viewEl, resolved.view(...resolved.found.slice(1)))
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.toggleAttribute("aria-current", link.dataset.nav === resolved.nav)
  })
  const target = route.anchor ?? (route.query.get("seccion") ?? "")
  if (scroll && target) return document.getElementById(target)?.scrollIntoView({ block: "start" })
  if (scroll) return window.scrollTo(0, 0)
  window.scrollTo(0, y)
}

window.addEventListener("hashchange", () => render({ scroll: true }))
subscribe(() => render({ scroll: false }))
render({ scroll: true })
