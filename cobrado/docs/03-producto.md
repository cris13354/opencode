# Fase 3 · Qué se ha construido

## En una frase

**Cobrado** acompaña a un autónomo o una micropyme desde que una factura vence hasta que la cobra (o hasta tener listo el expediente para el juzgado): le dice qué hacer cada día, le redacta el mensaje adecuado con las cifras que le reconoce la ley y guarda la prueba de cada gestión.

## Qué hace el MVP (funcionalidades reales, probadas)

| Funcionalidad | Qué resuelve |
| --- | --- |
| **Panel "Para hoy"** | Lista solo las facturas que requieren una acción hoy (o que van con retraso), ordenadas por urgencia, más lo que viene en los próximos 7 días. KPIs: pendiente, vencido, recuperable por ley, retraso medio. |
| **Escalera de reclamación** | Cinco pasos con tiempos razonables entre ellos: aviso previo (3 días antes), recordatorio (día 1), seguimiento (día 7), aviso firme (día 15) y requerimiento formal (día 30). Respeta un intervalo mínimo desde el último mensaje para no atosigar. Nunca vuelve a sugerir un paso anterior. |
| **Pausas inteligentes** | Una promesa de pago o un plan de pagos pausan la escalera hasta esa fecha; si no se cumple, lo dice y retoma. Una discrepancia la detiene hasta marcarla resuelta. |
| **Generador de mensajes** | Borradores en tono cercano (tú) o formal (usted), con los datos del usuario y del cliente, importes, días de retraso y fecha límite. Opción de ofrecer la renuncia a intereses y 40 € si paga en plazo. Se editan, se copian, se abren en el email (mailto) o en WhatsApp (wa.me). La app no envía nada por sí sola. |
| **Cálculo legal** | Intereses de demora por tramos de semestre con el tipo del BOE, sobre el saldo pendiente de cada día (los pagos parciales reducen la base), base 365, y 40 € por factura en operaciones B2B/B2G. Para particulares: sin 40 € e interés legal del dinero solo desde la reclamación formal. Avisos si el plazo pactado supera 60 días o si un tipo no está verificado o es estimado. |
| **Requerimiento formal (MASC)** | Carta con desglose de la deuda, plazo de pago e invitación a negociar en los términos de la LO 1/2025, lista para imprimir o guardar en PDF y enviar por burofax. Al registrar el envío pide medio y fecha de recepción, y calcula la fecha orientativa (recepción + 30 días) a partir de la cual proponer el monitorio. Avisa si faltan datos imprescindibles o si el medio elegido es un email simple. |
| **Expediente** | Documento imprimible con partes, deuda, desglose de intereses por tramos, cronología completa de gestiones y pagos, estado del intento de negociación y lista de documentos a reunir. |
| **Calculadora** | Independiente, sin guardar nada. Es también la herramienta gancho de la landing. |
| **Guía** | Resumen de derechos (Ley 3/2004, particulares, Administración), MASC, monitorio e IVA de impagados, con fuentes del BOE. |
| **Datos** | Importación CSV de las exportaciones típicas de programas de facturación (detecta separador, decimales con coma, fechas dd/mm/aaaa, omite las ya cobradas e informa de errores por línea); copia de seguridad JSON; datos de ejemplo; borrado total. |
| **Ajustes** | Perfil del acreedor, tú/usted, plazo por defecto, interés legal del dinero y tabla de tipos editable (con marca de "verificado"/"pendiente"). |

## Cómo funciona por dentro

```
cobrado/
├── index.html              Landing de presentación (con la calculadora en vivo)
├── landing/                Estilos y script de la landing
├── app/
│   ├── index.html          Aplicación (SPA con rutas por hash)
│   ├── styles.css          Diseño: tokens, modo oscuro, móvil (<760px), impresión
│   └── src/
│       ├── domain/         Lógica pura, sin DOM: testeada con node:test
│       │   ├── dates.js        Fechas ISO en días UTC (sin errores por husos horarios)
│       │   ├── rates.js        Tipos legales por semestre, con fuente y estado de verificación
│       │   ├── interest.js     Devengo por tramos (semestre × pagos)
│       │   ├── claim.js        Situación de una factura: pendiente, retraso, intereses, 40 €, avisos
│       │   ├── escalation.js   Siguiente acción (escalera, pausas, MASC, monitorio)
│       │   ├── templates.js    Mensajes y carta de requerimiento
│       │   ├── csv.js          Importación CSV
│       │   ├── model.js        Validación de facturas (única frontera de datos externos)
│       │   └── format.js       Formato de moneda y fechas (es-ES)
│       ├── store.js        Estado y persistencia en localStorage; datos de ejemplo
│       ├── main.js         Enrutador
│       └── ui/             Vistas (panel, factura, formulario, expediente, guía, ajustes)
├── test/                   30 pruebas unitarias del dominio
└── scripts/
    ├── serve.mjs           Servidor estático sin dependencias
    └── smoke.mjs           Prueba de extremo a extremo opcional con Playwright
```

### Decisiones técnicas

- **Sin dependencias ni paso de compilación.** HTML, CSS y JavaScript con módulos ES. Se ejecuta con Node (incluido en cualquier equipo de desarrollo) y se puede publicar en cualquier hospedaje estático gratuito. Menos piezas que mantener en una fase en la que el producto puede cambiar mucho.
- **Todo local.** Los datos viven en `localStorage`. Es un argumento de venta (privacidad) y elimina costes y obligaciones de servidor en la fase de validación. Contrapartida: no hay sincronización entre dispositivos (ver pendientes).
- **El dominio separado de la interfaz.** Todos los cálculos legales están en `app/src/domain`, sin acceso al DOM, y cubiertos por pruebas. La calculadora de la landing reutiliza exactamente el mismo código.
- **Texto seguro.** La interfaz crea siempre nodos de texto; ningún dato del usuario se inserta como HTML.
- **Fecha simulable.** `?hoy=AAAA-MM-DD` en la URL fija la fecha de trabajo, útil para demos y pruebas.

### IA y automatización

La automatización real del MVP es el **motor de siguiente acción**: decide qué toca hacer con cada factura a partir de su historial, con reglas explícitas y comprobables. No he añadido un modelo de lenguaje porque:

1. Exigiría una API de pago o enviar datos de clientes a un tercero, que el encargo prohíbe.
2. En textos con contenido legal, una plantilla revisada es más fiable que un texto generado.

Dónde aportaría la IA más adelante (decisión pendiente, ver documento 05): adaptar el tono de un mensaje a una respuesta concreta del cliente, resumir hilos de email para el expediente o extraer los datos de un PDF de factura.

## Limitaciones conocidas

- Los tipos de algunos semestres (2022, 2023, 2.º de 2024 y 1.º de 2026) están **pendientes de verificar** en el BOE; la app lo indica.
- Un requerimiento por factura: aún no agrupa varias facturas del mismo cliente en una sola carta.
- Para la Administración pública se usa la fecha de vencimiento que indique el usuario; no se modelan los plazos de aprobación de la Ley de Contratos.
- Los límites del plan gratuito descritos en la landing **no están implementados** (es una hipótesis de precio).
- Sin sincronización, sin notificaciones y sin analítica de uso.
