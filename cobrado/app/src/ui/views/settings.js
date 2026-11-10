import { importInvoicesCsv } from "../../domain/csv.js"
import { isIsoDate } from "../../domain/dates.js"
import { formatRate } from "../../domain/format.js"
import { money } from "../../domain/model.js"
import { LATE_PAYMENT_RATES } from "../../domain/rates.js"
import {
  addInvoices,
  exportJson,
  getState,
  importJson,
  loadDemo,
  resetAll,
  saveProfile,
  saveSettings,
  storageAvailable,
  today,
} from "../../store.js"
import { button, confirmDialog, downloadFile, fieldControl, formDialog, h, icon, readFile, toast } from "../dom.js"

const CSV_TEMPLATE = "Número;Cliente;NIF;Email;Teléfono;Concepto;Fecha;Vencimiento;Total\n2026-001;Cliente Ejemplo SL;B00000000;facturas@example.com;600000000;Diseño web;01/09/2026;01/10/2026;1.210,00\n"

// El informe de la última importación sobrevive al re-render que provoca la propia importación.
let lastImport = null

export function settingsView() {
  const state = getState()
  const profileForm = h(
    "form",
    { class: "grid-2" },
    fieldControl({ name: "name", label: "Nombre o razón social", value: state.profile.name, autocomplete: "name" }),
    fieldControl({ name: "taxId", label: "NIF", value: state.profile.taxId }),
    fieldControl({ name: "address", label: "Domicilio fiscal", value: state.profile.address, wide: true }),
    fieldControl({ name: "city", label: "Localidad (para fechar cartas)", value: state.profile.city }),
    fieldControl({ name: "email", label: "Email", type: "email", value: state.profile.email }),
    fieldControl({ name: "phone", label: "Teléfono", type: "tel", value: state.profile.phone }),
    fieldControl({ name: "iban", label: "IBAN para cobrar", value: state.profile.iban }),
    fieldControl({ name: "formal", label: "Tratar de usted a los clientes", type: "checkbox", value: state.profile.formal ? "1" : "", hint: "Por defecto los mensajes tutean; el requerimiento formal siempre trata de usted." }),
    h("div", { class: "form-actions wide" }, button("Guardar mis datos", { variant: "primary", type: "submit", icon: "check" })),
  )
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(profileForm).entries())
    saveProfile({ ...values, formal: values.formal === "1" })
    toast("Datos guardados")
  })

  const prefsForm = h(
    "form",
    { class: "grid-2" },
    fieldControl({ name: "defaultTermDays", label: "Plazo de pago por defecto (días)", type: "number", min: "0", value: String(state.settings.defaultTermDays) }),
    fieldControl({ name: "legalMoneyRate", label: "Interés legal del dinero (%)", value: String(state.settings.legalMoneyRate).replace(".", ","), inputmode: "decimal", hint: "Para clientes particulares. 3,25 % según la Ley de Presupuestos prorrogada; verifícalo." }),
    h("div", { class: "form-actions wide" }, button("Guardar preferencias", { variant: "primary", type: "submit", icon: "check" })),
  )
  prefsForm.addEventListener("submit", (event) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(prefsForm).entries())
    const rate = money(values.legalMoneyRate)
    if (!Number.isFinite(rate) || rate < 0) return toast("Interés legal no válido", "error")
    saveSettings({ defaultTermDays: Math.max(0, Math.round(Number(values.defaultTermDays) || 0)), legalMoneyRate: rate })
    toast("Preferencias guardadas")
  })

  return h(
    "div",
    { class: "stack narrow" },
    h("h1", null, "Ajustes"),
    storageAvailable
      ? null
      : h("div", { class: "banner danger" }, icon("alert"), h("p", null, "Este navegador no permite guardar datos (¿modo privado?). Lo que hagas se perderá al cerrar la pestaña: exporta una copia.")),
    h("section", { class: "card" }, h("h2", null, "Tus datos"), h("p", { class: "muted" }, "Aparecen en los mensajes, en el requerimiento y en el expediente."), profileForm),
    h("section", { class: "card" }, h("h2", null, "Preferencias"), prefsForm),
    ratesCard(state.settings.rates),
    dataCard(state),
    h(
      "section",
      { class: "card subtle" },
      h("h2", null, icon("lock"), " Privacidad"),
      h("p", null, "Cobrado funciona entero en tu navegador. Las facturas, clientes y mensajes se guardan en el almacenamiento local de este dispositivo y no se envían a ningún servidor. Si cambias de navegador o borras sus datos, perderás la información: exporta una copia de seguridad con regularidad."),
    ),
  )
}

