// Fuente única de verdad del modelo de datos. La base de datos, la validación
// de la API y los formularios del Studio se derivan de estas definiciones:
// añadir un campo aquí crea la columna en el siguiente arranque.

export const PILLARS = {
  ia: "IA sin límites",
  negocios: "Negocios del futuro",
  marketing: "Marketing inteligente",
  experimentos: "Experimentos",
}

export const FORMATS = {
  vertical: "Vídeo vertical (≤ 90 s)",
  largo: "Vídeo largo (horizontal)",
  carrusel: "Carrusel",
  hilo: "Hilo / texto",
}

export const PRIORITIES = { alta: "Alta", media: "Media", baja: "Baja" }

export const STAGES = {
  idea: "Idea",
  investigacion: "Investigación",
  guion: "Guion",
  produccion: "Producción",
  edicion: "Edición",
  revision: "Revisión",
  publicado: "Publicado",
}

export const QA_ITEMS = {
  gancho: "¿El gancho es interesante?",
  contrastada: "¿La información está contrastada?",
  original: "¿El vídeo aporta algo original?",
  permisos: "¿Los recursos visuales tienen los permisos necesarios?",
  subtitulos: "¿Los subtítulos son legibles?",
  narracion: "¿La narración es clara?",
  conclusion: "¿La conclusión aporta valor?",
}

export const PLATFORMS = {
  multi: "Multiplataforma (vertical)",
  tiktok: "TikTok",
  reels: "Instagram Reels",
  shorts: "YouTube Shorts",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
  newsletter: "Newsletter",
  otro: "Otro",
}

export const POST_STATUS = {
  planificada: "Planificada",
  preparada: "Lista para publicar",
  publicada: "Publicada",
  aplazada: "Aplazada",
  cancelada: "Cancelada",
}

export const IDEA_STATUS = { pendiente: "Pendiente", "en-guion": "Convertida en guion", descartada: "Descartada" }

export const LIBRARY_KINDS = {
  recurso: "Recurso",
  referencia: "Referencia",
  herramienta: "Herramienta",
  experimento: "Experimento",
}

export const EXPERIMENT_STATUS = {
  "": "No aplica",
  planificado: "Planificado",
  "en-curso": "En curso",
  concluido: "Concluido",
}

export const STREAMS = {
  "recursos-digitales": "Recursos digitales",
  plantillas: "Plantillas",
  guias: "Guías",
  colaboraciones: "Colaboraciones",
  patrocinios: "Patrocinios",
  "productos-propios": "Productos propios",
}

export const HYPOTHESIS_STATUS = {
  "sin-validar": "Sin validar",
  "en-validacion": "En validación",
  validada: "Validada",
  descartada: "Descartada",
}

export type EntityName = "ideas" | "videos" | "posts" | "metrics" | "tasks" | "library" | "hypotheses"

type Base = { label: string; hint?: string; hidden?: boolean }

export type Field = Base &
  (
    | { type: "text"; max: number; required?: boolean; multiline?: boolean }
    | { type: "int"; min: number; max: number }
    | { type: "date"; required?: boolean }
    | { type: "time" }
    | { type: "url" }
    | { type: "bool" }
    | { type: "enum"; options: Record<string, string>; default: string }
    | { type: "links" }
    | { type: "scenes" }
    | { type: "checklist"; items: Record<string, string> }
    | { type: "ref"; entity: EntityName; onDelete: "SET NULL" | "CASCADE"; required?: boolean }
  )

export type Entity = { label: string; fields: Record<string, Field>; order: string; dateField?: string }

const text = (label: string, max: number, extra: Partial<Base> & { required?: boolean } = {}): Field => ({
  type: "text",
  label,
  max,
  ...extra,
})
const long = (label: string, max: number, hint?: string): Field => ({ type: "text", label, max, multiline: true, hint })
const count = (label: string): Field => ({ type: "int", label, min: 0, max: 1_000_000_000_000 })
const choice = (label: string, options: Record<string, string>, fallback: string): Field => ({
  type: "enum",
  label,
  options,
  default: fallback,
})

