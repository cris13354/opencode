// Copia de seguridad consistente de la base de datos (bun run backup).
import { mkdirSync } from "node:fs"
import path from "node:path"
import { snapshot } from "./app.ts"
import { openDatabase } from "./db.ts"

const dataDir = path.resolve(process.env.LAB_DATA_DIR ?? path.join(import.meta.dir, "..", "data"))
const backupDir = path.join(dataDir, "backups")
mkdirSync(backupDir, { recursive: true })
const db = openDatabase(path.join(dataDir, "laboratorio.db"))
console.log(`Copia creada: ${snapshot(db, backupDir, "copia")}`)
db.close()
