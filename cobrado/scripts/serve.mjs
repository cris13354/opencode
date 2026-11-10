// Servidor estático mínimo, sin dependencias, solo para desarrollo local.
// Los módulos ES no se cargan desde file://, por eso hace falta servir los archivos.
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(fileURLToPath(new URL("..", import.meta.url)))
const port = Number(process.env.PORT ?? 4321)
const host = process.env.HOST ?? "127.0.0.1"
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".md": "text/plain; charset=utf-8",
}

createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname)
  const target = normalize(join(root, path))
  // Impide salir de la carpeta del proyecto con rutas como /../../
  if (!target.startsWith(root)) return send(response, 403, "Prohibido")
  const info = await stat(target).catch(() => null)
  // Sin barra final, las rutas relativas de index.html apuntarían a la carpeta padre.
  if (info?.isDirectory() && !path.endsWith("/")) {
    response.writeHead(301, { location: `${path}/` })
    return response.end()
  }
  const file = await resolveFile(target)
  if (!file) return send(response, 404, "No encontrado")
  response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" })
  response.end(await readFile(file))
}).listen(port, host, () => {
  console.log(`Cobrado en http://${host}:${port}/  (landing)  ·  http://${host}:${port}/app/  (aplicación)`)
})

async function resolveFile(target) {
  const info = await stat(target).catch(() => null)
  if (info?.isFile()) return target
  if (!info?.isDirectory()) return null
  const index = join(target, "index.html")
  return (await stat(index).catch(() => null))?.isFile() ? index : null
}

function send(response, status, message) {
  response.writeHead(status, { "content-type": "text/plain; charset=utf-8" })
  response.end(message)
}
