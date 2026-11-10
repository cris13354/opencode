# Identidad visual

## Concepto

**Experimentar y registrar.** El símbolo es un matraz Erlenmeyer de trazo continuo con una línea de datos ascendente en su interior, en lugar de líquido. La burbuja del cuello sugiere que el experimento está en marcha.

- El **matraz** es el laboratorio: probar, medir, comprobar.
- La **línea de datos** es el registro: lo que se observa, con altibajos (no es una flecha triunfal; sube y baja antes de subir).
- El **degradado azul → violeta** va de la técnica (azul eléctrico) a la hipótesis y la curiosidad (violeta).

Se evitan deliberadamente robots, cerebros, circuitos y bombillas: son los recursos más repetidos en el sector.

## Archivos

| Archivo | Uso |
|---|---|
| `public/brand/simbolo.svg` | Símbolo solo. Avatares, favicon, marcas de agua. |
| `public/brand/logo-horizontal.svg` | Símbolo + nombre. Cabeceras, portadas, documentos. |
| `public/brand/favicon.svg` | Icono del navegador. |
| `public/brand/tokens.css` | Variables CSS de color, tipografía, radios y sombras. Fuente única para la web y el Studio. |

**Usos del logotipo**

- Siempre sobre fondo oscuro (Fondo Noche o superficies de la paleta).
- Espacio libre alrededor: al menos la anchura del cuello del matraz.
- Tamaño mínimo del símbolo: 20 px (pantalla).
- No girar, no cambiar el degradado por otros colores, no añadir sombras ni contornos.
- Avatar de redes: símbolo centrado sobre Fondo Noche, ocupando ~60 % del círculo.

## Paleta

| Nombre | Hex | Token | Uso |
|---|---|---|---|
| Fondo Noche | `#07080F` | `--bg` | Fondo principal. |
| Superficie | `#10142A` | `--surface` | Tarjetas y paneles. |
| Borde | `#222A4B` | `--border` | Separadores. |
| Texto | `#E9ECF7` | `--text` | Texto principal. |
| Texto secundario | `#A0A8C6` | `--text-muted` | Descripciones. |
| **Azul Ensayo** | `#2F6BFF` | `--blue` | Color principal, acciones, foco. |
| **Violeta Hipótesis** | `#8B5CF6` | `--violet` | Segundo color de marca; degradados. |
| Cian Señal | `#38BDF8` | `--cyan` | Pilar Marketing inteligente; datos. |
| Verde Matraz | `#2DD4BF` | `--teal` | Pilar Experimentos; progreso. |

**Colores por pilar** (etiquetas, gráficos y miniaturas):

| Pilar | Color |
|---|---|
| IA sin límites | Azul claro `#6390FF` |
| Negocios del futuro | Violeta claro `#AD8EFF` |
| Marketing inteligente | Cian `#38BDF8` |
| Experimentos | Verde Matraz `#2DD4BF` |

Los colores de estado (`--success`, `--warning`, `--danger`) se reservan para avisos y resultados, nunca como decoración.

**Degradado de marca:** `linear-gradient(135deg, #2F6BFF, #8B5CF6)`. Solo en el símbolo, botones principales y alguna palabra clave de un titular. Nunca de fondo a pantalla completa.

## Tipografía

- **Titulares y texto:** Inter si está instalada; si no, la sans de sistema (Segoe UI, SF Pro, Helvetica). Pesos 700–800 para titulares, 400–500 para texto. Interletraje ligeramente negativo en titulares grandes.
- **Datos, etiquetas y fichas:** monoespaciada (JetBrains Mono, SF Mono, Cascadia Code o la del sistema), en mayúsculas pequeñas con interletraje amplio. Es el «lenguaje de laboratorio» de la marca: códigos `EXP-001`, estados, fechas.
- El proyecto no descarga fuentes externas (privacidad y funcionamiento sin conexión). Inter tiene licencia libre (SIL OFL) si en el futuro se quiere incluir dentro del proyecto.

## Elementos gráficos

- **Rejilla técnica** tenue de fondo, desvanecida en los bordes (hero de la web).
- **Fichas de experimento**: tarjeta con código, estado, hipótesis, método, criterio y resultado. Es el formato visual recurrente para vídeos y web.
- **Líneas de datos discontinuas**: un experimento en curso. Continuas: datos reales registrados.
- Iconos lineales de trazo 1,8 px, esquinas redondeadas.
- Radios: 8 px (controles), 12 px (tarjetas), 18 px (paneles destacados).

## Movimiento

Animaciones discretas: aparición suave al desplazarse (opacidad + 14 px), transiciones de 150–250 ms. Se desactivan si el sistema pide reducir movimiento (`prefers-reduced-motion`). En vídeo: texto que se escribe letra a letra, bloques que encajan, líneas que se dibujan. Sin destellos, sin efectos 3D, sin transiciones llamativas.

## Plantilla de vídeo vertical (sin rostro)

| Zona | Contenido |
|---|---|
| Superior (10 %) | Código de pieza en monoespaciada (`EXP-001`, `IA-004`) y pilar con su color. |
| Centro (70 %) | Grabación de pantalla, gráfico animado o texto grande. Fondo Noche. |
| Inferior (20 %) | Subtítulos en blanco, 2 líneas como máximo, alto contraste. Dejar margen para la interfaz de cada plataforma. |
| Cierre | Símbolo + eslogan durante 1–2 s. |

## Voz y tono

| Somos | No somos |
|---|---|
| Curiosos: «Vamos a comprobarlo». | Gurús: «El secreto que nadie te cuenta». |
| Claros: frases cortas, sin jerga innecesaria. | Técnicos por presumir. |
| Honestos: «No lo sabemos todavía», «Esto no demuestra nada en general». | Exagerados: «Revolucionario», «Te cambiará la vida». |
| Entretenidos: metáforas cotidianas, ritmo. | Infantiles o sensacionalistas. |
| Profesionales: fuentes, criterios, datos reales. | Fríos o académicos. |

**Fórmulas propias:** «Lo ponemos a prueba», «Criterio fijado antes», «Resultado: pendiente», «Esto es lo que pasó».
