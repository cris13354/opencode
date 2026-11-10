# Cobrado

**Recupera tus facturas impagadas paso a paso.** Recordatorios en el momento justo, intereses de demora y 40 € por factura según la Ley 3/2004, requerimiento formal con invitación a negociar (LO 1/2025) y expediente listo para el procedimiento monitorio. Todo en el navegador, sin cuentas ni servidores.

> Prototipo de validación. No está publicado ni desplegado. No es asesoramiento jurídico: las plantillas son borradores y algunos tipos de interés están pendientes de verificar en el BOE (la app lo indica).

## Ejecutarlo

Requisitos: Node.js 20 o superior. No hay dependencias que instalar.

```bash
cd cobrado
npm start          # http://127.0.0.1:4321/      → landing
                   # http://127.0.0.1:4321/app/  → aplicación
npm test           # 30 pruebas del motor de cálculo (node:test)
npm run smoke      # opcional: recorrido completo en navegador (requiere Playwright)
```

Otros puertos: `PORT=8080 npm start`. Cualquier servidor estático sirve (por ejemplo `python3 -m http.server` desde `cobrado/`); los módulos ES no funcionan abriendo el HTML con `file://`.

### Para explorarlo en 2 minutos

1. Abre `/app/` y pulsa **Ver con datos de ejemplo** (5 facturas ficticias en distintas fases).
2. Entra en una factura de "Para hoy", prueba el generador de mensajes, registra un pago o una promesa y mira cómo cambia el siguiente paso.
3. Abre **Expediente** en la factura que pide el monitorio.
4. En **Ajustes**, rellena tus datos y vuelve a generar el requerimiento.

Truco: añade `?hoy=2027-01-15` a la URL para simular otra fecha.

## Documentación

| Documento | Contenido |
| --- | --- |
| [docs/01-investigacion.md](docs/01-investigacion.md) | Los 10 problemas analizados, con fuentes y separando hechos de hipótesis. |
| [docs/02-seleccion.md](docs/02-seleccion.md) | Puntuación de las 3 finalistas, por qué gana Cobrado y **oportunidades descartadas**. |
| [docs/03-producto.md](docs/03-producto.md) | **Qué se ha construido**, cómo funciona, arquitectura y limitaciones. |
| [docs/04-validacion.md](docs/04-validacion.md) | Propuesta de valor, cliente ideal, estrategia para los 10 primeros usuarios, guion de entrevista y monetización. |
| [docs/05-siguientes-pasos.md](docs/05-siguientes-pasos.md) | **Trabajo pendiente, plan de 7 días y decisiones** que tienes que tomar. |

La landing (`index.html`) contiene la propuesta de valor, la explicación de cómo funciona, la calculadora en vivo y los precios a validar.

## Estructura

```
index.html, landing/     Landing de presentación
app/                     Aplicación (HTML + CSS + módulos ES)
  src/domain/            Lógica pura y testeada: intereses, escalera, plantillas, CSV
  src/ui/                Vistas
test/                    Pruebas unitarias
scripts/                 Servidor local y prueba de humo
docs/                    Investigación, selección, producto, validación y plan
```

## Privacidad

Las facturas y los datos de clientes se guardan en el `localStorage` del navegador y no se envían a ningún sitio. El formulario de la landing no está conectado a ningún servicio.
