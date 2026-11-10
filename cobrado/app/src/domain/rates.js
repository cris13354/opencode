// Tipo legal de interés de demora en operaciones comerciales (Ley 3/2004, art. 7.2):
// tipo de la operación principal de financiación más reciente del BCE antes del
// primer día de cada semestre natural + 8 puntos. Lo publica el Tesoro en el BOE
// cada semestre. `verified: true` indica que la cifra se ha contrastado con la
// resolución citada; el resto deben comprobarse antes de reclamar.
export const LATE_PAYMENT_RATES = [
  { from: "2022-01-01", rate: 8, source: "Resolución del Tesoro, BOE dic. 2021", verified: false },
  { from: "2022-07-01", rate: 8, source: "BOE-A-2022-10844", verified: false },
  { from: "2023-01-01", rate: 10.5, source: "BOE-A-2022-24416", verified: false },
  { from: "2023-07-01", rate: 12, source: "BOE-A-2023-15221", verified: false },
  { from: "2024-01-01", rate: 12.5, source: "BOE-A-2023-26709", verified: true },
  { from: "2024-07-01", rate: 12.25, source: "Resolución del Tesoro, BOE jun. 2024", verified: false },
  { from: "2025-01-01", rate: 11.15, source: "Resolución de 30/12/2024 del Tesoro", verified: true },
  { from: "2025-07-01", rate: 10.15, source: "BOE-A-2025-13217", verified: true },
  { from: "2026-01-01", rate: 10.15, source: "Resolución del Tesoro, BOE dic. 2025", verified: false },
  { from: "2026-07-01", rate: 10.4, source: "BOE-A-2026-14327", verified: true },
]

// Interés legal del dinero (Ley de Presupuestos; prorrogado). Se usa para clientes
// particulares, a quienes no se aplica la Ley 3/2004 (art. 1108 del Código Civil).
export const LEGAL_MONEY_RATE = { rate: 3.25, source: "Ley de PGE prorrogada (2026)", verified: false }

// Cantidad fija por costes de cobro por cada factura (Ley 3/2004, art. 8; STS 612/2021).
export const RECOVERY_COMPENSATION = 40

// Plazo máximo de pago pactable entre empresas (Ley 3/2004, art. 4.3).
export const MAX_AGREED_TERM_DAYS = 60

export function semesterOf(iso) {
  return `${iso.slice(0, 4)}-${Number(iso.slice(5, 7)) <= 6 ? "01" : "07"}-01`
}

/** Tipo aplicable a un día concreto. `estimated` si la tabla no cubre ese semestre. */
export function rateFor(iso, rates) {
  const sorted = [...rates].sort((a, b) => (a.from < b.from ? -1 : 1))
  const semester = semesterOf(iso)
  const match = sorted.filter((entry) => entry.from <= iso).at(-1)
  if (!match) return { rate: sorted[0].rate, estimated: true, verified: false }
  return {
    rate: match.rate,
    estimated: semesterOf(match.from) !== semester,
    verified: Boolean(match.verified),
  }
}
