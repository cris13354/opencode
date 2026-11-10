import { test } from "node:test"
import assert from "node:assert/strict"
import { computeClaim } from "../app/src/domain/claim.js"
import { renderTemplate } from "../app/src/domain/templates.js"
import { invoice, profile } from "./fixtures.js"

function render(stage, inv, asOf, extra = {}) {
  return renderTemplate(stage, { profile, invoice: inv, claim: computeClaim(inv, asOf), asOf, ...extra })
}

test("the firm notice cites the late-payment law and the real figures for businesses", () => {
  const text = render("firm", invoice(), "2025-07-10").body
  assert.match(text, /Hola, Lucía:/)
  assert.match(text, /Ley 3\/2004/)
  assert.match(text, /5,84\s€/)
  assert.match(text, /1045,84\s€/)
  assert.match(text, /17\/07\/2025/)
})

test("the firm notice can offer to waive interest and compensation", () => {
  const text = render("firm", invoice(), "2025-07-10", { waiveExtras: true }).body
  assert.match(text, /renuncio a ambos conceptos/)
})

test("consumers never get the Ley 3/2004 wording", () => {
  const text = render("firm", invoice({ client: { name: "Juan Pérez", contact: "", type: "particular" } }), "2025-07-10").body
  assert.doesNotMatch(text, /Ley 3\/2004/)
  assert.match(text, /Hola, Juan:/)
})

test("the formal demand includes the breakdown and the LO 1/2025 negotiation offer", () => {
  const letter = render("masc", invoice(), "2025-07-30")
  assert.match(letter.subject, /Requerimiento de pago/)
  assert.match(letter.body, /Ley Orgánica 1\/2025/)
  assert.match(letter.body, /art\. 8 de la Ley 3\/2004\): 40,00\s€/)
  assert.match(letter.body, /treinta días naturales/)
  assert.match(letter.body, /ES00 0000/)
})

test("formal address switches the register", () => {
  const inv = invoice()
  const text = renderTemplate("reminder", { profile: { ...profile, formal: true }, invoice: inv, claim: computeClaim(inv, "2025-06-22"), asOf: "2025-06-22" }).body
  assert.match(text, /Estimado\/a Lucía Martín:/)
  assert.match(text, /Me puede confirmar/)
})
