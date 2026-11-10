import { addDays, daysBetween, maxIso } from "./dates.js"

// Escalera de reclamación. `offset`: días respecto al vencimiento a partir de los
// cuales tiene sentido el paso. `gap`: días mínimos desde el último mensaje para no
// atosigar al cliente. Los tiempos son una propuesta razonable, no un plazo legal.
export const STAGES = [
  {
    id: "pre",
    label: "Aviso previo",
    title: "Aviso antes del vencimiento",
    offset: -3,
    gap: 0,
    goal: "Evitar el retraso: muchas facturas se pagan tarde por simple olvido o porque nadie las ha aprobado.",
  },
  {
    id: "reminder",
    label: "Recordatorio",
    title: "Recordatorio amable",
    offset: 1,
    gap: 0,
    goal: "Dar por hecho que es un despiste y pedir una fecha de pago concreta.",
  },
  {
    id: "followup",
    label: "Seguimiento",
    title: "Seguimiento",
    offset: 7,
    gap: 5,
    goal: "Pedir una fecha y ofrecer resolver cualquier problema con la factura.",
  },
  {
    id: "firm",
    label: "Aviso firme",
    title: "Aviso firme con tus derechos",
    offset: 15,
    gap: 5,
    goal: "Recordar con educación que la ley da derecho a intereses y costes de cobro, y fijar una fecha límite.",
  },
  {
    id: "masc",
    label: "Requerimiento formal",
    title: "Requerimiento formal y propuesta de negociación",
    offset: 30,
    gap: 7,
    goal: "Dejar constancia fehaciente (burofax) del requerimiento y de la invitación a negociar que exige la LO 1/2025 antes de acudir al juzgado.",
  },
]

// Días naturales que se dejan al deudor para responder a la propuesta de negociación
// antes de considerar intentado el MASC. Hay criterios judiciales distintos sobre el
// cómputo: por eso la app lo presenta como fecha orientativa.
export const MASC_RESPONSE_DAYS = 30

/**
 * Próxima acción recomendada para una factura.
 * @param {import("./model.js").Invoice} invoice
 * @param {ReturnType<typeof import("./claim.js").computeClaim>} claim
 * @param {string} asOf
 */
export function nextAction(invoice, claim, asOf) {
  if (claim.status === "written_off") return action("none", asOf, "Archivada", "No se harán más avisos.")
  if (claim.fullyPaid) return paidAction(claim, asOf)

  const events = [...invoice.events].sort((a, b) => (a.date < b.date ? -1 : 1))
  const latestDispute = events.filter((event) => event.type === "dispute" || event.type === "resolved").at(-1)
  if (latestDispute?.type === "dispute")
    return action(
      "review",
      asOf,
      "Resuelve la discrepancia",
      "El cliente ha puesto una objeción. Aclárala (o emite una rectificativa) antes de seguir reclamando.",
    )

  const commitment = events.filter((event) => event.type === "promise" || event.type === "plan").at(-1)
  if (commitment?.promiseDate && commitment.promiseDate >= asOf)
    return action(
      "wait",
      addDays(commitment.promiseDate, 1),
      commitment.type === "plan" ? "Plan de pagos en curso" : "Esperando el pago prometido",
      `Se comprometió a pagar el ${commitment.promiseDate}. Si no llega, la app te propondrá el siguiente paso.`,
    )

  const filed = events.find((event) => event.type === "monitorio")
  if (filed) return action("court", asOf, "Monitorio presentado", "Sigue el procedimiento en el juzgado y anota cualquier pago.")

  const masc = events.filter((event) => event.type === "masc").at(-1)
  if (masc) return afterMasc(masc, asOf)

  return ladderAction(invoice, claim, events, asOf, commitment)
}

function ladderAction(invoice, claim, events, asOf, commitment) {
  const messages = events.filter((event) => event.type === "message")
  const done = new Set(messages.map((event) => event.stage))
  const lastMessage = messages.at(-1)?.date
  const furthest = Math.max(-1, ...STAGES.map((stage, i) => (done.has(stage.id) ? i : -1)))
  const pending = STAGES.filter((stage, i) => i > furthest && !(stage.id === "pre" && claim.daysLate > 0))
  const stage = pending[0] ?? STAGES.at(-1)
  const byDue = addDays(invoice.dueDate, stage.offset)
  const date = lastMessage ? maxIso(byDue, addDays(lastMessage, stage.gap)) : byDue
  const broken = commitment?.promiseDate ? ` No cumplió el compromiso del ${commitment.promiseDate}.` : ""
  if (date > asOf) return { ...action("scheduled", date, stage.title, stage.goal), stage: stage.id }
  return {
    ...action(stage.id === "masc" ? "masc" : "send", date, stage.title, stage.goal + broken),
    stage: stage.id,
    lateBy: daysBetween(date, asOf),
  }
}

function afterMasc(masc, asOf) {
  if (!masc.receivedDate)
    return action(
      "masc_receipt",
      asOf,
      "Anota la fecha de entrega del burofax",
      "La fecha de recepción es la que cuenta para acreditar el intento de negociación. Añádela cuando te llegue el acuse.",
    )
  const ready = addDays(masc.receivedDate, MASC_RESPONSE_DAYS)
  if (ready > asOf)
    return action(
      "wait",
      ready,
      "Plazo de respuesta al requerimiento",
      `Recibido el ${masc.receivedDate}. Si no hay respuesta ni pago, a partir del ${ready} (orientativo) podrás preparar el monitorio.`,
    )
  return action(
    "monitorio",
    ready,
    "Prepara el procedimiento monitorio",
    "Has agotado la vía amistosa y tienes acreditado el intento de negociación. Revisa el expediente y la guía del monitorio.",
  )
}

function paidAction(claim, asOf) {
  if (claim.status === "paid_late" && claim.commercial)
    return action(
      "none",
      asOf,
      "Cobrada con retraso",
      `Aún podrías reclamar ${claim.interest.total.toFixed(2)} € de intereses y ${claim.compensation} € de costes de cobro. Decide si compensa con este cliente.`,
    )
  return action("none", asOf, "Cobrada", "Nada pendiente.")
}

function action(kind, date, title, detail) {
  return { kind, date, title, detail }
}

/** Acciones que requieren al usuario hoy (o que ya llegan tarde). */
export function isActionable(next, asOf) {
  return ["send", "masc", "masc_receipt", "monitorio", "review"].includes(next.kind) && next.date <= asOf
}
