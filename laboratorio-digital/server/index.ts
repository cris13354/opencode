import { mkdirSync } from "node:fs"
import path from "node:path"
import { createApp } from "./app.ts"
import { openDatabase } from "./db.ts"
import { seedIfEmpty } from "./seed/index.ts"

const root = path.resolve(import.meta.dir, "..")
const dataDir = path.resolve(process.env.LAB_DATA_DIR ?? path.join(root, "data"))
const backupDir = path.join(dataDir, "backups")
mkdirSync(backupDir, { recursive: true })

const host = process.env.HOST ?? "127.0.0.1"
const port = Number(process.env.PORT ?? 4321)
if (!["127.0.0.1", "localhost", "::1"].includes(host))
  console.warn(`⚠  HOST=${host}: el Studio no tiene autenticación. Úsalo solo en tu equipo.`)

const db = openDatabase(path.join(dataDir, "laboratorio.db"))
const seeded = seedIfEmpty(db)
const app = createApp({ db, publicDir: path.join(root, "public"), backupDir })

const server = Bun.serve({ hostname: host, port, maxRequestBodySize: 25_000_000, fetch: app.fetch })

console.log(`
  EL LABORATORIO DIGITAL
  “No hablamos de lo que podría funcionar. Lo ponemos a prueba.”

  Landing page    http://localhost:${server.port}/
  Content Studio  http://localhost:${server.port}/studio/
  Datos           ${path.join(dataDir, "laboratorio.db")}${seeded ? "  (creada con el contenido inicial)" : ""}
`)

const close = () => {
  server.stop()
  db.close()
  process.exit(0)
}
process.on("SIGINT", close)
process.on("SIGTERM", close)
