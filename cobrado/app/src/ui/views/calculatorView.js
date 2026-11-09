import { claimSettings, today } from "../../store.js"
import { calculator } from "../components.js"
import { h } from "../dom.js"

export function calculatorView() {
  return h(
    "div",
    { class: "stack narrow" },
    h("h1", null, "Calculadora de intereses y costes de cobro"),
    h(
      "p",
      { class: "lead" },
      "Calcula al momento cuánto puedes reclamar por una factura pagada tarde: intereses de demora por semestres y la indemnización fija de 40 €. No se guarda nada.",
    ),
    h("section", { class: "card" }, calculator({ asOf: today(), rates: claimSettings().rates })),
  )
}
