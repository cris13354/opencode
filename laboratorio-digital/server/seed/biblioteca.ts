// Biblioteca inicial. Las licencias y condiciones se indican como referencia y
// deben comprobarse en la web oficial antes de usar cada herramienta.

type Item = {
  kind: "recurso" | "referencia" | "herramienta" | "experimento"
  title: string
  url?: string
  description: string
  tags: string
  license?: string
  hypothesis?: string
  method?: string
  exp_status?: "planificado"
}

const CHECK = "Verificar licencia vigente en la web oficial."

export const LIBRARY: Item[] = [
  {
    kind: "herramienta",
    title: "OBS Studio",
    url: "https://obsproject.com",
    description: "Grabación de pantalla y composición de escenas para las demostraciones.",
    tags: "grabación, pantalla",
    license: `Gratuito y de código abierto. ${CHECK}`,
  },
  {
    kind: "herramienta",
    title: "Kdenlive",
    url: "https://kdenlive.org",
    description: "Editor de vídeo para montaje, subtítulos y exportación vertical.",
    tags: "edición, vídeo",
    license: `Gratuito y de código abierto. ${CHECK}`,
  },
  {
    kind: "herramienta",
    title: "DaVinci Resolve",
    url: "https://www.blackmagicdesign.com/products/davinciresolve",
    description: "Alternativa de edición y etalonaje con versión gratuita.",
    tags: "edición, color",
    license: `Versión gratuita disponible; existe una versión de pago. ${CHECK}`,
  },
  {
    kind: "herramienta",
    title: "Audacity",
    url: "https://www.audacityteam.org",
    description: "Grabación y limpieza de la locución.",
    tags: "audio, voz",
    license: `Gratuito y de código abierto. ${CHECK}`,
  },
  {
    kind: "herramienta",
    title: "Inkscape",
    url: "https://inkscape.org",
    description: "Gráficos vectoriales: miniaturas, rótulos y variantes del logotipo.",
    tags: "diseño, vectores",
    license: `Gratuito y de código abierto. ${CHECK}`,
  },
  {
    kind: "herramienta",
    title: "Excalidraw",
    url: "https://excalidraw.com",
    description: "Diagramas rápidos con estilo de pizarra para explicar conceptos.",
    tags: "diagramas",
    license: `Uso gratuito; el proyecto es de código abierto. ${CHECK}`,
  },
  {
    kind: "herramienta",
    title: "Whisper (modelo de transcripción)",
    url: "https://github.com/openai/whisper",
    description: "Transcripción local de la locución para generar subtítulos sin enviar audio a terceros.",
    tags: "subtítulos, transcripción, local",
    license: `Código publicado con licencia abierta. Requiere instalación técnica. ${CHECK}`,
  },
  {
    kind: "referencia",
    title: "Licencias Creative Commons",
    url: "https://creativecommons.org/licenses/",
    description: "Guía oficial para entender qué permite cada licencia antes de usar imágenes, música o vídeo de terceros.",
    tags: "licencias, derechos",
  },
  {
    kind: "recurso",
    title: "Kit de marca de EL LABORATORIO DIGITAL",
    description:
      "Logotipo, símbolo, paleta y tipografía. Archivos en public/brand/ y guía completa en docs/identidad-visual.md.",
    tags: "marca, identidad",
    license: "Propio.",
  },
  {
    kind: "recurso",
    title: "Plantilla de registro de experimentos",
    description:
      "Estructura para documentar cualquier experimento: hipótesis, método, métrica, criterio de éxito fijado antes, registro diario y resultado observado.",
    tags: "experimentos, plantilla",
    license: "Propio.",
  },
  {
    kind: "experimento",
    title: "7 días con la IA planificando la semana",
    description: "Experimento asociado al vídeo del mismo nombre.",
    tags: "productividad, ia",
    hypothesis:
      "Creemos que delegar en una IA el orden diario de las tareas reducirá las veces que se replanifica a mitad de día.",
    method:
      "7 días consecutivos. Cada mañana se entrega a la IA la lista de tareas, citas fijas y horas disponibles. Registro diario: tareas planificadas, completadas, número de saltos del plan con motivo y energía (1–5). Criterio fijado antes: considerarlo útil si se siguen al menos 5 de los 7 planes sin replanificar.",
    exp_status: "planificado",
  },
  {
    kind: "experimento",
    title: "Producto digital mínimo en un fin de semana",
    description: "Experimento asociado al vídeo del mismo nombre y a la hipótesis de plantillas.",
    tags: "producto, plantillas",
    hypothesis: "Creemos que una plantilla útil puede diseñarse y documentarse en 48 horas con herramientas gratuitas.",
    method:
      "48 horas, solo herramientas gratuitas. Cronometrar cinco fases: problema, estructura, contenido, prueba con caso ficticio y página de presentación. Criterio: la plantilla está terminada si un caso ficticio completo puede planificarse con ella sin modificarla.",
    exp_status: "planificado",
  },
  {
    kind: "experimento",
    title: "Auditoría de un plan de negocio generado por IA",
    description: "Experimento asociado al vídeo del mismo nombre.",
    tags: "negocios, ia, verificación",
    hypothesis: "Creemos que una parte relevante de las afirmaciones de un plan de negocio generado por IA será genérica o no verificable.",
    method:
      "Prompt fijo guardado en esta ficha. Clasificar cada afirmación en: verificable y correcta, verificable e incorrecta, genérica, no verificable. Cada clasificación de «correcta» o «incorrecta» requiere fuente. Un único revisor, documentarlo como limitación.",
    exp_status: "planificado",
  },
]
