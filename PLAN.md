# PLAN de producto — QuizLab

> Documento vivo. **Nada de lo que aparece aquí está validado con usuarios reales todavía.**
> Marco con **[Hecho]** lo comprobado y con **[Hipótesis]** lo que es mi estimación y hay que validar.

---

## 1. Elección de la idea

### Puntuaciones (1 = malo, 5 = excelente; en complejidad y costes, 5 = más fácil/barato)

| Criterio | A · QuizLab | B · ProfileKit | C · TrendForge | D · (propia: plantillas de propuestas para freelancers) |
| --- | :-: | :-: | :-: | :-: |
| 1. Problema y valor | 3 | 3 | 2 | 4 |
| 2. Facilidad de conseguir primeros usuarios | 4 | 2 | 3 | 2 |
| 3. Viralidad / recomendación orgánica | **5** | 2 | 4 | 1 |
| 4. Clientes que paguen | 4 | 3 | 2 | 4 |
| 5. Ingresos recurrentes | 3 | 3 | 2 | 3 |
| 6. Complejidad para principiante | 4 | 3 | 2 | 4 |
| 7. Costes de desarrollo y mantenimiento | **5** | 3 | 2 | 4 |
| 8. Competencia y diferenciación | 3 | 1 | 1 | 2 |
| 9. Tiempo hasta un MVP útil | 5 | 3 | 3 | 4 |
| 10. Riesgos (técnicos, comerciales, legales) | 3 | 4 | 1 | 4 |
| **Total (sobre 50)** | **39** | **27** | **22** | **32** |

Son puntuaciones de criterio propio, **no datos de mercado**.

### Justificación breve

- **A · QuizLab (elegida).** Es la única idea en la que **usar el producto ya es distribuirlo**: cada resultado compartido es un anuncio gratuito con un botón «haz el test». Además existe un mercado de pago probado para tests de captación de clientes. **[Hecho, según webs comparativas, sin verificar en las webs oficiales]:** Interact cuesta unos 27–125 $/mes, ScoreApp tiene planes de 39–149 $/mes con plan gratuito limitado y uQuiz ofrece un plan gratuito más uno de pago de unos 10 $/mes. Estas herramientas están pensadas sobre todo para el mercado anglosajón. **[Hipótesis]:** hay hueco para una herramienta en español, sencilla y centrada en Instagram/TikTok/WhatsApp. Técnicamente es viable sin base de datos (coste 0 €).
- **B · ProfileKit.** Mercado saturado (Linktree, Carrd, Beacons, about.me…) y difícil de diferenciar. Necesita cuentas, base de datos y alojamiento de páginas desde el día 1. La generación de biografías dependería de APIs de IA de pago.
- **C · TrendForge.** Alternativas gratuitas muy fuertes (Canva, Imgflip, CapCut). Las plantillas de memes conllevan **riesgo de derechos de autor**. Los usuarios casuales pagan poco y la generación con IA tendría costes variables.
- **D · Propia (plantillas de propuestas comerciales para freelancers).** Problema real y disposición a pagar, pero **sin viralidad**: requeriría marketing de pago o SEO lento, lo contrario de lo que pides.

---

## 2. Definición del producto

| | |
| --- | --- |
| **Nombre provisional** | QuizLab. Antes de invertir en marca, comprobar marcas registradas y dominios: ya existen productos con nombres parecidos. |
| **Público inicial** | Creadores de contenido, coaches/formadores y pequeños negocios **hispanohablantes** que usan Instagram, TikTok y WhatsApp. |
| **Problema** | Necesitan contenido que genere interacción y alcance, y no tienen tiempo ni presupuesto para herramientas en inglés de 30–100 $/mes. |
| **Propuesta de valor** | «Crea en 10 minutos un test que tu audiencia quiere compartir, y gana seguidores con cada resultado.» |
| **Diferenciación** | En español. Sin registro para empezar. Tarjeta lista para **Stories (1080×1920)**. Mecánica de «reto» con nombre. Gratis de verdad para crear y compartir. |
| **Función que debe funcionar perfectamente** | Hacer un test → ver un resultado atractivo → compartirlo en un toque. |

### Funcionalidades del MVP (implementadas)

1. Jugar tests (personalidad y conocimientos) con buena experiencia móvil.
2. Resultado compartible con imagen Open Graph y descarga para Stories.
3. Editor con plantillas, validación clara, vista previa y publicación por enlace.
4. Catálogo de 4 tests de ejemplo para distintos públicos.
5. Página de precios con prueba de interés honesta y analítica de eventos sin cookies.

### Lo que deliberadamente NO hay todavía

Cuentas de usuario, base de datos, pagos, captación de emails, estadísticas por test, IA para generar tests, comentarios o funciones sociales, moderación, idiomas distintos del español.

---

## 3. Monetización **[Hipótesis]**

| Plan | Precio de prueba | Para quién | Qué incluye |
| --- | --- | --- | --- |
| Gratis | 0 € | Todos | Tests ilimitados, tarjetas, marca «Hecho con QuizLab» (la marca es un canal de adquisición). |
| Pro | **9 €/mes** (o 79 €/año) | Creadores y coaches | **Captación de emails** antes del resultado (el valor principal), estadísticas, sin marca, logo propio, enlaces cortos editables. |
| Negocio | 29 €/mes | Pequeñas empresas y agencias | Integraciones (Mailchimp/Brevo/webhooks), dominio propio, equipo. |

- **Límites del gratis que no estropean la experiencia:** nunca limitar a quien *juega*. Lo de pago es lo que aporta valor de negocio al creador (emails, datos, marca).
- **Costes variables por usuario [Estimación]:** prácticamente 0. Los PNG se cachean. Con Vercel Pro (20 $/mes) y Supabase gratis, el margen bruto supera el 90 % a partir de unos 5 clientes de pago.
- **Punto de equilibrio orientativo:** 3 clientes Pro cubren Vercel Pro y el dominio.

