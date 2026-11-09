# Fase 2 · Selección

## Las tres finalistas

1. **Reclamación de facturas impagadas B2B** (problema 1)
2. **Reserva de impuestos y cuota de autónomos** (problema 2)
3. **Alérgenos y escandallos para hostelería pequeña** (problema 3)

## Puntuación (1 = peor, 5 = mejor)

Las puntuaciones son juicios razonados, no mediciones. Lo que se basa en hipótesis se indica abajo.

| Criterio                         | Facturas impagadas | Impuestos autónomos | Alérgenos hostelería |
| -------------------------------- | :----------------: | :-----------------: | :------------------: |
| Facilidad de desarrollo          |         5          |          3          |          4           |
| Coste inicial                    |         5          |          5          |          4           |
| Competencia (5 = poca)           |         3          |          2          |          3           |
| Intensidad del problema          |         4          |          4          |          3           |
| Facilidad de primeros usuarios   |         4          |          4          |          3           |
| Potencial de ingresos recurrentes|         3          |          4          |          4           |
| Posibilidad de crecer            |         4          |          3          |          3           |
| **Total (sobre 35)**             |       **28**       |       **25**        |        **24**        |

### Justificación

**Facturas impagadas**

- *Desarrollo (5)*: la lógica (intereses por semestre, escalera, plantillas) se puede construir y probar entera sin servidor, sin pasarelas de pago y sin servicios externos.
- *Coste (5)*: cero euros para el MVP; hospedaje estático gratuito cuando se decida publicar.
- *Competencia (3)*: hay recordatorios en todos los programas de facturación, pero no he encontrado una herramienta para autónomos que cubra la escalada legal ni el requisito de negociación previa de la LO 1/2025. *Hipótesis a validar*: que esa diferencia importe lo suficiente al usuario.
- *Intensidad (4)*: dato de la PMcM (67 días de media en el sector privado frente a un máximo legal de 60). Es dinero ya ganado y no cobrado, con impacto directo en la caja.
- *Primeros usuarios (4)*: el usuario es fácil de encontrar (comunidades de freelancers, coworkings, gestorías) y se le puede ofrecer algo útil gratis desde el primer minuto (la calculadora).
- *Recurrencia (3)*: **es el punto débil.** El impago es episódico: hay meses sin ninguno. Por eso la propuesta de monetización combina suscripción y pago por expediente.
- *Crecimiento (4)*: canal de gestorías, importación desde programas de facturación, y la factura electrónica B2B (RD 238/2026), que registrará el estado de pago y puede automatizar la detección de impagos.

**Impuestos de autónomos**

- Problema muy extendido (regularización de 2023: unos 800.000 autónomos cotizaron de menos), pero las reglas cambian cada año, un error tiene consecuencias económicas para el usuario y compiten empresas con financiación y producto fiscal completo. Desarrollo más arriesgado (3) y competencia alta (2).

**Alérgenos y escandallos**

- Obligación legal clara y uso recurrente (cada cambio de carta), pero la urgencia percibida es baja hasta que hay una inspección (*hipótesis*), la venta tiende a ser presencial y la competencia en software de cocina existe. Conseguir los primeros usuarios exige ir local a local.

## Ganadora: reclamación de facturas impagadas (nombre de trabajo: **Cobrado**)

Por qué:

1. **Hay un "por qué ahora" concreto y comprobable.** Desde el 3 de abril de 2025, la LO 1/2025 exige acreditar un intento de negociación antes de demandar. Para un autónomo que nunca ha reclamado una factura, eso añade una trampa nueva: si salta directamente al monitorio, puede no admitirse. Es un cambio reciente que las herramientas existentes no explican.
2. **El valor se demuestra en segundos.** La calculadora enseña al usuario dinero que no sabía que podía reclamar (intereses y 40 € por factura). Esto sirve a la vez de gancho de captación y de prueba de utilidad.
3. **Se puede construir bien y gratis.** Todo funciona en el navegador; no hace falta tocar datos de terceros ni contratar servicios.
4. **No es un clon.** No compite con el programa de facturación: trabaja después de él, en la parte que esos programas dejan sin cubrir (escalada, derechos legales, prueba documental, monitorio).
5. **Riesgo principal identificado y acotado.** La recurrencia es dudosa; se valida con dos modelos de precio a la vez (suscripción y pago por expediente) y con el canal de gestorías.

## Oportunidades descartadas y por qué

| Oportunidad | Motivo del descarte |
| --- | --- |
| Impuestos de autónomos | Competencia con financiación, reglas cambiantes y responsabilidad por errores de cálculo. Buena segunda opción si la ganadora no se valida. |
| Alérgenos y escandallos | Urgencia percibida baja y venta presencial lenta; requiere otro tipo de fundador (relación con hostelería). |
| No-shows en citas | Mercado saturado con planes gratuitos (Booksy, Treatwell, SimplyBook.me…). |
| Verifactu | Lo resuelven los proveedores de facturación; exige asumir responsabilidad de cumplimiento; fechas que se mueven. |
| Factura electrónica B2B | Interoperabilidad compleja y competidores grandes. Se aprovechará como palanca futura de Cobrado. |
| Documentación de clientes | Sin datos que respalden la demanda en España y con un producto internacional casi idéntico. |
| Presupuestos para oficios | Mercado cubierto y diferenciación difícil. |
| Reseñas de Google | La IA generativa lo ha convertido en una función, no en un producto. |
| Suscripciones de consumidores | Poca disposición a pagar y los bancos lo ofrecen gratis. |
