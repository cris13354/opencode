# Fase 5 · Pendientes, plan de 7 días y decisiones

## Puntos que todavía necesitan trabajo

### Antes de enseñárselo a nadie fuera de tu entorno

1. **Revisión jurídica de las plantillas**, sobre todo del requerimiento con invitación a negociar. Los criterios de los juzgados sobre el MASC no están unificados. Una hora de un abogado mercantil o procesal basta para validarlo.
2. **Verificar en el BOE los tipos marcados como "pendiente"** (1.º y 2.º semestre de 2022 y 2023, 2.º de 2024 y 1.º de 2026) y el interés legal del dinero de 2026.
3. **Política de privacidad y aviso legal** si se publica la landing con formulario (RGPD: responsable del tratamiento, finalidad, base legal, derechos).

### Producto (por impacto estimado)

1. **Varias facturas del mismo cliente en un solo requerimiento y expediente.** Caso habitual con clientes recurrentes.
2. **Recordatorios fuera de la app**: exportar la siguiente acción como evento de calendario (.ics), sin servidor. Hoy el usuario tiene que abrir la app para enterarse.
3. **Ayuda para el formulario de monitorio**: rellenar con los datos del expediente los campos del formulario normalizado.
4. **Módulo de IVA de impagados** (art. 80 LIVA): avisar de los plazos para recuperar el IVA adelantado. Requiere verificar requisitos y plazos con un asesor fiscal.
5. **Sincronización y copia en la nube** (requiere servidor y cuentas: solo si la validación lo justifica).
6. **Implementar los límites del plan gratuito** si se valida el modelo freemium.
7. **Analítica respetuosa con la privacidad** (sin cookies) para medir activación; hoy solo se puede medir con entrevistas.
8. **Plazos de la Administración pública** (aprobación + pago según la Ley de Contratos) y facturas en FACe.
9. **Importación directa** desde los programas de facturación más usados (con su API), además de CSV.
10. **IA opcional** para adaptar un mensaje a la respuesta concreta del cliente (requiere decidir proveedor, coste y tratamiento de datos).

### Calidad técnica

- Pruebas de extremo a extremo en la integración continua (hoy `npm run smoke` es opcional y necesita Playwright).
- Auditoría de accesibilidad con lector de pantalla.
- Funcionamiento sin conexión (PWA) e instalación en el móvil.
- **Mover el proyecto a su propio repositorio**: ahora está dentro de un fork de otro proyecto (ver decisiones).

## Plan de acción de 7 días

| Día | Objetivo | Tareas | Resultado esperado |
| --- | --- | --- | --- |
| 1 | Probarlo tú | Ejecutar la app (`npm start`), meter tus propias facturas atrasadas (o las de alguien de confianza), leer la guía y las plantillas. Apuntar todo lo que chirríe. | Lista de fallos y dudas. Decisión de seguir o no. |
| 2 | Decisiones básicas | Tomar las decisiones 1 a 4 de la lista de abajo (nombre, repositorio, publicar o no, formulario). Hacer la lista de 30 contactos del ICP. | Repositorio propio; lista de contactos. |
| 3 | Seguridad jurídica | Consultar a un abogado sobre el requerimiento y la guía (si decides gastar) y verificar los tipos pendientes en el BOE. Actualizar la tabla en `app/src/domain/rates.js`. | Plantillas revisadas o riesgo asumido por escrito. |
| 4 | Primeros contactos | Enviar el mensaje personal a los 30 contactos. Agendar sesiones. Si publicas la landing, compartirla solo con ellos. | 8–10 sesiones agendadas. |
| 5 | Entrevistas y sesiones | 3–5 sesiones acompañadas con facturas reales, siguiendo el guion de entrevista. Grabar notas (con permiso). | Notas por persona; primeros patrones. |
| 6 | Más sesiones y gestorías | 3–5 sesiones más. Contactar 5 gestorías. Probar la oferta "19 € por expediente" con quien llegue al requerimiento. | Primeras señales de pago (o de rechazo). |
| 7 | Decidir | Resumir lo aprendido frente a los umbrales del documento 04. Priorizar los 3 cambios que más se han pedido. Decidir: seguir, ajustar el foco o cambiar a la segunda opción (impuestos de autónomos). | Decisión documentada y siguiente sprint definido. |

## Decisiones que tienes que tomar personalmente

1. **¿Seguir con esta oportunidad?** Después de probarla tú (día 1).
2. **Repositorio.** El proyecto vive en la carpeta `cobrado/` de un fork de otro proyecto, en la rama `claude/digital-business-opportunity-3katlv`. Recomiendo moverlo a un repositorio propio antes de publicar nada.
3. **Nombre y marca.** "Cobrado" es un nombre de trabajo. No he comprobado disponibilidad de dominio, marca registrada (OEPM/EUIPO) ni redes sociales.
4. **¿Publicar la landing? ¿Dónde?** Opciones gratuitas: GitHub Pages, Netlify, Cloudflare Pages. No he publicado ni desplegado nada.
5. **Herramienta para la lista de espera.** El formulario está desconectado (`WAITLIST_ENDPOINT` vacío en `landing/landing.js`). Opciones gratuitas: Tally, Formspree, Google Forms. Recoger emails exige una política de privacidad.
6. **¿Gastar en una revisión jurídica?** Es el único gasto que recomiendo antes de que usuarios reales envíen requerimientos generados por la herramienta.
7. **Nicho de entrada.** ¿Freelancers creativos y tecnológicos, oficios que trabajan para constructoras, o gestorías como canal? Afecta a mensajes, ejemplos y dónde buscar usuarios.
8. **Precios a probar** y si se ofrece la preventa por expediente (y cómo se cobraría sin contratar servicios: Bizum o transferencia entre conocidos, con factura).
9. **Responsabilidad y aviso legal.** Cómo presentar el producto (herramienta de apoyo, no asesoramiento) y si quieres un seguro o una revisión de las condiciones de uso antes de cobrar.
10. **Servidor sí o no.** Mantener el "todo en tu navegador" como argumento de privacidad o añadir cuentas y sincronización (más coste, más obligaciones RGPD).
11. **IA.** Si se añade, con qué proveedor, quién paga el coste y qué datos de clientes se envían.
12. **Tu disponibilidad.** La validación depende de conversaciones que solo puedes tener tú: decide cuántas horas por semana le dedicas.
