import { addDays } from "./dates.js"
import { formatDate, formatLongDate, formatMoney } from "./format.js"

// Días que se dan por defecto para pagar en cada paso de la escalera.
export const DEFAULT_DEADLINE_DAYS = { pre: 0, reminder: 0, followup: 5, firm: 7, masc: 15 }

/**
 * Genera el texto de un paso de la escalera. Las plantillas son borradores: el
 * usuario puede editarlas antes de enviarlas y la app no envía nada por sí sola.
 *
 * @param {string} stage id de STAGES o "extras"
 * @param {{ profile: Profile, invoice: import("./model.js").Invoice, claim: ReturnType<typeof import("./claim.js").computeClaim>, asOf: string, deadlineDays?: number, waiveExtras?: boolean }} ctx
 * @typedef {{ name: string, taxId: string, address: string, city: string, email: string, phone: string, iban: string, formal: boolean }} Profile
 */
export function renderTemplate(stage, ctx) {
  const deadlineDays = ctx.deadlineDays ?? DEFAULT_DEADLINE_DAYS[stage] ?? 7
  const v = {
    you: ctx.profile.formal ? (tu, usted) => usted : (tu) => tu,
    greeting: greeting(ctx.invoice.client, ctx.profile.formal),
    number: ctx.invoice.number,
    concept: ctx.invoice.concept || "los servicios prestados",
    amount: formatMoney(ctx.invoice.amount),
    outstanding: formatMoney(ctx.claim.outstanding),
    interest: formatMoney(ctx.claim.interest.total),
    claimable: formatMoney(ctx.claim.claimable),
    due: formatDate(ctx.invoice.dueDate),
    issue: formatDate(ctx.invoice.issueDate),
    daysLate: ctx.claim.daysLate,
    deadline: formatDate(addDays(ctx.asOf, deadlineDays)),
    deadlineDays,
    payment: paymentBlock(ctx.profile, ctx.invoice.number),
    signature: signature(ctx.profile),
    ctx,
  }
  const template = TEMPLATES[stage]
  if (!template) throw new Error(`Plantilla desconocida: ${stage}`)
  return template(v)
}

