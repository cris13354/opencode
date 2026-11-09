import { describe, expect, test } from "bun:test"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { createApp } from "../server/app.ts"
import { openDatabase } from "../server/db.ts"
import { nextMonday, seedIfEmpty } from "../server/seed/index.ts"

const ORIGIN = "http://localhost:4321"
const publicDir = path.join(import.meta.dir, "..", "public")

function setup({ seed = true } = {}) {
  const db = openDatabase(":memory:")
  if (seed) seedIfEmpty(db, new Date(2026, 10, 16))
  const app = createApp({ db, publicDir })
  const call = async (method: string, url: string, body?: unknown, headers: Record<string, string> = {}) => {
    const response = await app.fetch(
      new Request(`${ORIGIN}${url}`, {
        method,
        headers: body === undefined ? headers : { "Content-Type": "application/json", ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    )
    const text = await response.text()
    const json = response.headers.get("content-type")?.includes("json") ? JSON.parse(text) : text
    return { status: response.status, headers: response.headers, body: json }
  }
  return { db, app, call }
}

describe("contenido inicial", () => {
  test("30 ideas repartidas en los cuatro pilares", async () => {
    const { call } = setup()
    const ideas = (await call("GET", "/api/ideas")).body as { pillar: string }[]
    expect(ideas).toHaveLength(30)
    const pillars = new Set(ideas.map((idea) => idea.pillar))
    expect([...pillars].sort()).toEqual(["experimentos", "ia", "marketing", "negocios"])
  })

  test("10 guiones completos y 3 vídeos en investigación", async () => {
    const { call } = setup()
    const videos = (await call("GET", "/api/videos")).body as Record<string, unknown>[]
    const scripts = videos.filter((video) => video.stage === "guion")
    expect(scripts).toHaveLength(10)
    scripts.forEach((video) => {
      expect(String(video.hook).length).toBeGreaterThan(20)
      expect(String(video.narration).length).toBeGreaterThan(400)
      expect((video.scenes as unknown[]).length).toBeGreaterThanOrEqual(5)
      expect(video.cta).toBeTruthy()
      expect(video.sources).toBeTruthy()
    })
    expect(videos.filter((video) => video.stage === "investigacion")).toHaveLength(3)
  })

  test("calendario de 30 días con tres publicaciones por semana (L-X-V)", async () => {
    const { call } = setup()
    const posts = (await call("GET", "/api/posts")).body as { date: string }[]
    expect(posts).toHaveLength(13)
    expect(posts[0].date).toBe("2026-11-16")
    expect(posts.at(-1)!.date).toBe("2026-12-14")
    const weekdays = new Set(posts.map((post) => new Date(`${post.date}T12:00:00`).getDay()))
    expect([...weekdays].sort()).toEqual([1, 3, 5])
  })

  test("no inventa métricas", async () => {
    const { call } = setup()
    expect((await call("GET", "/api/metrics")).body).toEqual([])
  })

  test("solo se carga una vez", () => {
    const { db } = setup()
    expect(seedIfEmpty(db)).toBe(false)
  })

  test("el calendario empieza el lunes siguiente", () => {
    expect(nextMonday(new Date(2026, 10, 9)).getDate()).toBe(16) // lunes → lunes siguiente
    expect(nextMonday(new Date(2026, 10, 15)).getDate()).toBe(16) // domingo → mañana
    expect(nextMonday(new Date(2026, 10, 11)).getDate()).toBe(16) // miércoles
  })
})

describe("validación", () => {
  test("campos obligatorios y opciones", async () => {
    const { call } = setup({ seed: false })
    const response = await call("POST", "/api/ideas", { title: "  ", pillar: "otro", priority: "urgente" })
    expect(response.status).toBe(422)
    expect(Object.keys(response.body.fields).sort()).toEqual(["pillar", "priority", "title"])
  })

  test("rechaza enlaces que no sean http/https", async () => {
    const { call } = setup({ seed: false })
    const response = await call("POST", "/api/ideas", {
      title: "Idea",
      refs: [{ label: "x", url: "javascript:alert(1)" }],
    })
    expect(response.status).toBe(422)
    expect(response.body.fields.refs).toBeTruthy()
  })

  test("rechaza campos desconocidos, números negativos y fechas imposibles", async () => {
    const { call } = setup()
    expect((await call("POST", "/api/ideas", { title: "Idea", admin: true })).body.fields.admin).toBeTruthy()
    const metric = await call("POST", "/api/metrics", { post_id: 1, date: "2026-02-30", views: -1 })
    expect(Object.keys(metric.body.fields).sort()).toEqual(["date", "views"])
  })

  test("comprueba que las referencias existen", async () => {
    const { call } = setup({ seed: false })
    const response = await call("POST", "/api/metrics", { post_id: 999, date: "2026-11-20" })
    expect(response.body.fields.post_id).toBe("El elemento no existe.")
  })

  test("las actualizaciones parciales solo tocan los campos enviados", async () => {
    const { call } = setup()
    const before = (await call("GET", "/api/videos/1")).body
    const after = (await call("PATCH", "/api/videos/1", { stage: "produccion" })).body
    expect(after.stage).toBe("produccion")
    expect(after.narration).toBe(before.narration)
    expect(after.scenes).toEqual(before.scenes)
  })

  test("la checklist solo admite los puntos de control definidos", async () => {
    const { call } = setup()
    expect((await call("PATCH", "/api/videos/1", { qa: { gancho: true } })).status).toBe(200)
    expect((await call("PATCH", "/api/videos/1", { qa: { inventado: true } })).status).toBe(422)
  })
})

describe("flujo de producción", () => {
  test("convertir una idea en guion la vincula y no se puede repetir", async () => {
    const { call } = setup()
    const idea = (await call("POST", "/api/ideas", { title: "Nueva", pillar: "marketing", refs: [{ label: "Fuente", url: "https://example.com" }] })).body
    const video = await call("POST", `/api/ideas/${idea.id}/convert`, {})
    expect(video.status).toBe(201)
    expect(video.body).toMatchObject({ title: "Nueva", stage: "guion", pillar: "marketing", idea_id: idea.id })
    expect(video.body.sources).toContain("https://example.com")
    expect((await call("GET", `/api/ideas/${idea.id}`)).body).toMatchObject({ status: "en-guion", video_id: video.body.id })
    expect((await call("POST", `/api/ideas/${idea.id}/convert`, {})).status).toBe(409)
  })

  test("borrar una publicación borra sus métricas", async () => {
    const { call } = setup()
    await call("POST", "/api/metrics", { post_id: 1, date: "2026-11-17", views: 10, saves: 2 })
    expect((await call("GET", "/api/metrics")).body).toHaveLength(1)
    await call("DELETE", "/api/posts/1")
    expect((await call("GET", "/api/metrics")).body).toHaveLength(0)
  })

  test("el panel resume el último registro de cada publicación", async () => {
    const { call } = setup()
    await call("POST", "/api/metrics", { post_id: 1, date: "2026-11-17", views: 10 })
    await call("POST", "/api/metrics", { post_id: 1, date: "2026-11-20", views: 40 })
    await call("POST", "/api/metrics", { post_id: 2, date: "2026-11-19", views: 5 })
    const dashboard = (await call("GET", "/api/dashboard")).body
    expect(dashboard.metrics).toMatchObject({ records: 3, postsTracked: 2, views: 45 })
    expect(dashboard.ideas.total).toBe(30)
    expect(dashboard.videos.stages.guion).toBe(10)
  })

  test("filtros por campo, búsqueda y rango de fechas", async () => {
    const { call } = setup()
    expect(((await call("GET", "/api/ideas?pillar=experimentos")).body as unknown[]).length).toBe(7)
    expect(((await call("GET", "/api/ideas?q=gancho")).body as unknown[]).length).toBeGreaterThan(0)
    expect(((await call("GET", "/api/posts?from=2026-11-16&to=2026-11-22")).body as unknown[]).length).toBe(3)
    expect(((await call("GET", "/api/tasks?done=false")).body as unknown[]).length).toBe(14)
  })

  test("exporta el guion a Markdown", async () => {
    const { call } = setup()
    const response = await call("GET", "/api/videos/1/markdown")
    expect(response.headers.get("content-type")).toContain("text/markdown")
    expect(response.body).toContain("# El prompt de 5 piezas")
    expect(response.body).toContain("## Control de calidad")
    expect(response.body).toContain("- [ ] ¿El gancho es interesante?")
  })
})

describe("copias de seguridad", () => {
  test("exportar y restaurar conserva los datos y las relaciones", async () => {
    const source = setup()
    await source.call("POST", "/api/metrics", { post_id: 3, date: "2026-11-21", views: 7 })
    const backup = (await source.call("GET", "/api/backup")).body
    const target = setup({ seed: false })
    const restored = await target.call("POST", "/api/restore", backup)
    expect(restored.status).toBe(200)
    expect(restored.body.restored).toMatchObject({ ideas: 30, videos: 13, posts: 13, metrics: 1 })
    const idea = ((await target.call("GET", "/api/ideas")).body as { video_id: number | null }[]).find((item) => item.video_id)
    expect(idea).toBeTruthy()
    expect((await target.call("GET", "/api/backup")).body.data).toEqual(backup.data)
  })

  test("una copia no válida no borra nada", async () => {
    const { call } = setup()
    const broken = { app: "laboratorio-digital", data: { ideas: [{ title: "" }] } }
    expect((await call("POST", "/api/restore", broken)).status).toBe(422)
    expect((await call("GET", "/api/ideas")).body).toHaveLength(30)
    expect((await call("POST", "/api/restore", { data: {} })).status).toBe(400)
  })
})

describe("seguridad", () => {
  test("rechaza nombres de host no locales (DNS rebinding)", async () => {
    const { app } = setup({ seed: false })
    const response = await app.fetch(new Request("http://evil.example:4321/api/ideas"))
    expect(response.status).toBe(403)
  })

  test("rechaza escrituras desde otro origen", async () => {
    const { call } = setup({ seed: false })
    expect((await call("POST", "/api/ideas", { title: "x" }, { Origin: "https://evil.example" })).status).toBe(403)
    expect((await call("DELETE", "/api/ideas/1", undefined, { Origin: "https://evil.example" })).status).toBe(403)
    expect((await call("POST", "/api/ideas", { title: "x" }, { Origin: ORIGIN })).status).toBe(201)
  })

  test("exige JSON en las escrituras", async () => {
    const { app } = setup({ seed: false })
    const response = await app.fetch(
      new Request(`${ORIGIN}/api/ideas`, { method: "POST", body: "title=x", headers: { "Content-Type": "application/x-www-form-urlencoded" } }),
    )
    expect(response.status).toBe(415)
  })

  test("envía cabeceras de seguridad y CSP estricta", async () => {
    const { call } = setup({ seed: false })
    const response = await call("GET", "/")
    expect(response.status).toBe(200)
    expect(response.headers.get("content-security-policy")).toContain("script-src 'self'")
    expect(response.headers.get("x-frame-options")).toBe("DENY")
    expect(response.headers.get("x-content-type-options")).toBe("nosniff")
  })

  test("no sirve archivos fuera de public/", async () => {
    const { call } = setup({ seed: false })
    expect((await call("GET", "/%2e%2e/server/app.ts")).status).toBe(404)
    expect((await call("GET", "/../package.json")).status).toBe(404)
  })

  test("identificadores y rutas no válidos", async () => {
    const { call } = setup({ seed: false })
    expect((await call("GET", "/api/ideas/abc")).status).toBe(400)
    expect((await call("GET", "/api/sqlite_master")).status).toBe(404)
    expect((await call("GET", "/api/ideas/999")).status).toBe(404)
  })
})

describe("migraciones", () => {
  test("añade columnas nuevas al reabrir sin perder datos", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "lab-")), "test.db")
    const first = openDatabase(file)
    first.exec("INSERT INTO ideas (title, created_at, updated_at) VALUES ('antigua', 'x', 'x')")
    first.exec("ALTER TABLE ideas DROP COLUMN notes")
    first.close()
    const reopened = openDatabase(file)
    const columns = reopened.query("PRAGMA table_info(ideas)").all().map((col) => (col as { name: string }).name)
    expect(columns).toContain("notes")
    expect((reopened.query("SELECT title FROM ideas").get() as { title: string }).title).toBe("antigua")
    reopened.close()
  })
})
