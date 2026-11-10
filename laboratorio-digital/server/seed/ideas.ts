// 30 ideas iniciales, repartidas entre los cuatro pilares. Ninguna incluye
// resultados: las ideas de experimento describen qué se probará, no qué saldrá.

type Seed = {
  key: string
  title: string
  summary: string
  pillar: "ia" | "negocios" | "marketing" | "experimentos"
  format: "vertical" | "largo" | "carrusel" | "hilo"
  priority: "alta" | "media" | "baja"
  notes?: string
}

export const IDEAS: Seed[] = [
  // IA SIN LÍMITES ----------------------------------------------------------
  {
    key: "prompt-5-piezas",
    title: "El prompt de 5 piezas",
    summary:
      "Desmontar un buen prompt en cinco piezas (rol, contexto, tarea, formato y límites) y comparar en pantalla la misma petición con y sin estructura.",
    pillar: "ia",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "alucinaciones",
    title: "Por qué la IA se inventa cosas (y cómo pillarla)",
    summary:
      "Explicar sin tecnicismos por qué un modelo de lenguaje puede generar datos falsos con total seguridad y dar una rutina de verificación de cuatro pasos.",
    pillar: "ia",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "privacidad-ia",
    title: "Antes de pegar datos en una IA, mira estas 4 cosas",
    summary:
      "Qué revisar en la política de privacidad y los ajustes de una herramienta de IA antes de usarla con información de clientes o del negocio.",
    pillar: "ia",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "ventana-contexto",
    title: "La ventana de contexto explicada con una mesa de trabajo",
    summary:
      "Usar la metáfora de una mesa con espacio limitado para explicar por qué la IA «olvida» el principio de una conversación larga y cómo trabajar con ello.",
    pillar: "ia",
    format: "vertical",
    priority: "media",
  },
  {
    key: "ia-local",
    title: "IA sin internet: qué significa ejecutar un modelo en tu ordenador",
    summary:
      "Qué es un modelo local, qué ventajas de privacidad tiene, qué limitaciones de hardware implica y cuándo no merece la pena. Requiere contrastar requisitos actuales.",
    pillar: "ia",
    format: "largo",
    priority: "media",
  },
  {
    key: "tokens",
    title: "Tokens: por qué la IA no cuenta palabras como tú",
    summary:
      "Visualizar cómo un texto se trocea en tokens y por qué eso afecta a los límites de longitud y al coste de las herramientas de pago.",
    pillar: "ia",
    format: "carrusel",
    priority: "baja",
  },
  {
    key: "ia-no-decide",
    title: "Tres decisiones que no deberías delegar en una IA",
    summary:
      "Salud, asuntos legales y decisiones financieras importantes: por qué la IA puede ayudar a preparar preguntas pero no sustituye a un profesional.",
    pillar: "ia",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "mismo-prompt-tres",
    title: "Mismo prompt, tres asistentes: ¿quién sigue mejor las instrucciones?",
    summary:
      "Comparativa con una rúbrica fija publicada antes de la prueba. Solo herramientas con plan gratuito. El resultado se documenta tal cual salga.",
    pillar: "ia",
    format: "largo",
    priority: "media",
    notes: "Definir la rúbrica antes de ejecutar. Guardar capturas de todas las respuestas.",
  },

  // NEGOCIOS DEL FUTURO -----------------------------------------------------
  {
    key: "validar-48h",
    title: "Validar una idea de negocio en 48 horas sin gastar",
    summary:
      "Un método en tres fases (problema, señales, compromiso) para descartar o reforzar una idea antes de construir nada.",
    pillar: "negocios",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "precio-horas",
    title: "¿Tu precio cubre tus horas? La cuenta que conviene hacer",
    summary:
      "Fórmula sencilla para calcular un precio mínimo por hora a partir de gastos, objetivo de ingresos y horas realmente facturables. Ejemplo con cifras ficticias.",
    pillar: "negocios",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "negocio-pasivo",
    title: "El trabajo oculto de un «ingreso pasivo»",
    summary:
      "Enumerar las tareas recurrentes que exige un producto digital (soporte, actualizaciones, promoción, fiscalidad) para desmontar la idea de dinero sin esfuerzo.",
    pillar: "negocios",
    format: "vertical",
    priority: "media",
  },
  {
    key: "mapa-procesos",
    title: "El mapa de procesos de un negocio de una sola persona",
    summary:
      "Cómo listar todo lo que haces en una semana, agruparlo en procesos y decidir qué documentar, automatizar o eliminar.",
    pillar: "negocios",
    format: "carrusel",
    priority: "media",
  },
  {
    key: "micro-saas",
    title: "Micro-SaaS: cinco preguntas antes de escribir una línea de código",
    summary:
      "Problema, cliente, canal, precio y mantenimiento: las preguntas que conviene responder antes de construir un software pequeño de suscripción.",
    pillar: "negocios",
    format: "vertical",
    priority: "baja",
  },
  {
    key: "tendencia-humo",
    title: "Tres señales de que una tendencia es humo",
    summary:
      "Promesas sin casos verificables, urgencia artificial y vendedores de formación sobre la propia tendencia. Criterios para analizar antes de subirse a una moda.",
    pillar: "negocios",
    format: "vertical",
    priority: "media",
  },
  {
    key: "productizar",
    title: "Del servicio al producto: la escalera de productización",
    summary:
      "Pasos intermedios entre vender horas y vender un producto: servicio estandarizado, paquete cerrado, plantilla, curso o herramienta.",
    pillar: "negocios",
    format: "largo",
    priority: "baja",
  },
  {
    key: "automatizar-sin-codigo",
    title: "Automatizar sin programar: qué tareas sí y cuáles no",
    summary:
      "Criterios para decidir si una tarea merece automatizarse: frecuencia, reglas claras, coste del error y tiempo de mantenimiento.",
    pillar: "negocios",
    format: "vertical",
    priority: "alta",
  },

  // MARKETING INTELIGENTE ---------------------------------------------------
  {
    key: "anatomia-gancho",
    title: "Anatomía de un gancho: lo que pasa en los primeros segundos",
    summary:
      "Cuatro tipos de gancho (pregunta, contradicción, promesa concreta y escena en curso) con ejemplos reescritos en directo a partir de una frase débil.",
    pillar: "marketing",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "metricas-vanidad",
    title: "Métricas de vanidad vs métricas que deciden",
    summary:
      "Por qué las visualizaciones por sí solas dicen poco y cómo elegir la métrica según el objetivo de cada pieza: alcance, interés o confianza.",
    pillar: "marketing",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "reutilizacion",
    title: "Una idea, siete formatos",
    summary:
      "Mostrar cómo un mismo guion se convierte en vídeo vertical, carrusel, hilo, newsletter, versión larga, clip de cita y pregunta a la comunidad.",
    pillar: "marketing",
    format: "vertical",
    priority: "media",
  },
  {
    key: "copy-ia",
    title: "Texto con IA que no suena a IA: edición en tres pasadas",
    summary:
      "Pasada de estructura, pasada de voz propia y pasada de recorte. Antes y después sobre un mismo texto de ejemplo.",
    pillar: "marketing",
    format: "carrusel",
    priority: "alta",
  },
  {
    key: "cliente-ideal",
    title: "Tu cliente ideal en una sola hoja",
    summary:
      "Plantilla de una página: situación, problema, intentos previos, objeciones y palabras que usa. Sin datos demográficos inventados.",
    pillar: "marketing",
    format: "carrusel",
    priority: "baja",
  },
  {
    key: "embudo-cafeteria",
    title: "El embudo de ventas explicado con una cafetería",
    summary:
      "Descubrimiento, visita, primera compra y cliente habitual: traducir las fases de un embudo a una situación cotidiana.",
    pillar: "marketing",
    format: "vertical",
    priority: "media",
  },
  {
    key: "canal-propio",
    title: "Por qué depender solo de una red social es un riesgo",
    summary:
      "Diferencia entre audiencia prestada (plataformas) y canal propio (lista de correo, web). Qué pasa si cambian las reglas del algoritmo o la cuenta.",
    pillar: "marketing",
    format: "vertical",
    priority: "baja",
  },

  // EXPERIMENTOS ------------------------------------------------------------
  {
    key: "exp-semana-ia",
    title: "Experimento: 7 días dejando que una IA planifique mi semana",
    summary:
      "Durante una semana, una IA organiza el calendario de trabajo a partir de una lista de tareas. Se registra cada día lo planificado frente a lo realizado.",
    pillar: "experimentos",
    format: "vertical",
    priority: "alta",
    notes: "Usar datos de trabajo ficticios o propios no sensibles. Nunca datos de terceros.",
  },
  {
    key: "exp-producto-finde",
    title: "Experimento: un producto digital mínimo en un fin de semana",
    summary:
      "Crear una plantilla útil en 48 horas solo con herramientas gratuitas, cronometrando cada fase. Se documenta qué se termina y qué no.",
    pillar: "experimentos",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "exp-plan-negocio",
    title: "Experimento: pedir a la IA un plan de negocio y auditarlo línea a línea",
    summary:
      "Generar un plan de negocio con IA y revisar cada afirmación: ¿es verificable, es genérica o es falsa? Se clasifican todas en una tabla.",
    pillar: "experimentos",
    format: "vertical",
    priority: "alta",
  },
  {
    key: "exp-resumen-ciego",
    title: "Experimento a ciegas: ¿qué resumen es mejor, el mío o el de la IA?",
    summary:
      "Resumir el mismo texto a mano y con IA, ocultar la autoría y puntuar ambos con una rúbrica fijada de antemano.",
    pillar: "experimentos",
    format: "vertical",
    priority: "media",
  },
  {
    key: "exp-tres-ganchos",
    title: "Experimento: el mismo vídeo con tres ganchos distintos",
    summary:
      "Publicar tres versiones de un vídeo que solo cambian en los primeros segundos y comparar la retención registrada. Requiere varias semanas de datos reales.",
    pillar: "experimentos",
    format: "vertical",
    priority: "media",
    notes: "Solo tiene sentido cuando haya publicaciones reales y métricas registradas en Analíticas.",
  },
  {
    key: "exp-canal-gratis",
    title: "Experimento: producir una semana de vídeos solo con herramientas gratuitas",
    summary:
      "Guion, voz, edición y subtítulos usando únicamente planes gratuitos o software libre. Se documentan límites, marcas de agua y tiempos.",
    pillar: "experimentos",
    format: "largo",
    priority: "alta",
  },
  {
    key: "exp-hoja-calculo",
    title: "Experimento: ¿puede una hoja de cálculo sustituir a una app de tareas?",
    summary:
      "Montar un sistema de tareas con fórmulas y formato condicional y usarlo dos semanas. Se compara con la herramienta habitual en una lista de criterios.",
    pillar: "experimentos",
    format: "vertical",
    priority: "baja",
  },
]