const TEMPLATES = {
  pre: (v) => ({
    subject: `La factura ${v.number} vence el ${v.due}`,
    body: lines(
      v.greeting,
      "",
      `${v.you("Te escribo", "Le escribo")} solo para recordar${v.you("te", "le")} que la factura ${v.number} (${v.concept}), por importe de ${v.amount}, vence el ${v.due}.`,
      "",
      `Si el pago ya está programado, ${v.you("ignora", "ignore")} este mensaje. Si ${v.you("necesitas", "necesita")} que reenvíe la factura o algún dato para tramitarla, ${v.you("dímelo", "dígamelo")} y lo preparo.`,
      v.payment,
      v.signature,
    ),
  }),

  reminder: (v) => ({
    subject: `Recordatorio: factura ${v.number} pendiente de pago`,
    body: lines(
      v.greeting,
      "",
      `Según mis registros, la factura ${v.number} (${v.concept}), por ${v.outstanding}, con vencimiento el ${v.due}, sigue pendiente de pago. Seguramente se ha quedado traspapelada.`,
      "",
      `¿${v.you("Me puedes", "Me puede")} confirmar en qué fecha está previsto el pago? Si ${v.you("te", "le")} resulta útil, ${v.you("te", "le")} reenvío la factura.`,
      v.payment,
      v.signature,
    ),
  }),

  followup: (v) => ({
    subject: `Factura ${v.number}: ¿hay algún problema?`,
    body: lines(
      v.greeting,
      "",
      `${v.you("Te", "Le")} vuelvo a escribir por la factura ${v.number}, que venció el ${v.due} (hace ${v.daysLate} días) y tiene pendientes ${v.outstanding}.`,
      "",
      `Si hay algún problema con la factura o falta algún dato para tramitarla (número de pedido, persona que debe aprobarla, datos fiscales…), ${v.you("dímelo", "dígamelo")} y lo soluciono hoy mismo. Si todo está correcto, ${v.you("te", "le")} agradecería que me ${v.you("confirmaras", "confirmara")} la fecha de pago antes del ${v.deadline}.`,
      v.payment,
      v.signature,
    ),
  }),

  firm: (v) => ({
    subject: `Factura ${v.number} vencida hace ${v.daysLate} días`,
    body: lines(
      v.greeting,
      "",
      `La factura ${v.number}, por ${v.outstanding}, venció el ${v.due} y, pese a mis mensajes anteriores, sigue sin pagarse.`,
      "",
      ...(v.ctx.claim.commercial ? firmCommercial(v) : firmConsumer(v)),
      "",
      `Si no recibo el pago ni noticias ${v.you("tuyas", "suyas")} antes de esa fecha, ${v.you("te", "le")} enviaré un requerimiento formal, que es el paso previo a una reclamación judicial. Preferiría de verdad no llegar a eso.`,
      v.payment,
      v.signature,
    ),
  }),

  masc: (v) => formalLetter(v),

  extras: (v) => ({
    subject: `Intereses de demora y costes de cobro de la factura ${v.number}`,
    body: lines(
      v.greeting,
      "",
      `Gracias por el pago de la factura ${v.number}. Como se abonó ${v.daysLate} días después de su vencimiento (${v.due}), ${v.you("te", "le")} recuerdo que la Ley 3/2004 de lucha contra la morosidad reconoce en estos casos intereses de demora (${v.interest}) y una indemnización de ${formatMoney(v.ctx.claim.compensation)} por costes de cobro.`,
      "",
      `${v.you("Te", "Le")} agradecería que ${v.you("abonaras", "abonara")} ${formatMoney(v.ctx.claim.interest.total + v.ctx.claim.compensation)} antes del ${v.deadline}.`,
      v.payment,
      v.signature,
    ),
  }),
}

function firmCommercial(v) {
  return [
    `${v.you("Te", "Le")} recuerdo que, en las operaciones entre empresas y profesionales, la Ley 3/2004 de lucha contra la morosidad reconoce al acreedor, sin necesidad de aviso previo, el derecho a cobrar intereses de demora (a día de hoy, ${v.interest}) y una indemnización de 40 € por costes de cobro.`,
    "",
    v.ctx.waiveExtras
      ? `No quiero tener que reclamarlos: si el pago de ${v.outstanding} se realiza antes del ${v.deadline}, renuncio a ambos conceptos.`
      : `${v.you("Te", "Le")} pido que el pago, que a día de hoy asciende a ${v.claimable} con esos conceptos, se realice antes del ${v.deadline}.`,
  ]
}

function firmConsumer(v) {
  return [`${v.you("Te", "Le")} pido que el pago se realice antes del ${v.deadline}.`]
}

