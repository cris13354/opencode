import type { Database } from "bun:sqlite"
import path from "node:path"
import { decode, get, insert, list, remove, update, validate, type Row } from "./db.ts"
import { ENTITIES, FORMATS, isEntityName, PILLARS, QA_ITEMS, STAGES, type EntityName } from "./schema.ts"

export type AppOptions = { db: Database; publicDir: string; backupDir?: string }

const MAX_BODY = 1_000_000
const MAX_RESTORE_BODY = 20_000_000
const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"])

// Content Security Policy estricta: sin scripts ni estilos en línea y sin
// recursos de terceros. Todo el proyecto se sirve desde el propio origen.
const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

export function createApp(options: AppOptions) {
  return {
    async fetch(req: Request) {
      const response = await route(req, options).catch((error: unknown) => {
        if (error instanceof HttpError) return json({ error: error.message, fields: error.fields }, error.status)
        console.error(error)
        return json({ error: "Error interno del servidor." }, 500)
      })
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => response.headers.set(key, value))
      return response
    },
  }
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message)
  }
}

async function route(req: Request, options: AppOptions) {
  const url = new URL(req.url)
  // Protección frente a DNS rebinding: solo se aceptan nombres de host locales.
  if (!LOOPBACK.has(url.hostname === "::1" ? "[::1]" : url.hostname)) throw new HttpError(403, "Host no permitido.")
  if (url.pathname.startsWith("/api/")) return api(req, url, options)
  if (req.method !== "GET" && req.method !== "HEAD") throw new HttpError(405, "Método no permitido.")
  return serveStatic(url.pathname, options.publicDir)
}

async function api(req: Request, url: URL, options: AppOptions) {
  const db = options.db
  const parts = url.pathname.slice("/api/".length).split("/").filter(Boolean)
  const method = req.method
  if (method !== "GET") requireSameOrigin(req, url)

  if (method === "GET" && parts[0] === "meta" && parts.length === 1) return json(meta())
  if (method === "GET" && parts[0] === "dashboard" && parts.length === 1) return json(dashboard(db))
  if (method === "GET" && parts[0] === "backup" && parts.length === 1)
    return json(backup(db), 200, {
      "Content-Disposition": `attachment; filename="laboratorio-digital-${localDate()}.json"`,
    })
  if (method === "POST" && parts[0] === "restore" && parts.length === 1)
    return json(restore(db, await readJson(req, MAX_RESTORE_BODY), options.backupDir))

  const name = parts[0] ?? ""
  if (!isEntityName(name)) throw new HttpError(404, "Recurso no encontrado.")
  const id = parts[1] === undefined ? undefined : parseId(parts[1])

  if (name === "ideas" && id !== undefined && parts[2] === "convert" && method === "POST" && parts.length === 3)
    return convertIdea(db, id)
  if (name === "videos" && id !== undefined && parts[2] === "markdown" && method === "GET" && parts.length === 3)
    return markdown(db, id)
  if (parts.length > 2) throw new HttpError(404, "Recurso no encontrado.")

  if (id === undefined && method === "GET") return json(list(db, name, filterFrom(url)))
  if (id === undefined && method === "POST") {
    const result = validate(db, name, await readJson(req, MAX_BODY), "create")
    if (!result.ok) throw new HttpError(422, "Revisa los campos marcados.", result.errors)
    return json(insert(db, name, result.value), 201)
  }
  if (id === undefined) throw new HttpError(405, "Método no permitido.")

  const current = get(db, name, id)
  if (!current) throw new HttpError(404, "No existe.")
  if (method === "GET") return json(current)
  if (method === "PUT" || method === "PATCH") {
    const result = validate(db, name, await readJson(req, MAX_BODY), "update")
    if (!result.ok) throw new HttpError(422, "Revisa los campos marcados.", result.errors)
    return json(Object.keys(result.value).length ? update(db, name, id, result.value) : current)
  }
  if (method === "DELETE") return json({ deleted: remove(db, name, id) })
  throw new HttpError(405, "Método no permitido.")
}

