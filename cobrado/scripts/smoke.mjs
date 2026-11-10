// Prueba de humo de la interfaz con Playwright (opcional: requiere tener
// `playwright` instalado, p. ej. `npm i -D playwright && npx playwright install chromium`).
// Arranca el servidor, recorre el flujo principal y falla si hay errores en consola.
import { spawn } from "node:child_process"
import assert from "node:assert/strict"

const { chromium } = await import("playwright").catch(() => {
  console.error("Playwright no está instalado. Instálalo para ejecutar esta prueba.")
  process.exit(1)
})

const port = 4399
const server = spawn(process.execPath, ["scripts/serve.mjs"], { env: { ...process.env, PORT: String(port) }, stdio: "ignore" })
await new Promise((resolve) => setTimeout(resolve, 500))
const base = `http://127.0.0.1:${port}`
const browser = await chromium.launch()
const errors = []

try {
  const page = await browser.newPage()
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))

  await page.goto(`${base}/app/?hoy=2026-11-09`)
  await page.getByText("Ver con datos de ejemplo").click()
  assert.equal(await page.locator(".todo-link").count(), 4, "cuatro acciones para hoy con los datos de ejemplo")

  await page.locator(".todo-link").first().click()
  await page.getByRole("button", { name: "Pago recibido" }).click()
  await page.locator("dialog input[name=amount]").fill("100")
  await page.locator("dialog button[type=submit]").click()
  await page.getByText("Pago recibido: 100,00").waitFor()

  await page.goto(`${base}/app/?hoy=2026-11-09#/nueva`)
  await page.locator("input[name='client.name']").fill("Cliente Prueba SL")
  await page.locator("input[name=number]").fill("T-1")
  await page.locator("input[name=amount]").fill("500")
  await page.getByRole("button", { name: "Guardar factura" }).click()
  await page.getByRole("heading", { name: "Cliente Prueba SL" }).waitFor()

  for (const route of ["guia", "ajustes", "calculadora"]) {
    await page.goto(`${base}/app/?hoy=2026-11-09#/${route}`)
    await page.locator("h1").waitFor()
  }

  await page.goto(`${base}/`)
  await page.locator("#calc-host .calc-result").waitFor()

  assert.deepEqual(errors, [])
  console.log("Prueba de humo superada")
} finally {
  await browser.close()
  server.kill()
}
