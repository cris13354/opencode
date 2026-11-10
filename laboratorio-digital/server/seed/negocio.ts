// Hipótesis de monetización. Todas empiezan «sin validar»: son apuestas que hay
// que comprobar con personas reales, nunca hechos. Los criterios de éxito son
// provisionales y deben ajustarse antes de lanzar cada prueba.

type Hypothesis = {
  stream: "recursos-digitales" | "plantillas" | "guias" | "colaboraciones" | "patrocinios" | "productos-propios"
  title: string
  hypothesis: string
  audience: string
  validation: string
  criterion: string
  prerequisites: string
  priority: "alta" | "media" | "baja"
}

export const HYPOTHESES: Hypothesis[] = [
  {
    stream: "plantillas",
    title: "Plantilla de planificación de contenido",
    hypothesis:
      "Creemos que creadores que empiezan valorarían una plantilla para planificar 30 días de contenido, porque organizar ideas, guiones y calendario es un problema recurrente.",
    audience: "Personas que empiezan un proyecto de contenido sin equipo.",
    validation:
      "Ofrecerla gratis a cambio de nada (descarga directa) y medir descargas y comentarios. Después, preguntar en una encuesta opcional qué echan en falta.",
    criterion:
      "Provisional: decidir un número mínimo de descargas en 30 días ANTES de publicarla y comprobar que al menos parte de quienes responden la usan más de una semana.",
    prerequisites: "Experimento «producto digital en un fin de semana» terminado. Audiencia mínima que la pueda ver.",
    priority: "alta",
  },
  {
    stream: "guias",
    title: "Guía de verificación de información generada por IA",
    hypothesis:
      "Creemos que profesionales que usan IA a diario quieren una guía práctica para verificar lo que produce, porque los errores con apariencia de verdad son un riesgo real en su trabajo.",
    audience: "Profesionales y autónomos que usan asistentes de IA para redactar o investigar.",
    validation:
      "Medir guardados y comentarios del vídeo «Por qué la IA se inventa cosas» frente a la media de nuestras publicaciones; si destaca, publicar una versión ampliada gratuita y medir su uso.",
    criterion: "Provisional: el vídeo supera la mediana de guardados del canal (con un mínimo de 9 publicaciones registradas).",
    prerequisites: "Al menos 9 publicaciones con métricas registradas en Analíticas.",
    priority: "alta",
  },
  {
    stream: "recursos-digitales",
    title: "Pack de prompts estructurados por profesión",
    hypothesis:
      "Creemos que la plantilla del prompt de 5 piezas, adaptada a profesiones concretas, resolvería el problema de no saber por dónde empezar.",
    audience: "Personas que usan IA de forma ocasional y obtienen respuestas genéricas.",
    validation:
      "Preguntar en comentarios qué profesión quieren ver; publicar gratis la versión para la profesión más pedida y medir guardados y descargas.",
    criterion: "Provisional: al menos una profesión concentra peticiones claras de forma espontánea.",
    prerequisites: "Vídeo «El prompt de 5 piezas» publicado y con comentarios.",
    priority: "media",
  },
  {
    stream: "colaboraciones",
    title: "Colaboraciones de contenido con otros creadores",
    hypothesis:
      "Creemos que experimentos conjuntos con creadores afines (por ejemplo, la misma prueba hecha por dos canales) pueden atraer audiencia cualificada a ambos.",
    audience: "Creadores hispanohablantes de tecnología, productividad o negocios.",
    validation:
      "Fase futura. Requiere autorización expresa antes de contactar con nadie. Preparar primero un dosier honesto con datos reales del canal.",
    criterion: "Provisional: definir qué audiencia mínima y qué encaje temático harían razonable proponerlo.",
    prerequisites: "Datos reales de al menos 2 meses. Autorización para contactar.",
    priority: "baja",
  },
  {
    stream: "patrocinios",
    title: "Patrocinios de herramientas que ya usamos",
    hypothesis:
      "Creemos que, con una audiencia de nicho, podríamos aceptar patrocinios de herramientas que ya usamos de verdad, siempre identificados como publicidad.",
    audience: "Empresas de software para creadores y pequeñas empresas.",
    validation:
      "Fase futura. Antes de nada: redactar una política de patrocinios (qué aceptamos, cómo se identifica la publicidad, derecho a publicar resultados negativos). Revisar la normativa de publicidad aplicable.",
    criterion: "Provisional: no se valida hasta disponer de métricas reales estables y una política publicada.",
    prerequisites: "Política de patrocinios escrita. Métricas reales de varios meses.",
    priority: "baja",
  },
  {
    stream: "productos-propios",
    title: "Content Studio como producto",
    hypothesis:
      "Creemos que otros creadores sin rostro podrían querer una herramienta local y gratuita como este Content Studio para organizar su producción.",
    audience: "Creadores individuales que no quieren depender de suscripciones.",
    validation:
      "Mostrar el Studio en un vídeo del pilar Experimentos y medir cuántas personas preguntan por él en comentarios.",
    criterion: "Provisional: aparecen peticiones espontáneas y repetidas para usar la herramienta.",
    prerequisites: "Studio estable tras un ciclo completo de 30 días de uso real.",
    priority: "media",
  },
  {
    stream: "productos-propios",
    title: "Newsletter con el diario de experimentos",
    hypothesis:
      "Creemos que una parte de la audiencia quiere los datos completos de cada experimento, que no caben en un vídeo corto, y que eso justifica un canal propio.",
    audience: "Seguidores que comentan o guardan los vídeos de experimentos.",
    validation:
      "Publicar los datos completos de un experimento en una página y medir cuántas personas acceden desde el vídeo.",
    criterion: "Provisional: fijar un porcentaje mínimo de visitas desde el vídeo antes de publicar.",
    prerequisites: "Primer experimento terminado. Revisar obligaciones de protección de datos si se recogen correos.",
    priority: "media",
  },
]