export const ENTITIES = {
  ideas: {
    label: "Ideas",
    order: "CASE priority WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END, updated_at DESC",
    fields: {
      title: text("Título", 160, { required: true }),
      summary: long("Resumen y ángulo", 2000, "¿Qué vamos a probar o explicar y por qué le importa a la audiencia?"),
      pillar: choice("Pilar", PILLARS, "ia"),
      format: choice("Formato", FORMATS, "vertical"),
      priority: choice("Prioridad", PRIORITIES, "media"),
      status: choice("Estado", IDEA_STATUS, "pendiente"),
      refs: { type: "links", label: "Referencias", hint: "Fuentes, ejemplos o inspiración (solo http/https)." },
      notes: long("Notas", 4000),
      video_id: { type: "ref", label: "Vídeo", entity: "videos", onDelete: "SET NULL", hidden: true },
    },
  },
  videos: {
    label: "Vídeos",
    order: "updated_at DESC",
    fields: {
      title: text("Título", 160, { required: true }),
      pillar: choice("Pilar", PILLARS, "ia"),
      format: choice("Formato", FORMATS, "vertical"),
      stage: choice("Estado de producción", STAGES, "idea"),
      idea_id: { type: "ref", label: "Idea de origen", entity: "ideas", onDelete: "SET NULL", hidden: true },
      hook: long("Gancho inicial", 600, "La primera frase. Debe plantear una pregunta o una tensión, no un saludo."),
      narration: long("Narración", 12000, "Texto completo de la locución."),
      scenes: { type: "scenes", label: "Escenas" },
      visual_resources: long("Recursos visuales", 4000, "Qué material se usa y con qué licencia o permiso."),
      onscreen_text: long("Textos en pantalla", 4000),
      cta: long("Llamada a la acción", 600),
      sources: long("Fuentes y datos a contrastar", 4000, "Todo dato del guion debe tener aquí su fuente."),
      duration: { type: "int", label: "Duración objetivo (s)", min: 0, max: 7200 },
      due_date: { type: "date", label: "Fecha objetivo" },
      published_date: { type: "date", label: "Fecha de publicación" },
      qa: { type: "checklist", label: "Control de calidad", items: QA_ITEMS },
      notes: long("Notas de producción", 4000),
    },
  },
  posts: {
    label: "Publicaciones",
    order: "date ASC, time ASC",
    dateField: "date",
    fields: {
      title: text("Título", 160, { required: true }),
      date: { type: "date", label: "Fecha", required: true },
      time: { type: "time", label: "Hora" },
      platform: choice("Plataforma", PLATFORMS, "multi"),
      status: choice("Estado", POST_STATUS, "planificada"),
      pillar: choice("Pilar", PILLARS, "ia"),
      video_id: { type: "ref", label: "Vídeo", entity: "videos", onDelete: "SET NULL" },
      url: { type: "url", label: "Enlace publicado" },
      notes: long("Notas", 2000),
    },
  },
  metrics: {
    label: "Registros de métricas",
    order: "date DESC, id DESC",
    dateField: "date",
    fields: {
      post_id: { type: "ref", label: "Publicación", entity: "posts", onDelete: "CASCADE", required: true },
      date: { type: "date", label: "Fecha del registro", required: true },
      views: count("Visualizaciones"),
      comments: count("Comentarios"),
      shares: count("Compartidos"),
      saves: count("Guardados"),
      notes: long("Notas", 1000),
    },
  },
  tasks: {
    label: "Tareas",
    order: "done ASC, due_date IS NULL, due_date ASC, id ASC",
    dateField: "due_date",
    fields: {
      title: text("Tarea", 200, { required: true }),
      due_date: { type: "date", label: "Fecha límite" },
      done: { type: "bool", label: "Hecha" },
      priority: choice("Prioridad", PRIORITIES, "media"),
      video_id: { type: "ref", label: "Vídeo relacionado", entity: "videos", onDelete: "SET NULL" },
      notes: long("Notas", 2000),
    },
  },
  library: {
    label: "Biblioteca",
    order: "kind ASC, title COLLATE NOCASE ASC",
    fields: {
      kind: choice("Tipo", LIBRARY_KINDS, "recurso"),
      title: text("Título", 200, { required: true }),
      url: { type: "url", label: "Enlace" },
      description: long("Descripción", 4000),
      tags: text("Etiquetas", 300, { hint: "Separadas por comas." }),
      license: text("Coste / licencia", 200, { hint: "Compruébalo siempre en la web oficial antes de usar." }),
      hypothesis: long("Hipótesis", 2000, "Solo experimentos: qué creemos que pasará."),
      method: long("Método", 4000, "Solo experimentos: pasos, duración y qué se mide."),
      result: long("Resultado", 4000, "Solo experimentos: lo observado. Vacío hasta ejecutarlo."),
      exp_status: choice("Estado del experimento", EXPERIMENT_STATUS, ""),
    },
  },
  hypotheses: {
    label: "Hipótesis de negocio",
    order: "CASE priority WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END, id ASC",
    fields: {
      stream: choice("Vía de monetización", STREAMS, "recursos-digitales"),
      title: text("Título", 200, { required: true }),
      hypothesis: long("Hipótesis", 2000, "Creemos que… porque…"),
      audience: long("Para quién", 1000),
      validation: long("Cómo validarla", 4000, "Experimento concreto, sin cobros ni pagos."),
      criterion: long("Criterio de éxito", 1000, "Fíjalo antes de probar para no reinterpretar los datos."),
      prerequisites: long("Requisitos previos", 2000),
      status: choice("Estado", HYPOTHESIS_STATUS, "sin-validar"),
      evidence: long("Evidencia recogida", 4000, "Solo datos reales observados."),
      priority: choice("Prioridad", PRIORITIES, "media"),
      notes: long("Notas", 2000),
    },
  },
} satisfies Record<EntityName, Entity>


export function isEntityName(name: string): name is EntityName {
  return Object.hasOwn(ENTITIES, name)
}

export function entity(name: EntityName): Entity {
  return ENTITIES[name]
}