function formalLetter(v) {
  const profile = v.ctx.profile
  const client = v.ctx.invoice.client
  const claim = v.ctx.claim
  const rows = claim.commercial
    ? [
        `- Principal pendiente: ${v.outstanding}`,
        `- Intereses de demora (art. 7 de la Ley 3/2004), devengados desde el ${formatDate(claim.interestStart)}: ${v.interest}`,
        `- Indemnización por costes de cobro (art. 8 de la Ley 3/2004): ${formatMoney(claim.compensation)}`,
        `- TOTAL: ${v.claimable}`,
      ]
    : [
        `- Principal pendiente: ${v.outstanding}`,
        claim.interestStart
          ? `- Intereses legales (art. 1108 del Código Civil) desde la reclamación del ${formatDate(claim.interestStart)}: ${v.interest}`
          : "- Intereses legales (art. 1108 del Código Civil): desde la recepción de este requerimiento",
        `- TOTAL: ${v.claimable}`,
      ]
  return {
    subject: `Requerimiento de pago e invitación a negociar – Factura ${v.number}`,
    body: lines(
      "REQUERIMIENTO DE PAGO E INVITACIÓN A NEGOCIAR",
      "",
      `Remitente: ${profile.name || "[tu nombre o razón social]"}, NIF ${profile.taxId || "[NIF]"}, ${profile.address || "[domicilio]"}`,
      `Destinatario: ${client.name}${client.taxId ? `, NIF/CIF ${client.taxId}` : ""}${client.address ? `, ${client.address}` : ", [domicilio del destinatario]"}`,
      "",
      `En ${profile.city || "[localidad]"}, a ${formatLongDate(v.ctx.asOf)}.`,
      "",
      `Por medio del presente escrito le requiero formalmente el pago de la cantidad que se detalla a continuación, derivada de la factura n.º ${v.number}, emitida el ${v.issue} por ${v.concept}, con vencimiento el ${v.due}, que a la fecha permanece impagada pese a las comunicaciones previas.`,
      "",
      `DETALLE DE LA DEUDA A ${formatDate(v.ctx.asOf)}`,
      ...rows,
      "Los intereses continúan devengándose hasta la fecha del pago efectivo.",
      "",
      `El pago puede realizarse mediante transferencia${profile.iban ? ` a la cuenta ${profile.iban}` : ""}, indicando como concepto «Factura ${v.number}», en el plazo de ${v.deadlineDays} días naturales desde la recepción de este escrito.`,
      "",
      "PROPUESTA DE NEGOCIACIÓN",
      "Con el fin de resolver esta controversia sin acudir a los tribunales, y a los efectos del intento de negociación previa previsto en la Ley Orgánica 1/2025, de 2 de enero, de medidas en materia de eficiencia del Servicio Público de Justicia, le invito a negociar una solución. Estoy abierto a valorar, entre otras:",
      v.ctx.waiveExtras && claim.commercial
        ? `a) El pago del principal (${v.outstanding}) en el plazo indicado, en cuyo caso renunciaría a los intereses y a la indemnización.`
        : `a) El pago íntegro de la cantidad reclamada en el plazo indicado.`,
      "b) Un calendario de pagos razonable, que podemos acordar por escrito.",
      "c) Una reunión o llamada para aclarar cualquier discrepancia sobre la factura o el servicio.",
      "",
      `Puede responder a este requerimiento por escrito${profile.email ? ` en ${profile.email}` : ""}${profile.phone ? ` o en el teléfono ${profile.phone}` : ""}. Si en el plazo de treinta días naturales desde la recepción de este escrito no obtengo respuesta, o no se alcanza un acuerdo, me reservo el derecho a ejercitar las acciones judiciales que correspondan, incluida la petición de procedimiento monitorio, para reclamar la totalidad de la deuda, sus intereses y los costes.`,
      "",
      "Atentamente,",
      "",
      profile.name || "[Firma]",
      "",
      `Documentación que se acompaña: copia de la factura n.º ${v.number}.`,
    ),
  }
}

function paymentBlock(profile, number) {
  if (!profile.iban) return ""
  return `\nDatos para la transferencia:\nIBAN: ${profile.iban}\nConcepto: Factura ${number}\n`
}

function signature(profile) {
  return `\n${profile.formal ? "Un saludo cordial" : "Gracias y un saludo"},\n${profile.name || "[Tu nombre]"}${profile.phone ? `\n${profile.phone}` : ""}`
}

// Con persona de contacto se saluda por su nombre de pila (o completo si es formal);
// sin ella, por el nombre del cliente tal cual, para no saludar "Hola Estudio:".
function greeting(client, formal) {
  const contact = client.contact || (client.type === "particular" ? client.name : "")
  if (!contact) return formal ? `Estimado equipo de ${client.name}:` : `Hola, equipo de ${client.name}:`
  return formal ? `Estimado/a ${contact}:` : `Hola, ${contact.split(/\s+/)[0]}:`
}

function lines(...parts) {
  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}
