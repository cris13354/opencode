import { addDays, daysBetween } from "./dates.js"
import { accrueInterest, round2 } from "./interest.js"
import { LATE_PAYMENT_RATES, LEGAL_MONEY_RATE, MAX_AGREED_TERM_DAYS, RECOVERY_COMPENSATION } from "./rates.js"

export const CLIENT_TYPES = {
  empresa: "Empresa o autónomo",
  administracion: "Administración pública",
  particular: "Particular (consumidor)",
}

// Eventos que cuentan como reclamación formal frente a un particular: desde ese
// momento corre el interés legal del dinero (arts. 1100 y 1108 del Código Civil).
const FORMAL_DEMAND_STAGES = ["firm", "masc"]

/**
 * Situación económica y legal de una factura en la fecha `asOf`.
 * @param {import("./model.js").Invoice} invoice
 * @param {string} asOf
 * @param {{ rates?: { from: string, rate: number, verified?: boolean }[], legalMoneyRate?: number }} [settings]
 */
export function computeClaim(invoice, asOf, settings = {}) {
  const paid = round2(invoice.payments.reduce((sum, payment) => sum + payment.amount, 0))
  const outstanding = round2(Math.max(0, invoice.amount - paid))
  const fullyPaid = outstanding === 0
  const lastPayment = invoice.payments.map((payment) => payment.date).sort().at(-1)
  const end = fullyPaid && lastPayment ? lastPayment : asOf
  const daysLate = Math.max(0, daysBetween(invoice.dueDate, end))
  const commercial = invoice.client.type !== "particular"
  const interestStart = commercial ? invoice.dueDate : formalDemandDate(invoice)
  const rates = commercial
    ? (settings.rates ?? LATE_PAYMENT_RATES)
    : [{ from: "1900-01-01", rate: settings.legalMoneyRate ?? LEGAL_MONEY_RATE.rate, verified: false }]
  const interest = interestStart
    ? accrueInterest({ amount: invoice.amount, payments: invoice.payments, start: interestStart, end, rates })
    : { total: 0, segments: [] }
  const compensation = commercial && daysLate > 0 ? RECOVERY_COMPENSATION : 0

  return {
    paid,
    outstanding,
    fullyPaid,
    daysLate,
    daysToDue: daysBetween(asOf, invoice.dueDate),
    commercial,
    interestStart,
    interest,
    compensation,
    claimable: round2(outstanding + interest.total + compensation),
    status: statusOf(invoice, fullyPaid, daysLate, paid),
    warnings: warningsFor(invoice, commercial, interest, interestStart),
  }
}

export const STATUS_LABELS = {
  upcoming: "Por vencer",
  overdue: "Vencida",
  partial: "Pago parcial",
  paid: "Cobrada",
  paid_late: "Cobrada con retraso",
  written_off: "Archivada",
}

function statusOf(invoice, fullyPaid, daysLate, paid) {
  if (invoice.status === "written_off") return "written_off"
  if (fullyPaid) return daysLate > 0 ? "paid_late" : "paid"
  if (daysLate === 0) return "upcoming"
  if (paid > 0) return "partial"
  return "overdue"
}

function formalDemandDate(invoice) {
  return invoice.events
    .filter((event) => event.type === "masc" || (event.type === "message" && FORMAL_DEMAND_STAGES.includes(event.stage)))
    .map((event) => event.date)
    .sort()[0]
}

function warningsFor(invoice, commercial, interest, interestStart) {
  const term = daysBetween(invoice.issueDate, invoice.dueDate)
  return [
    commercial && term > MAX_AGREED_TERM_DAYS
      ? `El plazo de pago (${term} días desde la emisión) supera los ${MAX_AGREED_TERM_DAYS} días que permite la Ley 3/2004 entre empresas. Es posible que los intereses puedan reclamarse desde el ${addDays(invoice.issueDate, MAX_AGREED_TERM_DAYS)}; consúltalo con un profesional.`
      : null,
    interest.segments.some((segment) => segment.estimated)
      ? "Algún tramo usa un tipo de interés estimado porque la tabla no cubre ese semestre. Actualízala en Ajustes con el dato del BOE."
      : null,
    commercial && interest.segments.some((segment) => !segment.estimated && !segment.verified)
      ? "Algún tipo de interés de la tabla está pendiente de verificar en el BOE. Compruébalo antes de enviar una reclamación formal."
      : null,
    !commercial && !interestStart
      ? "A un particular no se le aplica la Ley 3/2004: no hay 40 € de costes de cobro y el interés legal solo corre desde que le reclamas formalmente."
      : null,
  ].filter((warning) => warning !== null)
}
