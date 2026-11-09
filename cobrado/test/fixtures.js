import { parseInvoice } from "../app/src/domain/model.js"

export function invoice(overrides = {}) {
  const parsed = parseInvoice({
    number: "2025-014",
    concept: "Diseño de identidad visual",
    amount: 1000,
    issueDate: "2025-05-21",
    dueDate: "2025-06-20",
    ...overrides,
    client: { name: "Estudio Norte SL", contact: "Lucía Martín", type: "empresa", ...overrides.client },
  })
  if (!parsed.ok) throw new Error(parsed.errors.join(" "))
  return parsed.invoice
}

export const profile = {
  name: "Alex Ruiz",
  taxId: "00000000T",
  address: "Calle Ejemplo 1, 28000 Madrid",
  city: "Madrid",
  email: "alex@example.com",
  phone: "600 000 000",
  iban: "ES00 0000 0000 0000 0000 0000",
  formal: false,
}