### Cómo se integraría Stripe (no implementado a propósito)

1. Crear producto y precios en Stripe (modo test primero) y usar **Stripe Checkout** (página de pago alojada por Stripe: sin datos de tarjeta en nuestro servidor).
2. Necesita cuentas de usuario (Supabase Auth) para asociar la suscripción a una persona.
3. Ruta `POST /api/stripe/checkout` (servidor): crea la sesión con `STRIPE_SECRET_KEY` (variable **secreta**, nunca `NEXT_PUBLIC_`).
4. Ruta `POST /api/stripe/webhook`: **verifica la firma** con `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)` y solo entonces actualiza `subscriptions.status` en la base de datos.
5. Las funciones Pro se activan **solo** si el servidor lee `status = 'active'` de la base de datos. Nunca confiar en un parámetro de URL ni en el navegador.
6. Portal de cliente de Stripe para cancelar y cambiar de tarjeta.

---

## 4. Adquisición y validación

### Canal principal

**El propio producto (bucle viral)** más **contacto directo con creadores** en Instagram/TikTok. Secundario: SEO con tests de ejemplo en español («test de personalidad para…»).

### Plan para los primeros 10 usuarios (creadores que publiquen un test)

1. **Despliega** en Vercel y configura Umami y un formulario de Tally (gratis): 1 hora.
2. **Haz tú 3 tests** sobre tus temas y compártelos en tus redes y grupos de WhatsApp. Mide cuántos amigos de amigos llegan.
3. **Lista de 50 creadores pequeños** (1k–50k seguidores) de nichos donde los tests encajan: coaching, fitness, nutrición, idiomas, finanzas personales, astrología, cafeterías y librerías locales.
4. **Créales tú el test** (15 minutos cada uno con el editor) y envíaselo por mensaje directo: «Te he preparado este test para tu audiencia; si te gusta, publícalo, es gratis». Regalar el trabajo hecho convierte mucho mejor que pedir que se registren.
5. **Publica en comunidades** de creadores y emprendedores hispanohablantes (Reddit r/emprendedores, grupos de Facebook y LinkedIn, Indie Hackers en español) mostrando un test real.
6. **Haz una llamada de 15 minutos** con cada creador que lo publique (ver guion abajo).

### Método para recoger comentarios

- Variable `NEXT_PUBLIC_FEEDBACK_URL` → formulario de Tally de 3 preguntas, enlazado en el pie y en la página de resultado.
- Guion de entrevista: ¿Para qué lo usaste? ¿Qué casi te hace abandonar? ¿Qué te gustaría conseguir con un test (seguidores, emails, ventas)? ¿Pagas hoy alguna herramienta para eso? ¿Cuánto?

### Experimento de disposición a pagar

- **Fake door honesto** en `/precios`: el botón «Quiero Pro» registra el evento `pro_interest` y abre la lista de espera (`NEXT_PUBLIC_WAITLIST_URL`). Dice claramente que aún no existe y que no se cobra nada.
- **Prueba de preventa** (cuando haya más de 20 creadores activos): ofrecer «Pro fundador» a 5 €/mes de por vida con un Payment Link de Stripe. Pagar es la única validación fiable.
- **Criterio de éxito [Hipótesis a revisar]:** de 30 creadores activos, al menos 3 dejan su email en la lista Pro y 1 paga la preventa.

### Métricas a medir (eventos ya instrumentados)

| Métrica | Cómo | Objetivo inicial orientativo |
| --- | --- | --- |
| Tasa de finalización | `quiz_complete / quiz_start` | > 70 % |
| Tasa de compartir | `share_click + card_download` / `quiz_complete` | > 15 % |
| **Coeficiente viral (K)** | visitas desde resultados compartidos que terminan el test / jugadores | > 0,3 al principio; > 1 = crecimiento solo |
| Activación de creadores | `editor_start → quiz_publish` | > 40 % |
| Interés Pro | `pro_interest` / visitantes de `/precios` | > 5 % |
| Retención de creadores | creadores que publican un 2.º test en 30 días | > 25 % |

(Para medir K bien hace falta saber de dónde llega cada visita. Umami muestra el *referrer*; mejorarlo es una tarea en TODO.md.)

---

## 5. Costes de mantenimiento **[Estimación, precios a revisar en cada web]**

| Fase | Servicios | Coste/mes |
| --- | --- | --- |
| Validación (ahora) | Vercel Hobby (uso no comercial), Umami Cloud gratis, Tally gratis | **0 €** |
| Con dominio propio | + dominio .com | ~1 €/mes (~12 €/año) |
| Al empezar a cobrar | Vercel Pro (~20 $), Supabase Free, Stripe (comisión por venta, ~1,5–3 % + 0,25 € en Europa) | ~20 € + comisiones |
| Escala (miles de creadores) | Supabase Pro (~25 $) | ~45–60 € |

---

## 6. Registro de decisiones

| Fecha | Decisión |
| --- | --- |
| 2026-10-20 | Elegida la idea A (QuizLab) por su bucle viral y su coste 0 €. |
| 2026-10-20 | MVP sin base de datos: los tests se guardan en el enlace. |
| 2026-10-20 | Público inicial: creadores y pequeños negocios hispanohablantes. |
| 2026-10-20 | Emojis y fuentes incluidos en el proyecto para generar imágenes sin servicios externos. |
| 2026-10-20 | Precio de prueba del plan Pro: 9 €/mes (hipótesis, solo como prueba de interés). |
