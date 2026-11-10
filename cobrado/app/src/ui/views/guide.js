import { STAGES } from "../../domain/escalation.js"
import { h } from "../dom.js"

const SOURCES = [
  ["Ley 3/2004, de lucha contra la morosidad en las operaciones comerciales", "https://www.boe.es/buscar/act.php?id=BOE-A-2004-21007"],
  ["Ley Orgánica 1/2025, de medidas en materia de eficiencia del Servicio Público de Justicia", "https://www.boe.es/buscar/act.php?id=BOE-A-2025-76"],
  ["Ley de Enjuiciamiento Civil (proceso monitorio, arts. 812 a 818)", "https://www.boe.es/buscar/act.php?id=BOE-A-2000-323"],
  ["Tipo de interés de demora, 2.º semestre de 2025 (BOE-A-2025-13217)", "https://www.boe.es/boe/dias/2025/06/28/pdfs/BOE-A-2025-13217.pdf"],
  ["Tipo de interés de demora, 2.º semestre de 2026 (BOE-A-2026-14327)", "https://www.boe.es/boe/dias/2026/07/01/pdfs/BOE-A-2026-14327.pdf"],
]

export function guideView() {
  return h(
    "div",
    { class: "stack narrow prose" },
    h("h1", null, "Guía para cobrar una factura impagada"),
    h(
      "p",
      { class: "lead" },
      "Resumen práctico de cómo funciona la reclamación de una factura en España y de lo que hace Cobrado en cada paso. Es información general, no asesoramiento jurídico: ante dudas sobre tu caso, consulta con un abogado o tu gestoría.",
    ),

    h("h2", null, "1. La escalera de Cobrado"),
    h(
      "ol",
      { class: "ladder" },
      STAGES.map((stage) =>
        h(
          "li",
          null,
          h("strong", null, stage.title),
          h("span", { class: "sub" }, stage.offset < 0 ? ` · ${-stage.offset} días antes del vencimiento` : ` · desde el día ${stage.offset} de retraso`),
          h("p", null, stage.goal),
        ),
      ),
      h(
        "li",
        null,
        h("strong", null, "Procedimiento monitorio"),
        h("span", { class: "sub" }, " · tras el plazo de respuesta al requerimiento"),
        h("p", null, "Reclamación judicial sencilla para deudas documentadas. Cobrado te prepara el expediente y la lista de documentos."),
      ),
    ),
    h("p", null, "Los plazos son una propuesta razonable, no obligaciones legales. Si el cliente promete pagar, acuerda un plan o plantea una discrepancia, la escalera se pausa hasta que toque retomarla."),

    h("h2", null, "2. Si tu cliente es una empresa, un autónomo o una Administración"),
    h(
      "ul",
      null,
      h("li", null, h("strong", null, "Plazo de pago. "), "Sin pacto, 30 días desde la entrega o prestación. Por acuerdo puede ampliarse, pero no por encima de 60 días (Ley 3/2004, art. 4)."),
      h("li", null, h("strong", null, "Intereses automáticos. "), "Desde el día siguiente al vencimiento se deben intereses de demora sin necesidad de avisar (art. 5). Si no se pactó otro, el tipo legal es el del BCE más 8 puntos, publicado cada semestre en el BOE (art. 7)."),
      h("li", null, h("strong", null, "40 € por factura. "), "Además, una cantidad fija de 40 € por costes de cobro por cada factura pagada tarde (art. 8). El Tribunal Supremo (STS 612/2021) entendió que se aplica a cada factura."),
      h("li", null, h("strong", null, "Cláusulas abusivas. "), "Los pactos que excluyen los intereses o la indemnización, o que alargan el plazo de forma abusiva, pueden ser nulos (art. 9)."),
      h("li", null, h("strong", null, "Administraciones públicas. "), "También están sujetas a la Ley 3/2004, con los plazos de aprobación y pago de la Ley de Contratos del Sector Público."),
    ),
    h("p", null, "Que tengas el derecho no obliga a ejercerlo: muchos profesionales ofrecen renunciar a intereses y a los 40 € si el cliente paga ya. Cobrado te permite incluir esa oferta en el aviso firme y en el requerimiento."),

    h("h2", null, "3. Si tu cliente es un particular"),
    h("p", null, "La Ley 3/2004 no se aplica a consumidores. No hay 40 € de costes de cobro y el interés que corre es el interés legal del dinero, desde que le reclamas el pago (arts. 1100 y 1108 del Código Civil). Cobrado lo calcula desde el primer aviso firme o requerimiento registrado."),

    h("h2", null, "4. El intento de negociación previa (MASC)"),
    h(
      "p",
      null,
      "Desde el 3 de abril de 2025, la Ley Orgánica 1/2025 exige, con carácter general, acreditar que se ha intentado una solución negociada antes de presentar una demanda civil, y las fuentes consultadas indican que esto incluye el monitorio. Si falta, la demanda puede inadmitirse.",
    ),
    h(
      "ul",
      null,
      h("li", null, "El requerimiento debe identificar la deuda (lo mismo que luego reclamarás) e invitar a negociar."),
      h("li", null, "Conviene un medio que acredite contenido, fecha y recepción: burofax con certificación de contenido y acuse de recibo, requerimiento notarial o similar. Hay juzgados que han admitido un burofax no recogido y otros más exigentes."),
      h("li", null, "Si en 30 días naturales desde la recepción no hay respuesta, se suele entender intentado. Los criterios sobre el cómputo no están unificados: por eso Cobrado muestra esa fecha como orientativa."),
    ),

    h("h2", { id: "monitorio" }, "5. El procedimiento monitorio"),
    h(
      "ul",
      null,
      h("li", null, "Sirve para reclamar deudas de dinero vencidas, exigibles y documentadas (una factura lo es, mejor si va acompañada de pruebas del encargo y la entrega). No tiene límite de cuantía."),
      h("li", null, "Se presenta en el Juzgado de Primera Instancia del domicilio del deudor. Hay formularios normalizados de petición."),
      h("li", null, "La petición inicial no necesita abogado ni procurador. Si el deudor se opone y la cuantía supera 2.000 €, sí los necesitarás para continuar."),
      h("li", null, "El juzgado requiere al deudor para que pague o se oponga. Si no hace ninguna de las dos cosas, se puede pedir la ejecución."),
      h("li", null, "Adjunta la factura, las pruebas de la relación y del servicio, tus comunicaciones y la acreditación del intento de negociación. El expediente de Cobrado ordena todo esto."),
    ),

    h("h2", null, "6. El IVA de las facturas que no cobras"),
    h("p", null, "Si declaraste el IVA de una factura que no cobras, la ley del IVA permite en determinados casos recuperarlo modificando la base imponible (art. 80 LIVA), con plazos y requisitos estrictos (entre ellos, haber reclamado judicialmente o por requerimiento notarial). Coméntalo con tu gestoría en cuanto la factura acumule meses de retraso."),

    h("h2", null, "Fuentes"),
    h("ul", null, SOURCES.map(([label, url]) => h("li", null, h("a", { href: url, target: "_blank", rel: "noopener" }, label)))),
    h(
      "p",
      { class: "fine" },
      "Cobrado no envía nada por ti ni presenta escritos en ningún juzgado. Los textos son borradores que puedes editar. Revisa siempre las cifras y los plazos antes de usarlos.",
    ),
  )
}
