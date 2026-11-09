// Calendario editorial de 30 días (lunes, miércoles y viernes) y tareas de
// preparación. Las fechas son desplazamientos en días desde el primer lunes de
// lanzamiento, que se calcula al crear la base de datos.

export const POSTS: { day: number; idea: string; time: string; notes?: string }[] = [
  { day: 0, idea: "prompt-5-piezas", time: "18:00", notes: "Publicación de lanzamiento." },
  { day: 2, idea: "anatomia-gancho", time: "18:00" },
  { day: 4, idea: "exp-semana-ia", time: "18:00", notes: "Requiere haber completado los 7 días del experimento." },
  { day: 7, idea: "validar-48h", time: "18:00" },
  { day: 9, idea: "alucinaciones", time: "18:00" },
  { day: 11, idea: "exp-producto-finde", time: "18:00", notes: "El experimento se ejecuta el fin de semana anterior." },
  { day: 14, idea: "metricas-vanidad", time: "18:00" },
  { day: 16, idea: "privacidad-ia", time: "18:00" },
  { day: 18, idea: "precio-horas", time: "18:00" },
  { day: 21, idea: "ventana-contexto", time: "18:00", notes: "Guion pendiente: terminar investigación en la semana 3." },
  { day: 23, idea: "exp-plan-negocio", time: "18:00" },
  { day: 25, idea: "reutilizacion", time: "18:00", notes: "Mostrar el proceso real de reutilizar un vídeo ya publicado." },
  { day: 28, idea: "negocio-pasivo", time: "18:00" },
]

export const TASKS: { day: number; title: string; priority: "alta" | "media" | "baja"; idea?: string; notes?: string }[] =
  [
    {
      day: -6,
      title: "Decidir plataformas iniciales y nombre de usuario",
      priority: "alta",
      notes: "Decisión humana. El Studio no abre cuentas ni publica nada.",
    },
    {
      day: -5,
      title: "Definir la voz de la narración (voz propia o síntesis con licencia comercial)",
      priority: "alta",
    },
    { day: -4, title: "Iniciar experimento: 7 días con la IA planificando la semana", priority: "alta", idea: "exp-semana-ia" },
    { day: -3, title: "Producir y editar «El prompt de 5 piezas»", priority: "alta", idea: "prompt-5-piezas" },
    { day: -2, title: "Producir y editar «Anatomía de un gancho»", priority: "media", idea: "anatomia-gancho" },
    { day: -1, title: "Exportar la primera copia de seguridad (Ajustes → Exportar)", priority: "media" },
    { day: 3, title: "Pasar el control de calidad al vídeo del experimento semanal", priority: "alta", idea: "exp-semana-ia" },
    {
      day: 6,
      title: "Ejecutar experimento: producto digital en un fin de semana",
      priority: "alta",
      idea: "exp-producto-finde",
    },
    { day: 7, title: "Registrar las métricas de la semana 1 en Analíticas", priority: "media" },
    { day: 14, title: "Registrar las métricas de la semana 2 y comparar publicaciones", priority: "media" },
    { day: 16, title: "Terminar la investigación de «La ventana de contexto»", priority: "media", idea: "ventana-contexto" },
    { day: 19, title: "Ejecutar la auditoría del plan de negocio generado por IA", priority: "alta", idea: "exp-plan-negocio" },
    {
      day: 21,
      title: "Retrospectiva de tres semanas con los datos registrados",
      priority: "alta",
      notes: "Revisar qué pilar y qué formato funcionan según los datos reales, no según impresiones.",
    },
    { day: 29, title: "Planificar el siguiente ciclo de 30 días", priority: "alta" },
  ]
