# TODO — QuizLab

Ordenado por prioridad. P0 = antes de enseñarlo a desconocidos · P1 = siguientes 2–4 semanas · P2 = cuando haya tracción.

## P0 · Lanzamiento de validación (tú, sin programar)

- [ ] Desplegar en Vercel (ver README) y abrir la web en tu móvil.
- [ ] Probar a compartir un resultado por WhatsApp y comprobar que aparece la imagen. **No verificado** en esta sesión: el entorno no tenía WhatsApp/X; sí se comprobó que la página genera las etiquetas `og:image` y que la imagen se crea correctamente.
- [ ] Probar en un iPhone real: compartir nativo, descarga de la imagen de Stories (comprobar que se guarda bien en la galería; el comportamiento de las descargas varía entre navegadores móviles).
- [ ] Crear una cuenta gratuita en Umami → `NEXT_PUBLIC_UMAMI_WEBSITE_ID`.
- [ ] Crear dos formularios en Tally (opiniones y lista de espera Pro) → `NEXT_PUBLIC_FEEDBACK_URL`, `NEXT_PUBLIC_WAITLIST_URL`.
- [ ] Poner un email de contacto → `NEXT_PUBLIC_CONTACT_EMAIL`.
- [ ] Revisar la página de privacidad y añadir el responsable (nombre/empresa y contacto). Consultar con un profesional antes de cobrar.
- [ ] Comprobar disponibilidad del nombre/dominio «QuizLab» (hay productos con nombres parecidos).
- [ ] Ejecutar el plan de los primeros 10 usuarios (PLAN.md §4).

## P1 · Producto (programación)

- [ ] **Enlaces cortos y editables**: Supabase + tabla `quizzes` (esquema en ARCHITECTURE.md). Mantener compatibles los enlaces `c1.`.
- [ ] **Bloquear tests abusivos**: lista de enlaces bloqueados (aunque sea un archivo) + botón «Denunciar». Hoy no hay forma de desactivar un enlace concreto.
- [ ] **Medir el coeficiente viral**: añadir `?via=share` a los enlaces compartidos y enviarlo en `quiz_start`.
- [ ] **Reto con comparación**: «Ana sacó 7/10. ¿La superas?» en la página del test cuando se llega desde un resultado, y comparación al terminar.
- [ ] **HTTP 404 real** para enlaces inválidos: ahora se muestra la página de error, pero con código 200 (se renderiza dentro de `<Suspense>`). Afecta poco, porque los tests de usuarios no se indexan.
- [ ] Limitar peticiones a `/api/card` (Vercel Firewall o un rate limit) si aparece abuso: cada imagen nueva consume CPU.
- [ ] Mostrar en la tarjeta de imagen los emojis escritos dentro de textos (ahora se quitan de título/nombre en el PNG para no depender de un CDN).
- [ ] «Remix»: duplicar un test publicado como punto de partida.
- [ ] Modo oscuro (opcional).

## P2 · Monetización (cuando se cumpla el criterio de PLAN.md §4)

- [ ] Cuentas de usuario (Supabase Auth, enlace mágico por email).
- [ ] Captación de emails antes del resultado (Pro) + exportar CSV. Requiere consentimiento explícito y texto legal.
- [ ] Estadísticas por test: visitas, completados, distribución de resultados.
- [ ] Stripe Checkout + webhook verificado (PLAN.md §3).
- [ ] Quitar la marca y logo propio (Pro).
- [ ] Integraciones Mailchimp/Brevo/webhooks (Negocio).
- [ ] Generar tests con IA a partir de un tema (vigilar el coste por uso).

## Deuda técnica conocida

- `npm audit` muestra 5 avisos «high» en dependencias **solo de desarrollo** (`braces`, usado por herramientas como eslint/vitest). No afectan a la web desplegada (`npm audit --omit=dev` = 0). Revisar al actualizar dependencias.
- `vitest` se instaló con `--legacy-peer-deps` por un error de npm 10 (`Cannot read properties of null (reading 'edgesOut')`). `npm ci` funciona con el `package-lock.json` actual.
- No hay pruebas de componentes aisladas; la interfaz se cubre con las pruebas e2e de Playwright.