// Una petición que modifica datos debe venir del propio Studio. Los navegadores
// siempre envían Origin en peticiones POST/PUT/DELETE desde JavaScript, y exigir
// JSON impide que un formulario de otra web pueda escribir sin preflight CORS.
function requireSameOrigin(req: Request, url: URL) {
  const origin = req.headers.get("origin")
  if (origin && origin !== url.origin) throw new HttpError(403, "Origen no permitido.")
  if (req.method === "DELETE") return
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    throw new HttpError(415, "Se esperaba JSON.")
}

async function readJson(req: Request, max: number) {
  const declared = Number(req.headers.get("content-length") ?? 0)
  if (declared > max) throw new HttpError(413, "Petición demasiado grande.")
  const body = await req.text()
  if (body.length > max) throw new HttpError(413, "Petición demasiado grande.")
  const parsed = safeParse(body)
  if (parsed === undefined) throw new HttpError(400, "JSON no válido.")
  return parsed
}

function safeParse(body: string): unknown {
  try {
    return JSON.parse(body)
  } catch {
    return undefined
  }
}

function parseId(raw: string) {
  if (!/^\d{1,12}$/.test(raw)) throw new HttpError(400, "Identificador no válido.")
  return Number(raw)
}

function filterFrom(url: URL) {
  const reserved = new Set(["q", "from", "to"])
  return {
    equals: Object.fromEntries([...url.searchParams].filter(([key]) => !reserved.has(key))),
    q: url.searchParams.get("q")?.slice(0, 200) || undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  }
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  })
}

// ---------------------------------------------------------------------------
// Operaciones específicas
// ---------------------------------------------------------------------------

function meta() {
  return { entities: ENTITIES, today: localDate() }
}

