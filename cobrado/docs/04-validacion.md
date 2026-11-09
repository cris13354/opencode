# Fase 4 · Validación

Todo lo de este documento son **hipótesis a contrastar**. No hay clientes, testimonios ni resultados todavía.

## Propuesta de valor

> **Cobra tus facturas atrasadas sin pelearte con el cliente.**
> Cobrado te dice qué mensaje enviar cada día, calcula los intereses y los 40 € que te reconoce la ley y, si nada funciona, te deja listo el requerimiento formal y el expediente para reclamar en el juzgado.

Versión corta para redes: *"Te deben una factura. Cobrado te dice qué decir, cuándo y cuánto puedes exigir por ley."*

Tres beneficios, en orden:

1. **Saber qué hacer hoy** sin pensar en cómo insistir (la escalera y los borradores).
2. **Cobrar más de lo que creías** (intereses y 40 € que la mayoría no reclama: *hipótesis*).
3. **No equivocarte si toca ir al juzgado** (requerimiento con invitación a negociar y expediente).

La landing está en `index.html`. Cómo funciona el producto: `docs/03-producto.md` y la sección "Cómo funciona" de la landing.

## Perfil de cliente ideal (ICP)

**Primario: profesional independiente o micropyme de servicios que factura a empresas.**

- Autónomo o sociedad de 1 a 5 personas; sin departamento de administración.
- Factura a otras empresas o a la Administración (la Ley 3/2004 le protege).
- Sectores: diseño, desarrollo web, marketing, consultoría, traducción, fotografía y vídeo, formación, arquitectura técnica, oficios que trabajan para constructoras o promotoras.
- Entre 1 y 20 facturas al mes; importes típicos de 300 a 10.000 €.
- **Ha tenido al menos una factura con más de 30 días de retraso en los últimos 12 meses** (condición para entrevistarle).
- Usa un programa de facturación o Excel; escribe a sus clientes por email y WhatsApp.

**Canal secundario: gestorías y asesorías pequeñas** que ya ayudan a sus clientes con los impagos y podrían ofrecer Cobrado.

**No es para (por ahora):** quien factura sobre todo a particulares, empresas con equipo de finanzas o ERP, ni cobros domiciliados recurrentes.

## Estrategia para los primeros 10 usuarios de prueba

Objetivo: **10 personas que usen Cobrado con al menos una factura real en 14 días.** Sin gastar dinero. Todas las acciones externas las haces tú (yo no he contactado con nadie ni he publicado nada).

1. **Red propia (objetivo: 5 usuarios).** Haz una lista de 30 personas de tu entorno que encajen en el ICP. Mensaje personal (no masivo):
   > "Hola, [nombre]. Estoy probando una herramienta para cobrar facturas que se retrasan: te dice qué mensaje enviar en cada momento y calcula los intereses y los 40 € que te reconoce la ley. ¿Te ha pasado este año que un cliente te pagara tarde? Si es así, me ayudaría mucho que la probaras 15 minutos conmigo. No tienes que registrarte y tus datos se quedan en tu ordenador."
2. **Sesiones acompañadas (concierge).** Con cada persona que diga que sí: videollamada de 30 minutos en la que mete una factura real atrasada y prepara el siguiente mensaje. Observa sin ayudar. Anota dónde se atasca.
3. **Comunidades (objetivo: 3 usuarios).** Una publicación útil (no publicitaria) en 2 o 3 comunidades de freelancers de tu sector (grupos de LinkedIn, Slack/Discord de diseño o desarrollo, foros de autónomos). Tema: "El 40 € por factura que casi nadie reclama: así se calcula". Ofrece la calculadora y la prueba. Requiere publicar la landing (decisión tuya).
4. **Gestorías (objetivo: 2 usuarios indirectos).** Visita o escribe a 5 gestorías de tu zona. Pregunta cómo gestionan hoy los impagos de sus clientes y si alguno aceptaría probarlo. Una gestoría interesada vale más que diez usuarios sueltos.
5. **Coworkings locales.** Pide permiso para dejar un cartel o hacer una charla de 20 minutos sobre "cómo reclamar una factura sin abogado".

