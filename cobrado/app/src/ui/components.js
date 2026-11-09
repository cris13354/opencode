import { STATUS_LABELS, computeClaim } from "../domain/claim.js"
import { addDays, formatDate } from "../domain/dates.js"
import { formatMoney, formatRate } from "../domain/format.js"
import { parseInvoice } from "../domain/model.js"
import { LATE_PAYMENT_RATES } from "../domain/rates.js"
import { badge, fieldControl, h, icon, replace } from "./dom.js"

const STATUS_TONES = {
  upcoming: "info",
  overdue: "danger",
  partial: "warning",
  paid: "success",
  paid_late: "success",
  written_off: "neutral",
}

export function statusBadge(status) {
  return badge(STATUS_LABELS[status], STATUS_TONES[status])
}

export function actionTone(next, asOf) {
  if (next.kind === "none" || next.kind === "court") return "neutral"
  if (next.kind === "wait" || next.kind === "scheduled") return next.date <= asOf ? "warning" : "info"
  return next.kind === "monitorio" || next.kind === "review" ? "danger" : "warning"
}

/** Desglose de lo reclamable con el detalle de cada tramo de intereses. */
export function claimBreakdown(claim, options = {}) {
  const rows = [
    ["Pendiente de pago", formatMoney(claim.outstanding)],
    claim.paid > 0 ? ["Ya cobrado", formatMoney(claim.paid)] : null,
    [
      claim.commercial ? "Intereses de demora (Ley 3/2004)" : "Intereses legales (art. 1108 CC)",
      formatMoney(claim.interest.total),
    ],
    claim.commercial ? ["Costes de cobro (art. 8 Ley 3/2004)", formatMoney(claim.compensation)] : null,
  ].filter((row) => row !== null)

  return h(
    "div",
    { class: "breakdown" },
    h(
      "dl",
      null,
      rows.map(([label, value]) => h("div", { class: "row" }, h("dt", null, label), h("dd", null, value))),
      h("div", { class: "row total" }, h("dt", null, claim.fullyPaid ? "Aún reclamable" : "Total reclamable hoy"), h("dd", null, formatMoney(claim.claimable))),
    ),
    claim.interest.segments.length > 0
      ? h(
          "details",
          { class: "segments", open: options.open },
          h("summary", null, `Cómo se calculan los intereses (${claim.interest.segments.length} tramo${claim.interest.segments.length === 1 ? "" : "s"})`),
          h(
            "div",
            { class: "table-scroll" },
            h(
              "table",
              { class: "mini-table" },
              h("thead", null, h("tr", null, h("th", null, "Periodo"), h("th", null, "Días"), h("th", null, "Saldo"), h("th", null, "Tipo"), h("th", null, "Interés"))),
              h(
                "tbody",
                null,
                claim.interest.segments.map((segment) =>
                  h(
                    "tr",
                    null,
                    h("td", null, `${formatDate(segment.from)} – ${formatDate(segment.to)}`),
                    h("td", null, String(segment.days)),
                    h("td", null, formatMoney(segment.balance)),
                    h("td", null, formatRate(segment.rate), segment.estimated ? h("span", { class: "flag", title: "Tipo estimado" }, " *") : null),
                    h("td", null, formatMoney(segment.interest)),
                  ),
                ),
              ),
            ),
          ),
          h("p", { class: "fine" }, "Interés simple, base 365 días, sobre el saldo pendiente de cada día. * Tipo estimado: la tabla no cubre ese semestre."),
        )
      : null,
  )
}

export function warningList(warnings) {
  if (warnings.length === 0) return null
  return h(
    "ul",
    { class: "warnings" },
    warnings.map((warning) => h("li", null, icon("alert"), h("span", null, warning))),
  )
}

/**
 * Calculadora autónoma: sirve en la app y en la landing. No guarda nada.
 * @param {{ asOf: string, rates?: typeof LATE_PAYMENT_RATES, compact?: boolean }} options
 */
export function calculator(options) {
  const values = { amount: "1210", dueDate: addDays(options.asOf, -45), type: "empresa", asOf: options.asOf }
  const result = h("div", { class: "calc-result", "aria-live": "polite" })
  const update = () => {
    const parsed = parseInvoice({
      number: "calc",
      amount: values.amount,
      issueDate: values.dueDate,
      dueDate: values.dueDate,
      client: { name: "Cliente", type: values.type },
    })
    if (!parsed.ok) return replace(result, h("p", { class: "muted" }, "Introduce un importe y una fecha de vencimiento válidos."))
    const claim = computeClaim(parsed.invoice, values.asOf, { rates: options.rates ?? LATE_PAYMENT_RATES })
    if (claim.daysLate === 0) return replace(result, h("p", { class: "muted" }, "Esa factura aún no ha vencido en la fecha de cálculo."))
    replace(
      result,
      h(
        "p",
        { class: "calc-headline" },
        "Con ",
        h("strong", null, `${claim.daysLate} días`),
        " de retraso puedes reclamar ",
        h("strong", { class: "accent" }, formatMoney(claim.claimable)),
        claim.commercial ? ` (${formatMoney(claim.interest.total + claim.compensation)} más que la factura).` : ".",
      ),
      claimBreakdown(claim),
      warningList(claim.warnings),
    )
  }
  const bind = (name) => (event) => {
    values[name] = event.target.value
    update()
  }
  const form = h(
    "form",
    { class: `calc-form${options.compact ? " compact" : ""}`, onsubmit: (event) => event.preventDefault() },
    withInput(fieldControl({ name: "amount", label: "Importe de la factura (IVA incl.)", value: values.amount, inputmode: "decimal" }), bind("amount")),
    withInput(fieldControl({ name: "dueDate", label: "Fecha de vencimiento", type: "date", value: values.dueDate }), bind("dueDate")),
    withInput(
      fieldControl({
        name: "type",
        label: "Tu cliente es",
        type: "select",
        value: values.type,
        options: [
          ["empresa", "Empresa o autónomo"],
          ["administracion", "Administración pública"],
          ["particular", "Particular"],
        ],
      }),
      bind("type"),
    ),
    withInput(fieldControl({ name: "asOf", label: "Calcular a fecha de", type: "date", value: values.asOf }), bind("asOf")),
  )
  update()
  return h("div", { class: "calculator" }, form, result)
}

function withInput(fieldEl, handler) {
  fieldEl.querySelector("input, select")?.addEventListener("input", handler)
  return fieldEl
}