function ratesCard(rates) {
  const sorted = [...rates].sort((a, b) => b.from.localeCompare(a.from))
  return h(
    "section",
    { class: "card", id: "tipos" },
    h("h2", null, "Tipos de interés de demora"),
    h(
      "p",
      { class: "muted" },
      "Tipo legal para operaciones comerciales (BCE + 8 puntos), por semestre. Los marcados como pendientes deben comprobarse en el BOE. Cuando se publique un semestre nuevo, añádelo aquí.",
    ),
    h(
      "div",
      { class: "table-scroll" },
      h(
        "table",
        { class: "mini-table" },
        h("thead", null, h("tr", null, h("th", null, "Desde"), h("th", null, "Tipo"), h("th", null, "Fuente"), h("th", null, ""))),
        h(
          "tbody",
          null,
          sorted.map((entry) =>
            h(
              "tr",
              null,
              h("td", null, entry.from),
              h("td", null, formatRate(entry.rate)),
              h("td", null, entry.source ?? "Añadido a mano", " ", entry.verified ? h("span", { class: "badge success" }, "verificado") : h("span", { class: "badge warning" }, "pendiente")),
              h(
                "td",
                null,
                h(
                  "button",
                  {
                    type: "button",
                    class: "icon-btn",
                    "aria-label": `Eliminar tipo desde ${entry.from}`,
                    onclick: () => saveSettings({ rates: rates.filter((item) => item !== entry) }),
                  },
                  icon("trash"),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    h(
      "div",
      { class: "row-actions" },
      button("Añadir semestre", {
        icon: "plus",
        onClick: async () => {
          const values = await formDialog({
            title: "Añadir tipo de un semestre",
            fields: [
              {
                name: "from",
                label: "Primer día del semestre",
                type: "select",
                options: semesterOptions(),
                value: semesterOptions()[0][0],
              },
              { name: "rate", label: "Tipo (%)", required: true, inputmode: "decimal", placeholder: "10,40" },
              { name: "source", label: "Fuente (referencia del BOE)", placeholder: "BOE-A-2027-…" },
              { name: "verified", label: "Lo he comprobado en el BOE", type: "checkbox" },
            ],
          })
          if (!values) return
          const rate = money(values.rate)
          if (!Number.isFinite(rate) || rate < 0 || !isIsoDate(values.from)) return toast("Tipo no válido", "error")
          saveSettings({
            rates: [...rates.filter((entry) => entry.from !== values.from), { from: values.from, rate, source: values.source || "Añadido a mano", verified: values.verified === "1" }],
          })
          toast("Tipo añadido")
        },
      }),
      button("Restaurar tabla original", {
        variant: "ghost",
        onClick: async () => {
          if (await confirmDialog("¿Restaurar la tabla?", "Se perderán los tipos que hayas añadido o cambiado.", "Restaurar")) saveSettings({ rates: LATE_PAYMENT_RATES })
        },
      }),
    ),
  )
}

function semesterOptions() {
  const year = Number(today().slice(0, 4))
  return [year + 1, year, year - 1].flatMap((y) => [
    [`${y}-07-01`, `2.º semestre ${y}`],
    [`${y}-01-01`, `1.er semestre ${y}`],
  ])
}

function dataCard(state) {
  const report = h("div", { class: "import-report", "aria-live": "polite" }, lastImport ? importReport(lastImport) : null)
  return h(
    "section",
    { class: "card", id: "datos" },
    h("h2", null, "Tus datos y copias de seguridad"),
    h(
      "div",
      { class: "data-grid" },
      dataAction("Importar facturas desde CSV", "Exporta las facturas pendientes desde tu programa de facturación (Holded, Quipu, Excel…) y súbelas aquí.", [
        button("Importar CSV", {
          icon: "upload",
          variant: "primary",
          onClick: async () => {
            const file = await readFile(".csv,text/csv")
            if (!file) return
            const result = importInvoicesCsv(file.text, { defaultTermDays: state.settings.defaultTermDays })
            lastImport = result
            addInvoices(result.invoices)
            toast(`${result.invoices.length} facturas importadas`)
          },
        }),
        button("Descargar plantilla", { variant: "ghost", icon: "download", onClick: () => downloadFile("plantilla-cobrado.csv", `﻿${CSV_TEMPLATE}`, "text/csv") }),
      ]),
      dataAction("Copia de seguridad", "Descarga todo en un archivo JSON para guardarlo o pasarlo a otro dispositivo.", [
        button("Exportar copia", { icon: "download", onClick: () => downloadFile(`cobrado-${today()}.json`, exportJson(), "application/json") }),
        button("Restaurar copia", {
          icon: "upload",
          variant: "ghost",
          onClick: async () => {
            const file = await readFile(".json,application/json")
            if (!file) return
            if (!(await confirmDialog("¿Restaurar esta copia?", "Sustituirá todos los datos actuales de este navegador.", "Restaurar"))) return
            const result = importJson(file.text)
            if (!result.ok) return toast(result.error, "error")
            toast(`Copia restaurada: ${result.imported} facturas${result.rejected ? `, ${result.rejected} descartadas` : ""}`)
          },
        }),
      ]),
      dataAction("Probar con datos de ejemplo", "Añade cinco facturas ficticias en distintas fases para ver cómo funciona.", [
        button("Cargar ejemplo", { icon: "plus", onClick: () => toast(`${loadDemo()} facturas de ejemplo añadidas`) }),
      ]),
      dataAction("Borrar todo", "Elimina facturas, ajustes y perfil de este navegador.", [
        button("Borrar todos los datos", {
          icon: "trash",
          variant: "ghost danger",
          onClick: async () => {
            if (!(await confirmDialog("¿Borrar todos los datos?", "No se puede deshacer. Exporta antes una copia si la necesitas.", "Borrar todo"))) return
            resetAll()
            toast("Datos borrados")
          },
        }),
      ]),
    ),
    report,
  )
}

function dataAction(title, text, actions) {
  return h("div", { class: "data-action" }, h("h3", null, title), h("p", { class: "muted" }, text), h("div", { class: "row-actions" }, actions))
}

function importReport(result) {
  return h(
      "div",
      { class: `note ${result.errors.length > 0 ? "warning" : "success"}` },
      icon(result.errors.length > 0 ? "alert" : "check"),
      h(
        "div",
        null,
        h("p", null, h("strong", null, `${result.invoices.length} facturas importadas.`), result.skipped ? ` ${result.skipped} omitidas por estar ya cobradas.` : ""),
        result.errors.length > 0
          ? h("ul", null, result.errors.slice(0, 8).map((error) => h("li", null, `Línea ${error.line}: ${error.messages.join(" ")}`)))
          : null,
      ),
    )
}
