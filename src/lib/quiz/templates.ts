/**
 * Plantillas para empezar en el editor. Son tests cortos y realistas que la
 * persona puede modificar: empezar desde algo concreto es mucho más fácil que
 * desde una página en blanco.
 */
import type { Quiz } from "./schema";

export type Template = { id: string; label: string; description: string; quiz: Quiz };

export const TEMPLATES: Template[] = [
  {
    id: "personality",
    label: "Test de personalidad",
    description: "«¿Qué tipo de… eres?». Cada respuesta suma a un resultado.",
    quiz: {
      v: 1,
      kind: "personality",
      title: "¿Qué tipo de viajero eres?",
      description: "Responde 3 preguntas y descubre tu estilo de viaje ideal.",
      emoji: "✈️",
      color: "blue",
      author: "",
      results: [
        { title: "Aventurero", emoji: "🧗", description: "Buscas experiencias intensas y lugares poco conocidos. ¡Tu próxima ruta: la Patagonia!" },
        { title: "Relax total", emoji: "🏖️", description: "Para ti viajar es desconectar: playa, buena comida y cero horarios." },
        { title: "Cultureta", emoji: "🏛️", description: "Museos, historia y barrios con encanto. Vuelves de cada viaje sabiendo más." },
      ],
      questions: [
        {
          text: "¿Qué no puede faltar en tu maleta?",
          answers: [
            { text: "Botas de montaña", result: 0 },
            { text: "Bañador y crema solar", result: 1 },
            { text: "Una guía de la ciudad", result: 2 },
          ],
        },
        {
          text: "¿Cómo eliges destino?",
          answers: [
            { text: "Cuanto más remoto, mejor", result: 0 },
            { text: "Donde haga buen tiempo", result: 1 },
            { text: "Por su historia y su arte", result: 2 },
          ],
        },
        {
          text: "Tu plan ideal para el primer día:",
          answers: [
            { text: "Una ruta de senderismo", result: 0 },
            { text: "Tumbona y libro", result: 1 },
            { text: "Visita guiada por el centro", result: 2 },
          ],
        },
      ],
    },
  },
  {
    id: "trivia",
    label: "Test de conocimientos",
    description: "Preguntas con respuesta correcta y resultado según los aciertos.",
    quiz: {
      v: 1,
      kind: "trivia",
      title: "¿Cuánto sabes de nutrición?",
      description: "3 preguntas para poner a prueba lo que sabes.",
      emoji: "🥑",
      color: "green",
      author: "",
      results: [
        { title: "Aprendiz", emoji: "🌱", min: 0, description: "Tienes mucho por descubrir. ¡Sígueme para aprender un poco cada semana!" },
        { title: "Bien informado", emoji: "🥗", min: 2, description: "Sabes más que la media. Un par de detalles y serás experto." },
        { title: "Experto", emoji: "🏅", min: 3, description: "¡Pleno! Reta a tus amigos a igualarte." },
      ],
      questions: [
        {
          text: "¿Qué nutriente aporta más energía por gramo?",
          correct: 2,
          answers: [{ text: "Proteínas" }, { text: "Hidratos de carbono" }, { text: "Grasas" }],
        },
        {
          text: "¿Cuál de estos alimentos tiene más fibra?",
          correct: 0,
          answers: [{ text: "Lentejas" }, { text: "Arroz blanco" }, { text: "Pechuga de pollo" }],
        },
        {
          text: "¿Qué vitamina produce el cuerpo al tomar el sol?",
          correct: 1,
          answers: [{ text: "Vitamina C" }, { text: "Vitamina D" }, { text: "Vitamina B12" }],
        },
      ],
    },
  },
];

/** Test vacío (mínimo válido en estructura, con textos por rellenar). */
export function blankQuiz(): Quiz {
  return {
    v: 1,
    kind: "personality",
    title: "",
    description: "",
    emoji: "✨",
    color: "violet",
    author: "",
    results: [
      { title: "", emoji: "🌟", description: "" },
      { title: "", emoji: "🔥", description: "" },
    ],
    questions: [{ text: "", answers: [{ text: "", result: 0 }, { text: "", result: 1 }] }],
  };
}
