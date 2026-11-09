import { api } from "./api.js"

// Metadatos del esquema (etiquetas y opciones) servidos por /api/meta.
// Es la misma definición que usa el servidor para validar.
export const meta = { entities: {} }

export async function loadMeta() {
  Object.assign(meta, await api.meta())
}

export function fieldDef(entity, key) {
  return meta.entities[entity].fields[key]
}

export function options(entity, key) {
  return fieldDef(entity, key).options
}

export function label(entity, key, value) {
  return options(entity, key)[value] ?? value ?? "—"
}

export const PILLAR_KEYS = ["ia", "negocios", "marketing", "experimentos"]
export const STAGE_KEYS = ["idea", "investigacion", "guion", "produccion", "edicion", "revision", "publicado"]

export function pillarName(value) {
  return label("ideas", "pillar", value)
}
