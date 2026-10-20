/**
 * Tests de ejemplo incluidos en la web. Sirven para:
 *  1. que cualquiera pruebe el producto sin registrarse,
 *  2. enseñar a creadores y negocios qué pueden hacer con QuizLab,
 *  3. generar tráfico orgánico cuando la gente comparte su resultado.
 *
 * Para añadir uno nuevo: copia un bloque, cambia el `slug` (será la URL
 * /t/<slug>) y ejecuta `npm test`: un test comprueba que todos son válidos.
 */
import type { Quiz } from "./schema";

export type CatalogEntry = {
  slug: string;
  /** Para quién es útil este ejemplo (se muestra en la landing). */
  useCase: string;
  quiz: Quiz;
};

export const CATALOG: CatalogEntry[] = [
  {
    slug: "emprendedor",
    useCase: "Coaches y formadores",
    quiz: {
      v: 1,
      kind: "personality",
      title: "¿Qué tipo de emprendedor eres?",
      description: "7 preguntas rápidas para descubrir tu estilo para crear y hacer crecer proyectos.",
      emoji: "🚀",
      color: "coral",
      author: "QuizLab",
      results: [
        {
          title: "Visionario",
          emoji: "🔭",
          description:
            "Ves oportunidades donde otros ven problemas. Tu reto: aterrizar las ideas en pasos pequeños y rodearte de gente que ejecute.",
        },
        {
          title: "Estratega",
          emoji: "♟️",
          description:
            "Planificas, mides y decides con datos. Tu reto: lanzar antes de que todo esté perfecto y aprender de los clientes reales.",
        },
        {
          title: "Creador",
          emoji: "🎨",
          description:
            "Te mueve construir cosas bonitas y útiles con tus manos. Tu reto: dedicar tiempo a vender lo que creas, no solo a crearlo.",
        },
        {
          title: "Conector",
          emoji: "🤝",
          description:
            "Tu superpoder son las personas: abres puertas y generas confianza. Tu reto: convertir tu red en un sistema que funcione sin ti.",
        },
      ],
      questions: [
        {
          text: "Tienes una tarde libre. ¿Qué haces?",
          answers: [
            { text: "Imagino un proyecto nuevo y apunto ideas", result: 0 },
            { text: "Reviso mis números y objetivos del mes", result: 1 },
            { text: "Me pongo a diseñar o construir algo", result: 2 },
            { text: "Quedo con alguien interesante a tomar algo", result: 3 },
          ],
        },
        {
          text: "¿Qué frase te define mejor?",
          answers: [
            { text: "«¿Y si lo hacemos diferente?»", result: 0 },
            { text: "«Primero, veamos los datos»", result: 1 },
            { text: "«Déjame que te enseñe un prototipo»", result: 2 },
            { text: "«Conozco a la persona perfecta para esto»", result: 3 },
          ],
        },
        {
          text: "Tu proyecto no despega. ¿Cuál es tu primer movimiento?",
          answers: [
            { text: "Pivotar hacia una idea más ambiciosa", result: 0 },
            { text: "Analizar qué métrica está fallando", result: 1 },
            { text: "Mejorar el producto hasta que enamore", result: 2 },
            { text: "Preguntar a clientes y mentores", result: 3 },
          ],
        },
        {
          text: "¿Qué tarea disfrutas más?",
          answers: [
            { text: "Definir la visión a cinco años", result: 0 },
            { text: "Montar un plan con fechas y prioridades", result: 1 },
            { text: "Crear el producto o el contenido", result: 2 },
            { text: "Negociar y cerrar alianzas", result: 3 },
          ],
        },
        {
          text: "¿Qué te quita el sueño?",
          answers: [
            { text: "Quedarme pensando en pequeño", result: 0 },
            { text: "Tomar una decisión sin información", result: 1 },
            { text: "Lanzar algo de lo que no estoy orgulloso", result: 2 },
            { text: "Decepcionar a la gente que confía en mí", result: 3 },
          ],
        },
        {
          text: "Elige una herramienta para una isla desierta:",
          answers: [
            { text: "Una libreta para ideas", result: 0 },
            { text: "Una hoja de cálculo", result: 1 },
            { text: "Un kit de herramientas", result: 2 },
            { text: "Un teléfono con buena cobertura", result: 3 },
          ],
        },
        {
          text: "¿Cómo te describiría tu mejor amigo?",
          answers: [
            { text: "Soñador e inquieto", result: 0 },
            { text: "Organizado y racional", result: 1 },
            { text: "Detallista y creativo", result: 2 },
            { text: "Sociable y generoso", result: 3 },
          ],
        },
      ],
    },
  },
  {
    slug: "tecnologia",
    useCase: "Academias y divulgadores",
    quiz: {
      v: 1,
      kind: "trivia",
      title: "¿Cuánto sabes de tecnología?",
      description: "10 preguntas de cultura tecnológica. ¿Consigues el pleno?",
      emoji: "💻",
      color: "blue",
      author: "QuizLab",
      results: [
        {
          title: "Analógico con encanto",
          emoji: "📻",
          min: 0,
          description: "La tecnología no es lo tuyo… todavía. ¡Buena excusa para volver a intentarlo!",
        },
        {
          title: "Usuario curioso",
          emoji: "🔍",
          min: 4,
          description: "Te defiendes bien y tienes curiosidad. Un par de lecturas más y subes de nivel.",
        },
        {
          title: "Geek certificado",
          emoji: "🤓",
          min: 7,
          description: "Sabes de lo que hablas. Tus amigos te llaman cuando el wifi falla, ¿verdad?",
        },
        {
          title: "Leyenda digital",
          emoji: "🏆",
          min: 10,
          description: "Pleno absoluto. Sabes más de tecnología que la mayoría. Reta a alguien a superarte.",
        },
      ],
      questions: [
        {
          text: "¿Qué significa «HTML»?",
          correct: 0,
          answers: [
            { text: "HyperText Markup Language" },
            { text: "High Tech Modern Language" },
            { text: "Home Tool Markup Language" },
            { text: "Hyper Transfer Main Link" },
          ],
        },
        {
          text: "¿A quién se considera la primera programadora de la historia?",
          correct: 2,
          answers: [{ text: "Marie Curie" }, { text: "Grace Hopper" }, { text: "Ada Lovelace" }, { text: "Hedy Lamarr" }],
        },
        {
          text: "¿En qué año se presentó el primer iPhone?",
          correct: 1,
          answers: [{ text: "2005" }, { text: "2007" }, { text: "2009" }, { text: "2010" }],
        },
        {
          text: "¿Cuántos bits tiene un byte?",
          correct: 3,
          answers: [{ text: "2" }, { text: "4" }, { text: "16" }, { text: "8" }],
        },
        {
          text: "¿Qué lenguaje se usa para dar estilo (colores, tamaños…) a una web?",
          correct: 0,
          answers: [{ text: "CSS" }, { text: "SQL" }, { text: "Python" }, { text: "PHP" }],
        },
        {
          text: "¿Quién inventó la World Wide Web?",
          correct: 1,
          answers: [{ text: "Bill Gates" }, { text: "Tim Berners-Lee" }, { text: "Steve Jobs" }, { text: "Linus Torvalds" }],
        },
        {
          text: "En programación, ¿qué es un «bug»?",
          correct: 2,
          answers: [
            { text: "Un programa espía" },
            { text: "Un tipo de virus" },
            { text: "Un error en el código" },
            { text: "Una copia de seguridad" },
          ],
        },
        {
          text: "¿Qué unidad es la más grande?",
          correct: 3,
          answers: [{ text: "Megabyte" }, { text: "Kilobyte" }, { text: "Gigabyte" }, { text: "Terabyte" }],
        },
        {
          text: "¿Cuál de estos NO es un lenguaje de programación?",
          correct: 3,
          answers: [{ text: "Python" }, { text: "JavaScript" }, { text: "Rust" }, { text: "HTTP" }],
        },
        {
          text: "¿Qué significa «USB»?",
          correct: 0,
          answers: [
            { text: "Universal Serial Bus" },
            { text: "Unified System Backup" },
            { text: "Ultra Speed Bandwidth" },
            { text: "User Service Board" },
          ],
        },
      ],
    },
  },
  {
    slug: "creador-de-contenido",
    useCase: "Creadores de contenido",
    quiz: {
      v: 1,
      kind: "personality",
      title: "¿Qué tipo de creador de contenido eres?",
      description: "Descubre tu estilo natural para conectar con tu audiencia (y cómo sacarle partido).",
      emoji: "🎬",
      color: "violet",
      author: "QuizLab",
      results: [
        {
          title: "El Profe",
          emoji: "📚",
          description:
            "Tu audiencia vuelve porque aprende contigo. Formatos ideales: carruseles paso a paso, tutoriales y guías descargables.",
        },
        {
          title: "El Showman",
          emoji: "🎭",
          description:
            "Entretienes sin esfuerzo. Formatos ideales: vídeos cortos, tendencias con tu toque y series con personajes recurrentes.",
        },
        {
          title: "La Inspiración",
          emoji: "✨",
          description:
            "Tu historia mueve a la gente. Formatos ideales: storytelling, antes y después, y reflexiones personales.",
        },
        {
          title: "El Analista",
          emoji: "📊",
          description:
            "Explicas el porqué de las cosas con datos. Formatos ideales: hilos, comparativas, análisis y opiniones argumentadas.",
        },
      ],
      questions: [
        {
          text: "¿Qué tipo de publicación te sale sola?",
          answers: [
            { text: "Un tutorial paso a paso", result: 0 },
            { text: "Un vídeo de humor", result: 1 },
            { text: "Una historia personal", result: 2 },
            { text: "Un análisis con datos", result: 3 },
          ],
        },
        {
          text: "¿Qué comentario te haría más ilusión?",
          answers: [
            { text: "«Gracias, por fin lo he entendido»", result: 0 },
            { text: "«Me he reído muchísimo»", result: 1 },
            { text: "«Esto me ha cambiado el día»", result: 2 },
            { text: "«Qué buen argumento»", result: 3 },
          ],
        },
        {
          text: "Antes de grabar, tú…",
          answers: [
            { text: "Escribo un guion con los pasos", result: 0 },
            { text: "Improviso y repito hasta que tiene gracia", result: 1 },
            { text: "Pienso en cómo quiero que se sientan", result: 2 },
            { text: "Investigo y comparo fuentes", result: 3 },
          ],
        },
        {
          text: "¿Qué red social te sienta mejor?",
          answers: [
            { text: "YouTube", result: 0 },
            { text: "TikTok", result: 1 },
            { text: "Instagram", result: 2 },
            { text: "X / LinkedIn", result: 3 },
          ],
        },
        {
          text: "Tu mayor miedo como creador:",
          answers: [
            { text: "Explicar algo mal", result: 0 },
            { text: "Aburrir", result: 1 },
            { text: "No ser auténtico", result: 2 },
            { text: "Decir algo sin pruebas", result: 3 },
          ],
        },
        {
          text: "Un seguidor te pide consejo. Tú…",
          answers: [
            { text: "Le mando una guía con recursos", result: 0 },
            { text: "Le respondo con un audio divertido", result: 1 },
            { text: "Le cuento cómo lo viví yo", result: 2 },
            { text: "Le pregunto por sus datos antes de opinar", result: 3 },
          ],
        },
      ],
    },
  },
  {
    slug: "cafe",
    useCase: "Pequeños negocios",
    quiz: {
      v: 1,
      kind: "personality",
      title: "¿Qué café eres según tu personalidad?",
      description: "Ejemplo de test para una cafetería: recomienda un producto y da una razón para volver.",
      emoji: "☕",
      color: "yellow",
      author: "Cafetería de ejemplo",
      results: [
        {
          title: "Espresso",
          emoji: "⚡",
          description: "Directo, intenso y sin rodeos. Vas al grano y la gente lo agradece. Tu pedido: un espresso doble.",
        },
        {
          title: "Latte",
          emoji: "🥛",
          description: "Cálido y fácil de querer. Siempre tienes tiempo para una buena charla. Tu pedido: latte con canela.",
        },
        {
          title: "Cold brew",
          emoji: "🧊",
          description: "Tranquilo, original y un poco misterioso. No sigues modas, las creas. Tu pedido: cold brew con naranja.",
        },
        {
          title: "Capuchino",
          emoji: "☁️",
          description: "Equilibrado y con un punto divertido. Te adaptas a cualquier plan. Tu pedido: capuchino con cacao.",
        },
      ],
      questions: [
        {
          text: "¿Cómo empiezas tu día ideal?",
          answers: [
            { text: "Directo a la acción", result: 0 },
            { text: "Desayuno largo y sin prisas", result: 1 },
            { text: "Paseo en silencio", result: 2 },
            { text: "Lo que surja, me adapto", result: 3 },
          ],
        },
        {
          text: "Elige un plan de fin de semana:",
          answers: [
            { text: "Deporte a primera hora", result: 0 },
            { text: "Comida con amigos", result: 1 },
            { text: "Exposición o librería", result: 2 },
            { text: "Escapada improvisada", result: 3 },
          ],
        },
        {
          text: "¿Qué música suena en tus cascos?",
          answers: [
            { text: "Algo con mucha energía", result: 0 },
            { text: "Pop de siempre", result: 1 },
            { text: "Indie o jazz", result: 2 },
            { text: "Una lista aleatoria", result: 3 },
          ],
        },
        {
          text: "Tus amigos dicen que eres…",
          answers: [
            { text: "Eficiente", result: 0 },
            { text: "Cariñoso", result: 1 },
            { text: "Original", result: 2 },
            { text: "Divertido", result: 3 },
          ],
        },
        {
          text: "¿Dónde te sentarías en la cafetería?",
          answers: [
            { text: "En la barra, de pie", result: 0 },
            { text: "En el sofá grande", result: 1 },
            { text: "En la mesa del rincón", result: 2 },
            { text: "En la terraza", result: 3 },
          ],
        },
      ],
    },
  },
];

export function findCatalogEntry(slug: string): CatalogEntry | undefined {
  return CATALOG.find((entry) => entry.slug === slug);
}
