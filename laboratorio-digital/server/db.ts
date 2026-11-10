import { Database } from "bun:sqlite"
import { ENTITIES, entity, type EntityName, type Field } from "./schema.ts"

export type Row = Record<string, unknown> & { id: number }
type SqlValue = string | number | null

export function openDatabase(path: string) {
  const db = new Database(path, { create: true, strict: true })
  db.exec("PRAGMA journal_mode = WAL")
  db.exec("PRAGMA foreign_keys = ON")
  migrate(db)
  return db
}

// Migración aditiva: crea las tablas que falten y añade las columnas nuevas del
// esquema. Nunca borra columnas, así que los datos existentes se conservan.
function migrate(db: Database) {
  Object.entries(ENTITIES).forEach(([name, def]) => {
    db.exec(
      `CREATE TABLE IF NOT EXISTS ${name} (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    )
    const existing = new Set(db.query(`PRAGMA table_info(${name})`).all().map((col) => (col as { name: string }).name))
    Object.entries(def.fields)
      .filter(([column]) => !existing.has(column))
      .forEach(([column, field]) => db.exec(`ALTER TABLE ${name} ADD COLUMN ${column} ${columnType(field)}`))
    Object.entries(def.fields)
      .filter(([column, field]) => field.type === "ref" || column === def.dateField)
      .forEach(([column]) => db.exec(`CREATE INDEX IF NOT EXISTS ${name}_${column} ON ${name}(${column})`))
  })
}

function columnType(field: Field) {
  if (field.type === "ref") return `INTEGER REFERENCES ${field.entity}(id) ON DELETE ${field.onDelete}`
  if (field.type === "int" || field.type === "bool") return "INTEGER"
  return "TEXT"
}

// ---------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------

export type Validation =
  | { ok: true; value: Record<string, SqlValue> }
  | { ok: false; errors: Record<string, string> }

const DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const SYSTEM_FIELDS = new Set(["id", "created_at", "updated_at"])

export function validate(db: Database, name: EntityName, input: unknown, mode: "create" | "update"): Validation {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { ok: false, errors: { _: "Se esperaba un objeto JSON." } }
  const data = input as Record<string, unknown>
  const fields = entity(name).fields
  const unknown = Object.keys(data).filter((key) => !SYSTEM_FIELDS.has(key) && !Object.hasOwn(fields, key))
  const results = Object.entries(fields)
    .filter(([key]) => mode === "create" || Object.hasOwn(data, key))
    .map(([key, field]) => [key, Object.hasOwn(data, key) ? coerce(db, field, data[key]) : defaultFor(field)] as const)
  const errors = Object.fromEntries([
    ...unknown.map((key) => [key, "Campo desconocido."]),
    ...results.flatMap(([key, result]) => ("error" in result ? [[key, result.error]] : [])),
  ])
  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    value: Object.fromEntries(results.flatMap(([key, result]) => ("value" in result ? [[key, result.value]] : []))),
  }
}

function defaultFor(field: Field): { value: SqlValue } | { error: string } {
  if ("required" in field && field.required) return { error: "Campo obligatorio." }
  if (field.type === "enum") return { value: field.default }
  if (field.type === "bool") return { value: 0 }
  if (field.type === "int") return { value: 0 }
  if (field.type === "links" || field.type === "scenes") return { value: "[]" }
  if (field.type === "checklist") return { value: "{}" }
  return { value: null }
}

function coerce(db: Database, field: Field, raw: unknown): { value: SqlValue } | { error: string } {
  const empty = raw === null || raw === undefined || raw === ""
  if (empty && field.type !== "enum") return defaultFor(field)
  if (field.type === "text") {
    if (typeof raw !== "string") return { error: "Debe ser texto." }
    const value = raw.trim()
    if (field.required && !value) return { error: "Campo obligatorio." }
    if (value.length > field.max) return { error: `Máximo ${field.max} caracteres.` }
    return { value }
  }
  if (field.type === "int") {
    const value = typeof raw === "string" ? Number(raw) : raw
    if (typeof value !== "number" || !Number.isInteger(value)) return { error: "Debe ser un número entero." }
    if (value < field.min || value > field.max) return { error: `Debe estar entre ${field.min.toLocaleString("es-ES")} y ${field.max.toLocaleString("es-ES")}.` }
    return { value }
  }
  if (field.type === "bool") {
    if (typeof raw !== "boolean") return { error: "Debe ser verdadero o falso." }
    return { value: raw ? 1 : 0 }
  }
  if (field.type === "date") {
    if (typeof raw !== "string" || !realDate(raw)) return { error: "Fecha no válida." }
    return { value: raw }
  }
  if (field.type === "time") {
    if (typeof raw !== "string" || !TIME.test(raw)) return { error: "Hora no válida (HH:MM)." }
    return { value: raw }
  }
  if (field.type === "url") return safeUrl(raw) ? { value: String(raw).trim() } : { error: "Enlace no válido." }
  if (field.type === "enum") {
    const value = raw ?? field.default
    if (typeof value !== "string" || !Object.hasOwn(field.options, value)) return { error: "Opción no válida." }
    return { value }
  }
  if (field.type === "ref") {
    const value = typeof raw === "string" ? Number(raw) : raw
    if (typeof value !== "number" || !Number.isInteger(value)) return { error: "Referencia no válida." }
    if (!db.query(`SELECT 1 FROM ${field.entity} WHERE id = ?`).get(value)) return { error: "El elemento no existe." }
    return { value }
  }
  if (field.type === "links") return coerceLinks(raw)
  if (field.type === "scenes") return coerceScenes(raw)
  return coerceChecklist(field.items, raw)
}

// Rechaza fechas con formato correcto pero inexistentes, como 2026-02-30.
function realDate(raw: string) {
  if (!DATE.test(raw)) return false
  const [y, m, d] = raw.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

export function safeUrl(raw: unknown) {
  if (typeof raw !== "string" || raw.length > 2000) return false
  return URL.canParse(raw.trim()) && ["http:", "https:"].includes(new URL(raw.trim()).protocol)
}

function coerceLinks(raw: unknown) {
  if (!Array.isArray(raw) || raw.length > 50) return { error: "Máximo 50 referencias." }
  const links = raw.map((item) => ({
    label: typeof item?.label === "string" ? item.label.trim().slice(0, 200) : "",
    url: typeof item?.url === "string" ? item.url.trim() : "",
  }))
  if (links.some((link) => link.url && !safeUrl(link.url))) return { error: "Hay enlaces no válidos (usa http/https)." }
  return { value: JSON.stringify(links.filter((link) => link.label || link.url)) }
}

function coerceScenes(raw: unknown) {
  if (!Array.isArray(raw) || raw.length > 40) return { error: "Máximo 40 escenas." }
  const scenes = raw.map((item) => ({
    description: limit(item?.description, 2000),
    visual: limit(item?.visual, 2000),
    onscreen: limit(item?.onscreen, 1000),
    seconds: Number.isInteger(item?.seconds) && item.seconds >= 0 && item.seconds <= 3600 ? item.seconds : 0,
  }))
  return { value: JSON.stringify(scenes) }
}

function coerceChecklist(items: Record<string, string>, raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { error: "Checklist no válida." }
  const entries = Object.entries(raw)
  if (entries.some(([key, value]) => !Object.hasOwn(items, key) || typeof value !== "boolean"))
    return { error: "Checklist no válida." }
  return { value: JSON.stringify(Object.fromEntries(entries)) }
}

function limit(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : ""
}

// ---------------------------------------------------------------------------
// Repositorio
// ---------------------------------------------------------------------------

export type ListFilter = { equals: Record<string, string>; q?: string; from?: string; to?: string }

export function list(db: Database, name: EntityName, filter: ListFilter = { equals: {} }) {
  const def = entity(name)
  const equals = Object.entries(filter.equals).filter(([key]) => {
    const field = def.fields[key]
    return field && ["enum", "ref", "bool"].includes(field.type)
  })
  const searchable = Object.entries(def.fields)
    .filter(([, field]) => field.type === "text")
    .map(([key]) => key)
  const clauses = [
    ...equals.map(([key]) => `${key} = $f_${key}`),
    ...(filter.q && searchable.length ? [`(${searchable.map((key) => `${key} LIKE $q`).join(" OR ")})`] : []),
    ...(filter.from && def.dateField ? [`${def.dateField} >= $from`] : []),
    ...(filter.to && def.dateField ? [`${def.dateField} <= $to`] : []),
  ]
  const params = Object.fromEntries([
    ...equals.map(([key, value]) => [`f_${key}`, filterValue(def.fields[key], value)]),
    ...(filter.q && searchable.length ? [["q", `%${filter.q}%`]] : []),
    ...(filter.from && def.dateField ? [["from", filter.from]] : []),
    ...(filter.to && def.dateField ? [["to", filter.to]] : []),
  ])
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""
  return db
    .query(`SELECT * FROM ${name} ${where} ORDER BY ${def.order}`)
    .all(params)
    .map((row) => decode(name, row as Row))
}

function filterValue(field: Field, value: string) {
  if (field.type === "enum") return value
  if (field.type === "bool") return value === "true" || value === "1" ? 1 : 0
  return Number(value)
}

export function get(db: Database, name: EntityName, id: number) {
  const row = db.query(`SELECT * FROM ${name} WHERE id = ?`).get(id)
  return row ? decode(name, row as Row) : undefined
}

// `system` permite conservar id y fechas al restaurar una copia de seguridad.
export function insert(
  db: Database,
  name: EntityName,
  value: Record<string, SqlValue>,
  system: { id?: number; created_at?: string; updated_at?: string } = {},
) {
  const now = new Date().toISOString()
  const row = { ...value, created_at: now, updated_at: now, ...system }
  const keys = Object.keys(row)
  const result = db
    .query(`INSERT INTO ${name} (${keys.join(", ")}) VALUES (${keys.map((key) => `$${key}`).join(", ")}) RETURNING id`)
    .get(row) as { id: number }
  return get(db, name, result.id)!
}

export function update(db: Database, name: EntityName, id: number, value: Record<string, SqlValue>) {
  const row = { ...value, updated_at: new Date().toISOString() }
  db.query(
    `UPDATE ${name} SET ${Object.keys(row)
      .map((key) => `${key} = $${key}`)
      .join(", ")} WHERE id = $id`,
  ).run({ ...row, id })
  return get(db, name, id)
}

export function remove(db: Database, name: EntityName, id: number) {
  return db.query(`DELETE FROM ${name} WHERE id = ?`).run(id).changes > 0
}

export function decode(name: EntityName, row: Row) {
  const fields = entity(name).fields
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      const field = fields[key]
      if (!field) return [key, value]
      if (field.type === "bool") return [key, value === 1]
      if (["links", "scenes", "checklist"].includes(field.type))
        return [key, typeof value === "string" ? JSON.parse(value) : field.type === "checklist" ? {} : []]
      return [key, value]
    }),
  ) as Row
}