export function localDate(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function dashboard(db: Database) {
  const today = localDate()
  const scalar = (sql: string, params: Record<string, string> = {}) =>
    (db.query(sql).get(params) as { n: number | null }).n ?? 0
  const stages = Object.fromEntries(Object.keys(STAGES).map((stage) => [stage, 0]))
  db.query("SELECT stage, COUNT(*) AS n FROM videos GROUP BY stage")
    .all()
    .forEach((row) => {
      const typed = row as { stage: string; n: number }
      stages[typed.stage] = typed.n
    })
  const latest = db
    .query(
      `SELECT COUNT(*) AS posts, SUM(views) AS views, SUM(comments) AS comments, SUM(shares) AS shares, SUM(saves) AS saves
       FROM metrics m WHERE m.id = (SELECT id FROM metrics WHERE post_id = m.post_id ORDER BY date DESC, id DESC LIMIT 1)`,
    )
    .get() as Record<string, number | null>
  return {
    today,
    ideas: {
      total: scalar("SELECT COUNT(*) AS n FROM ideas"),
      pending: scalar("SELECT COUNT(*) AS n FROM ideas WHERE status = 'pendiente'"),
      highPriority: scalar("SELECT COUNT(*) AS n FROM ideas WHERE status = 'pendiente' AND priority = 'alta'"),
      top: db
        .query("SELECT * FROM ideas WHERE status = 'pendiente' ORDER BY CASE priority WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END, updated_at DESC LIMIT 5")
        .all()
        .map((row) => decode("ideas", row as Row)),
    },
    videos: {
      total: scalar("SELECT COUNT(*) AS n FROM videos"),
      stages,
      inProduction: scalar("SELECT COUNT(*) AS n FROM videos WHERE stage NOT IN ('idea', 'publicado')"),
      published: stages.publicado ?? 0,
    },
    posts: {
      total: scalar("SELECT COUNT(*) AS n FROM posts"),
      published: scalar("SELECT COUNT(*) AS n FROM posts WHERE status = 'publicada'"),
      next7: scalar(
        "SELECT COUNT(*) AS n FROM posts WHERE date >= $today AND date <= date($today, '+6 days') AND status NOT IN ('publicada', 'cancelada')",
        { today },
      ),
      upcoming: db
        .query(
          "SELECT * FROM posts WHERE date >= $today AND status NOT IN ('publicada', 'cancelada') ORDER BY date, time LIMIT 6",
        )
        .all({ today })
        .map((row) => decode("posts", row as Row)),
    },
    metrics: {
      records: scalar("SELECT COUNT(*) AS n FROM metrics"),
      postsTracked: latest.posts ?? 0,
      views: latest.views ?? 0,
      comments: latest.comments ?? 0,
      shares: latest.shares ?? 0,
      saves: latest.saves ?? 0,
    },
    tasks: {
      open: scalar("SELECT COUNT(*) AS n FROM tasks WHERE done = 0"),
      overdue: scalar("SELECT COUNT(*) AS n FROM tasks WHERE done = 0 AND due_date < $today", { today }),
    },
  }
}

function convertIdea(db: Database, id: number) {
  const idea = get(db, "ideas", id)
  if (!idea) throw new HttpError(404, "No existe.")
  if (idea.video_id) throw new HttpError(409, "Esta idea ya tiene guion.", { video_id: String(idea.video_id) })
  const refs = idea.refs as { label: string; url: string }[]
  const video = db.transaction(() => {
    const created = insert(db, "videos", {
      title: String(idea.title),
      pillar: String(idea.pillar),
      format: String(idea.format),
      stage: "guion",
      idea_id: id,
      hook: null,
      narration: null,
      scenes: "[]",
      visual_resources: null,
      onscreen_text: null,
      cta: null,
      sources: refs.map((ref) => `- ${ref.label || ref.url}${ref.url && ref.label ? ` — ${ref.url}` : ""}`).join("\n") || null,
      duration: 0,
      due_date: null,
      published_date: null,
      qa: "{}",
      notes: idea.summary ? `Idea original: ${idea.summary}` : null,
    })
    update(db, "ideas", id, { status: "en-guion", video_id: created.id })
    return created
  })()
  return json(video, 201)
}

function markdown(db: Database, id: number) {
  const video = get(db, "videos", id)
  if (!video) throw new HttpError(404, "No existe.")
  const scenes = video.scenes as { description: string; visual: string; onscreen: string; seconds: number }[]
  const qa = video.qa as Record<string, boolean>
  const section = (title: string, body: unknown) => (body ? `## ${title}\n\n${body}\n` : "")
  const text = [
    `# ${video.title}\n`,
    `- **Pilar:** ${PILLARS[video.pillar as keyof typeof PILLARS]}`,
    `- **Formato:** ${FORMATS[video.format as keyof typeof FORMATS]}`,
    `- **Estado:** ${STAGES[video.stage as keyof typeof STAGES]}`,
    video.duration ? `- **Duración objetivo:** ${video.duration} s` : "",
    "",
    section("Gancho inicial", video.hook),
    section("Narración", video.narration),
    scenes.length
      ? `## Escenas\n\n${scenes
          .map(
            (scene, index) =>
              `### Escena ${index + 1}${scene.seconds ? ` (${scene.seconds} s)` : ""}\n\n${scene.description}\n\n- **Visual:** ${scene.visual || "—"}\n- **Texto en pantalla:** ${scene.onscreen || "—"}\n`,
          )
          .join("\n")}`
      : "",
    section("Recursos visuales", video.visual_resources),
    section("Textos en pantalla", video.onscreen_text),
    section("Llamada a la acción", video.cta),
    section("Fuentes y datos a contrastar", video.sources),
    `## Control de calidad\n\n${Object.entries(QA_ITEMS)
      .map(([key, label]) => `- [${qa[key] ? "x" : " "}] ${label}`)
      .join("\n")}\n`,
  ]
    .filter((line) => line !== undefined)
    .join("\n")
  const slug = String(video.title)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return new Response(text, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="guion-${slug || id}.md"`,
      "Cache-Control": "no-store",
    },
  })
}

