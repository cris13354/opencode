import { computeClaim } from "../../domain/claim.js"
import { daysBetween, formatDate } from "../../domain/dates.js"
import { isActionable, nextAction } from "../../domain/escalation.js"
import { formatMoney } from "../../domain/format.js"
import { claimSettings, getState, loadDemo, today } from "../../store.js"
import { actionTone, statusBadge } from "../components.js"
import { badge, button, h, icon, replace, toast } from "../dom.js"

const FILTERS = {
  active: { label: "En curso", test: (row) => ["upcoming", "overdue", "partial"].includes(row.claim.status) },
  overdue: { label: "Vencidas", test: (row) => ["overdue", "partial"].includes(row.claim.status) },
  paid: { label: "Cobradas", test: (row) => ["paid", "paid_late"].includes(row.claim.status) },
  written_off: { label: "Archivadas", test: (row) => row.claim.status === "written_off" },
  all: { label: "Todas", test: () => true },
}

// Filtro y búsqueda sobreviven a los re-renderizados mientras dure la sesión.
const view = { filter: "active", query: "" }

export function dashboardView() {
  const state = getState()
  const asOf = today()
  if (state.invoices.length === 0) return emptyState()

  const rows = state.invoices.map((invoice) => {
    const claim = computeClaim(invoice, asOf, claimSettings())
    return { invoice, claim, next: nextAction(invoice, claim, asOf) }
  })
  const open = rows.filter((row) => ["overdue", "partial", "upcoming"].includes(row.claim.status))
  const overdue = open.filter((row) => row.claim.daysLate > 0)
  const todo = rows
    .filter((row) => isActionable(row.next, asOf))
    .sort((a, b) => a.next.date.localeCompare(b.next.date) || b.claim.outstanding - a.claim.outstanding)
  const soon = rows
    .filter((row) => ["scheduled", "wait"].includes(row.next.kind) && daysBetween(asOf, row.next.date) <= 7)
    .sort((a, b) => a.next.date.localeCompare(b.next.date))

  const sum = (list, pick) => list.reduce((total, row) => total + pick(row), 0)
  const extras = sum(
    overdue.filter((row) => row.claim.commercial),
    (row) => row.claim.interest.total + row.claim.compensation,
  )
  const avgDelay = overdue.length > 0 ? Math.round(sum(overdue, (row) => row.claim.daysLate) / overdue.length) : 0

  const listHost = h("div", { class: "invoice-list" })
  const renderList = () => replace(listHost, invoiceTable(rows, asOf))

  return h(
    "div",
    { class: "stack" },
    profileBanner(state.profile),
    h(
      "section",
      { class: "kpis" },
      kpi("Pendiente de cobro", formatMoney(sum(open, (row) => row.claim.outstanding)), `${open.length} factura${open.length === 1 ? "" : "s"}`, "euro"),
      kpi("Vencido", formatMoney(sum(overdue, (row) => row.claim.outstanding)), `${overdue.length} con retraso`, "alert", overdue.length > 0 ? "danger" : ""),
      kpi("Recuperable por ley", formatMoney(extras), "Intereses + 40 € por factura (B2B)", "scale", "accent"),
      kpi("Retraso medio", `${avgDelay} días`, "En facturas vencidas", "clock"),
    ),
    h(
      "section",
      { class: "card" },
      h("header", { class: "card-head" }, h("h2", null, "Para hoy"), todo.length > 0 ? badge(String(todo.length), "warning") : null),
      todo.length === 0
        ? h("p", { class: "muted empty-line" }, icon("check"), " No tienes nada pendiente hoy. Te avisaremos cuando toque el siguiente paso.")
        : h("ul", { class: "todo" }, todo.map((row) => todoItem(row, asOf))),
      soon.length > 0
        ? h(
            "details",
            { class: "soon" },
            h("summary", null, `Próximos 7 días (${soon.length})`),
            h("ul", { class: "todo compact" }, soon.map((row) => todoItem(row, asOf))),
          )
        : null,
    ),
    h(
      "section",
      { class: "card" },
      h(
        "header",
        { class: "card-head wrap" },
        h("h2", null, "Facturas"),
        h(
          "div",
          { class: "toolbar" },
          h(
            "div",
            { class: "chips", role: "tablist" },
            Object.entries(FILTERS).map(([id, filter]) =>
              h(
                "button",
                {
                  type: "button",
                  role: "tab",
                  class: `chip${view.filter === id ? " active" : ""}`,
                  "aria-selected": String(view.filter === id),
                  onclick: (event) => {
                    view.filter = id
                    event.currentTarget.parentElement.querySelectorAll(".chip").forEach((chip) => {
                      chip.classList.toggle("active", chip === event.currentTarget)
                      chip.setAttribute("aria-selected", String(chip === event.currentTarget))
                    })
                    renderList()
                  },
                },
                filter.label,
                h("span", { class: "count" }, String(rows.filter(filter.test).length)),
              ),
            ),
          ),
          h("input", {
            type: "search",
            class: "search",
            placeholder: "Buscar cliente o nº",
            "aria-label": "Buscar facturas",
            value: view.query,
            oninput: (event) => {
              view.query = event.target.value
              renderList()
            },
          }),
        ),
      ),
      renderList(),
    ),
  )
}

