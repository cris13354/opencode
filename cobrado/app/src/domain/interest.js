import { fromDay, semesterStartsBetween, toDay } from "./dates.js"
import { rateFor } from "./rates.js"

/**
 * Interés simple devengado entre `start` (exclusive) y `end` (inclusive), base 365.
 * Cada día devenga sobre el saldo pendiente al empezar ese día: un pago fechado el
 * día P sigue devengando ese día y reduce el saldo a partir de P + 1, de modo que
 * los días de retraso de un pago son P - vencimiento.
 * Los tramos se cortan en cada cambio de semestre (cambia el tipo) y en cada pago.
 *
 * @param {{ amount: number, payments: { date: string, amount: number }[], start: string, end: string, rates: { from: string, rate: number, verified?: boolean }[] }} input
 */
export function accrueInterest(input) {
  const startDay = toDay(input.start)
  const endDay = toDay(input.end)
  if (endDay <= startDay) return { total: 0, segments: [] }

  const cuts = [
    ...semesterStartsBetween(input.start, input.end).map(toDay),
    ...input.payments.map((payment) => toDay(payment.date) + 1),
  ].filter((day) => day > startDay + 1 && day <= endDay)
  const bounds = [...new Set([startDay + 1, ...cuts, endDay + 1])].sort((a, b) => a - b)

  const segments = bounds.slice(0, -1).flatMap((from, i) => {
    const to = bounds[i + 1]
    const balance = balanceOn(from, input.amount, input.payments)
    if (balance <= 0) return []
    const rate = rateFor(fromDay(from), input.rates)
    const days = to - from
    return [
      {
        from: fromDay(from),
        to: fromDay(to - 1),
        days,
        balance: round2(balance),
        rate: rate.rate,
        estimated: rate.estimated,
        verified: rate.verified,
        interest: (balance * rate.rate * days) / 36_500,
      },
    ]
  })

  return {
    total: round2(segments.reduce((sum, segment) => sum + segment.interest, 0)),
    segments: segments.map((segment) => ({ ...segment, interest: round2(segment.interest) })),
  }
}

function balanceOn(day, amount, payments) {
  return amount - payments.filter((payment) => toDay(payment.date) < day).reduce((sum, p) => sum + p.amount, 0)
}

export function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
