import type { Database } from "bun:sqlite"
import { localDate } from "../app.ts"
import { insert, update, validate } from "../db.ts"
import type { EntityName } from "../schema.ts"
import { LIBRARY } from "./biblioteca.ts"
import { SCRIPTS } from "./guiones.ts"
import { IDEAS } from "./ideas.ts"
import { HYPOTHESES } from "./negocio.ts"
import { POSTS, TASKS } from "./plan.ts"

// Carga el contenido inicial solo si la base de datos está vacía. Todo pasa por
// la misma validación que la API, así que el contenido inicial cumple el esquema.
export function seedIfEmpty(db: Database, start = nextMonday(new Date())) {
  const empty = (db.query("SELECT COUNT(*) AS n FROM ideas").get() as { n: number }).n === 0
  if (!empty) return false
  db.transaction(() => seed(db, start))()
  return true
}

function seed(db: Database, start: Date) {
  const day = (offset: number) => localDate(new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset))
  const ideas = new Map(
    IDEAS.map((idea) => {
      const { key, ...fields } = idea
      return [key, create(db, "ideas", { ...fields, refs: [] })]
    }),
  )
  const videos = new Map(
    SCRIPTS.map((script) => {
      const idea = ideas.get(script.idea)!
      const { idea: key, ...fields } = script
      const post = POSTS.find((entry) => entry.idea === key)
      const video = create(db, "videos", {
        ...fields,
        title: idea.title,
        pillar: idea.pillar,
        format: idea.format,
        idea_id: idea.id,
        due_date: post ? day(post.day - 2) : null,
        qa: {},
      })
      update(db, "ideas", idea.id, { status: "en-guion", video_id: video.id })
      return [key, video]
    }),
  )
  POSTS.forEach((post) => {
    const video = videos.get(post.idea)!
    create(db, "posts", {
      title: video.title,
      date: day(post.day),
      time: post.time,
      pillar: video.pillar,
      video_id: video.id,
      notes: post.notes,
    })
  })
  TASKS.forEach((task) =>
    create(db, "tasks", {
      title: task.title,
      due_date: day(task.day),
      priority: task.priority,
      video_id: task.idea ? videos.get(task.idea)?.id : undefined,
      notes: task.notes,
    }),
  )
  LIBRARY.forEach((item) => create(db, "library", item))
  HYPOTHESES.forEach((item) => create(db, "hypotheses", item))
}

function create(db: Database, name: EntityName, input: Record<string, unknown>) {
  const result = validate(db, name, input, "create")
  if (!result.ok) throw new Error(`Contenido inicial no válido en ${name}: ${JSON.stringify(result.errors)}`)
  return insert(db, name, result.value) as { id: number; title: string; pillar: string; format: string }
}

// El calendario empieza el lunes siguiente para dejar al menos un día de preparación.
export function nextMonday(from: Date) {
  const ahead = ((8 - from.getDay()) % 7) || 7
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + ahead)
}
