import { test } from "node:test"
import assert from "node:assert/strict"
import { importInvoicesCsv, parseCsv, toIso } from "../app/src/domain/csv.js"

test("parses semicolons, quotes, escaped quotes and embedded newlines", () => {
  assert.deepEqual(parseCsv('a;b;c\n"x; y";"di ""hola""";"línea\nnueva"\n'), [
    ["a", "b", "c"],
    ["x; y", 'di "hola"', "línea\nnueva"],
  ])
})

test("detects comma separators and CRLF line endings", () => {
  assert.deepEqual(parseCsv("a,b\r\n1,2\r\n"), [
    ["a", "b"],
    ["1", "2"],
  ])
})

test("imports a typical Spanish invoicing export", () => {
  const csv = [
    "Número;Cliente;NIF;Fecha;Vencimiento;Total;Estado",
    "F-001;Estudio Norte SL;B00000000;01/03/2025;31/03/2025;1.210,00;Pendiente",
    "F-002;Café Sur;B11111111;05/03/2025;;363,00;Pendiente",
    "F-003;Pagador SL;B22222222;06/03/2025;;100,00;Cobrada",
    "F-004;;B33333333;07/03/2025;;100,00;Pendiente",
  ].join("\n")
  const result = importInvoicesCsv(csv, { defaultTermDays: 30 })
  assert.equal(result.invoices.length, 2)
  assert.equal(result.skipped, 1)
  assert.deepEqual(result.errors.map((e) => e.line), [5])
  assert.equal(result.invoices[0].amount, 1210)
  assert.equal(result.invoices[0].dueDate, "2025-03-31")
  assert.equal(result.invoices[1].dueDate, "2025-04-04")
  assert.equal(result.invoices[0].client.taxId, "B00000000")
})

test("reports missing required columns", () => {
  const result = importInvoicesCsv("Cliente;Total\nA;10", { defaultTermDays: 30 })
  assert.equal(result.invoices.length, 0)
  assert.match(result.errors[0].messages[0], /número de factura/)
})

test("normalizes common date formats", () => {
  assert.equal(toIso("1/2/2025"), "2025-02-01")
  assert.equal(toIso("01.02.25"), "2025-02-01")
  assert.equal(toIso("2025-02-01"), "2025-02-01")
  assert.equal(toIso("31/02/2025"), "")
})