// ---------------------------------------------------------------------------
// Copias de seguridad
// ---------------------------------------------------------------------------

const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/
const RESTORE_ORDER: EntityName[] = ["ideas", "videos", "posts", "metrics", "tasks", "library", "hypotheses"]

function backup(db: Database) {
  return {
    app: "laboratorio-digital",
    version: 1,
    exported_at: new Date().toISOString(),
    data: Object.fromEntries(RESTORE_ORDER.map((name) => [name, list(db, name)])),
  }
}

function restore(db: Database, input: unknown, backupDir?: string) {
  const data = (input as { app?: unknown; data?: unknown } | null)?.data
  if ((input as { app?: unknown } | null)?.app !== "laboratorio-digital" || !data || typeof data !== "object")
    throw new HttpError(400, "El archivo no es una copia de EL LABORATORIO DIGITAL.")
  const tables = data as Record<string, unknown>
  if (backupDir) snapshot(db, backupDir, "antes-de-restaurar")
  const counts = db.transaction(() => {
    ;[...RESTORE_ORDER].reverse().forEach((name) => db.exec(`DELETE FROM ${name}`))
    const pendingLinks: [number, number][] = []
    const result = Object.fromEntries(
      RESTORE_ORDER.map((name) => {
        const rows = tables[name] ?? []
        if (!Array.isArray(rows)) throw new HttpError(400, `La tabla ${name} no es una lista.`)
        rows.forEach((row: Record<string, unknown>, index) => {
          // Ideas y vídeos se referencian mutuamente: el enlace idea → vídeo se
          // restaura al final, cuando ya existen todos los vídeos.
          const { id, created_at, updated_at, ...fields } = row ?? {}
          const linked = name === "ideas" && typeof fields.video_id === "number" ? fields.video_id : undefined
          const input = name === "ideas" ? { ...fields, video_id: null } : fields
          const result = validate(db, name, input, "create")
          if (!result.ok)
            throw new HttpError(422, `Fila ${index + 1} de ${name} no válida: ${Object.values(result.errors)[0]}`)
          const created = insert(db, name, result.value, {
            ...(typeof id === "number" && Number.isInteger(id) ? { id } : {}),
            ...(typeof created_at === "string" && TIMESTAMP.test(created_at) ? { created_at } : {}),
            ...(typeof updated_at === "string" && TIMESTAMP.test(updated_at) ? { updated_at } : {}),
          })
          if (linked !== undefined) pendingLinks.push([created.id, linked])
        })
        return [name, rows.length]
      }),
    )
    // Se actualiza la columna directamente para no alterar updated_at.
    pendingLinks.forEach(([idea, video]) => {
      if (get(db, "videos", video)) db.query("UPDATE ideas SET video_id = ? WHERE id = ?").run(video, idea)
    })
    return result
  })()
  return { restored: counts }
}

export function snapshot(db: Database, dir: string, label: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const file = path.join(dir, `${label}-${stamp}.db`)
  db.query("VACUUM INTO ?").run(file)
  return file
}

// ---------------------------------------------------------------------------
// Archivos estáticos
// ---------------------------------------------------------------------------

async function serveStatic(pathname: string, publicDir: string) {
  if (pathname === "/studio") return new Response(null, { status: 301, headers: { Location: "/studio/" } })
  const decoded = safeDecode(pathname)
  const relative = decoded.endsWith("/") ? `${decoded}index.html` : decoded
  const root = path.resolve(publicDir)
  const file = path.resolve(root, `.${relative}`)
  if (!file.startsWith(root + path.sep)) throw new HttpError(404, "No encontrado.")
  const handle = Bun.file(file)
  if (!(await handle.exists())) return new Response("No encontrado", { status: 404 })
  return new Response(handle, { headers: { "Cache-Control": "no-cache" } })
}

function safeDecode(pathname: string) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    throw new HttpError(400, "Ruta no válida.")
  }
}