function invoiceTable(rows, asOf) {
  const query = view.query.trim().toLowerCase()
  const visible = rows
    .filter(FILTERS[view.filter].test)
    .filter((row) => !query || `${row.invoice.client.name} ${row.invoice.number} ${row.invoice.concept}`.toLowerCase().includes(query))
    .sort((a, b) => b.claim.daysLate - a.claim.daysLate || a.invoice.dueDate.localeCompare(b.invoice.dueDate))
  if (visible.length === 0) return h("p", { class: "muted empty-line" }, "No hay facturas en esta vista.")
  return h(
    "table",
    { class: "invoices" },
    h(
      "thead",
      null,
      h("tr", null, h("th", null, "Cliente"), h("th", null, "Vencimiento"), h("th", { class: "num" }, "Pendiente"), h("th", null, "Estado"), h("th", null, "Siguiente paso")),
    ),
    h(
      "tbody",
      null,
      visible.map((row) =>
        h(
          "tr",
          { class: "clickable", onclick: () => (location.hash = `#/factura/${row.invoice.id}`) },
          h(
            "td",
            { "data-label": "Cliente" },
            h("a", { href: `#/factura/${row.invoice.id}`, class: "strong-link" }, row.invoice.client.name),
            h("div", { class: "sub" }, `Factura ${row.invoice.number}`),
          ),
          h(
            "td",
            { "data-label": "Vencimiento" },
            formatDate(row.invoice.dueDate),
            row.claim.daysLate > 0 && !row.claim.fullyPaid ? h("div", { class: "sub danger-text" }, `${row.claim.daysLate} días de retraso`) : null,
          ),
          h("td", { class: "num", "data-label": "Pendiente" }, formatMoney(row.claim.outstanding)),
          h("td", { "data-label": "Estado" }, statusBadge(row.claim.status)),
          h("td", { "data-label": "Siguiente paso" }, badge(row.next.title, actionTone(row.next, asOf))),
        ),
      ),
    ),
  )
}

function todoItem(row, asOf) {
  const when = whenLabel(row.next, asOf)
  return h(
    "li",
    null,
    h(
      "a",
      { href: `#/factura/${row.invoice.id}`, class: "todo-link" },
      h("span", { class: `dot ${actionTone(row.next, asOf)}` }),
      h(
        "span",
        { class: "todo-main" },
        h("strong", null, row.next.title),
        h("span", { class: "sub" }, `${row.invoice.client.name} · Factura ${row.invoice.number} · ${formatMoney(row.claim.outstanding)}`),
      ),
      h("span", { class: "todo-when" }, when),
    ),
  )
}

function whenLabel(next, asOf) {
  const diff = daysBetween(asOf, next.date)
  if (diff === 0) return "Hoy"
  if (diff < 0) return `Hace ${-diff} d`
  if (diff === 1) return "Mañana"
  return formatDate(next.date)
}

function kpi(label, value, hint, iconName, tone = "") {
  return h(
    "div",
    { class: `kpi ${tone}` },
    h("div", { class: "kpi-label" }, icon(iconName), label),
    h("div", { class: "kpi-value" }, value),
    h("div", { class: "kpi-hint" }, hint),
  )
}

function profileBanner(profile) {
  if (profile.name && profile.iban) return null
  return h(
    "div",
    { class: "banner" },
    icon("edit"),
    h("p", null, h("strong", null, "Completa tus datos. "), "Tu nombre, NIF e IBAN aparecerán en los recordatorios y en el requerimiento formal."),
    button("Ir a Ajustes", { href: "#/ajustes", small: true }),
  )
}

function emptyState() {
  return h(
    "section",
    { class: "empty card" },
    h("div", { class: "empty-icon" }, icon("euro")),
    h("h1", null, "¿Quién te debe dinero?"),
    h(
      "p",
      { class: "lead" },
      "Añade las facturas que no te han pagado. Cobrado te dirá qué hacer cada día, con qué mensaje y cuánto puedes reclamar por ley, hasta dejar listo el expediente para el juzgado si hace falta.",
    ),
    h(
      "div",
      { class: "empty-actions" },
      button("Añadir factura", { href: "#/nueva", variant: "primary", icon: "plus" }),
      button("Importar CSV", { href: "#/ajustes?seccion=datos", icon: "upload" }),
      button("Ver con datos de ejemplo", {
        variant: "ghost",
        onClick: () => {
          const count = loadDemo()
          toast(`${count} facturas de ejemplo cargadas. Puedes borrarlas en Ajustes.`)
        },
      }),
    ),
    h("p", { class: "fine" }, icon("lock"), " Tus datos se guardan solo en este navegador. No hay cuentas ni servidores."),
  )
}