**Criterios de éxito tras 14 días** (fija tú los umbrales antes de empezar para no autoengañarte):

| Señal | Umbral propuesto |
| --- | --- |
| Usuarios con al menos una factura real | ≥ 10 |
| Usuarios que envían al menos un mensaje generado | ≥ 5 |
| Usuarios que vuelven sin que se lo recuerdes | ≥ 3 |
| Usuarios que, sin presión, dicen que pagarían una cantidad concreta | ≥ 3 |
| Compromisos reales (preventa o pago por un expediente) | ≥ 1 |

Si no se alcanza la mitad de estos umbrales, revisa la oportunidad antes de seguir construyendo.

## Preguntas para entrevistar a clientes potenciales

Pregunta por hechos pasados, no por opiniones sobre el futuro. No enseñes el producto hasta el final.

**Contexto**
1. ¿A qué te dedicas y a qué tipo de clientes facturas?
2. ¿Cuántas facturas emites en un mes normal y de qué importe aproximado?

**Último caso real**
3. Cuéntame la última vez que un cliente te pagó tarde. ¿Cuánto era y cuánto tardó?
4. ¿Qué hiciste, paso a paso? ¿Cuántas veces escribiste o llamaste?
5. ¿Qué fue lo más incómodo o lo que más tiempo te llevó?
6. ¿Llegaste a pensar en reclamar formalmente? ¿Qué te frenó?
7. ¿Cómo terminó? ¿Perdiste algo (dinero, el cliente, tiempo)?

**Conocimiento y herramientas**
8. ¿Sabías que entre empresas puedes reclamar intereses y 40 € por factura? ¿Lo has hecho alguna vez?
9. ¿Qué usas hoy para controlar quién te debe? ¿Tu programa de facturación envía recordatorios? ¿Los usas?
10. ¿Has pagado alguna vez a una gestoría, abogado o agencia por un impago? ¿Cuánto?

**Valor y precio** (solo al final)
11. Si algo te hubiera dicho qué mensaje enviar en cada momento y te hubiera preparado el requerimiento, ¿qué habría cambiado en ese caso?
12. ¿Qué tendría que hacer una herramienta así para que la usaras en tu próximo impago?
13. Entre 9 €/mes, 19 € por factura reclamada o nada, ¿qué elegirías? ¿Por qué?
14. ¿A partir de qué precio te parecería caro? ¿Y tan barato que no te fiarías?
15. ¿Conoces a alguien que esté ahora mismo persiguiendo una factura? ¿Me lo presentarías?

## Propuesta de monetización a validar

| Modelo | Precio hipótesis | A quién | Cómo validarlo sin cobrar todavía |
| --- | --- | --- | --- |
| **Gratis** | 0 € | Todos | Calculadora y hasta 2 facturas en seguimiento: captación. |
| **Pro (suscripción)** | 9 €/mes o 79 €/año | Quien tiene impagos varias veces al año | Pregunta 13 y elección en el formulario de la landing. |
| **Por expediente** | 19 € pago único | Quien tiene un impago puntual | Ofrecer a los usuarios de prueba que lleguen al requerimiento formal: "¿pagarías 19 € por este expediente?". Una preventa real, aunque sea por Bizum entre conocidos, vale más que diez "sí, lo pagaría". |
| **Gestorías (B2B2C)** | Hipótesis: 39–59 €/mes por despacho | Gestorías que acompañan a sus clientes | Entrevistas a 5 gestorías antes de fijar nada. |

**Por qué estos números (razonamiento, no datos):** 9 €/mes está en la franja de los programas de facturación que ya paga el usuario (según comparativas de terceros, entre unos 7 y 14 €/mes) y es una fracción de los 40 € por factura que la propia herramienta ayuda a reclamar. 19 € por expediente está por debajo de lo que costaría una hora de un profesional (*hipótesis*). Todo esto debe sustituirse por lo que digan las entrevistas.

**Qué no hacer todavía:** pasarela de pago, cuentas de usuario o un servidor. Primero hay que demostrar que alguien vuelve y que alguien paga.
