import { expect, test } from "@playwright/test";

test("la landing explica el producto y enlaza a los tests de ejemplo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tests que tu audiencia");
  await page.getByRole("link", { name: /¿Cuánto sabes de tecnología\?/ }).click();
  await expect(page).toHaveURL(/\/t\/tecnologia$/);
  await expect(page.getByRole("button", { name: "Empezar el test" })).toBeVisible();
});

test("test de personalidad: jugar, ver resultado y compartir", async ({ page, request }) => {
  await page.goto("/t/emprendedor");
  await page.getByRole("button", { name: "Empezar el test" }).click();
  // Siempre la primera respuesta → resultado "Visionario".
  for (let i = 0; i < 7; i++) {
    await expect(page.getByText(`${i + 1}/7`)).toBeVisible();
    await page.getByRole("list").getByRole("button").first().click();
  }
  await expect(page).toHaveURL(/\/t\/emprendedor\/r\/0$/);
  await expect(page.getByRole("heading", { name: /Tu resultado/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Visionario" })).toBeVisible();

  // El nombre se añade a los enlaces de descarga de la tarjeta.
  await page.getByLabel(/Tu nombre/).fill("Lucía");
  const download = page.getByRole("link", { name: "Descargar imagen" });
  await expect(download).toHaveAttribute("href", /n=Luc%C3%ADa/);
  const image = await request.get((await download.getAttribute("href"))!);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");

  // La página del resultado incluye la imagen para redes sociales.
  const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(ogImage).toContain("/api/card?ref=emprendedor&r=0");
});

test("test de conocimientos: el pleno da el mejor resultado", async ({ page }) => {
  const correct = [0, 2, 1, 3, 0, 1, 2, 3, 3, 0];
  await page.goto("/t/tecnologia");
  await page.getByRole("button", { name: "Empezar el test" }).click();
  for (const index of correct) {
    await page.getByRole("list").getByRole("button").nth(index).click();
    await expect(page.getByText("¡Correcto! 🎉")).toBeVisible();
  }
  await expect(page).toHaveURL(/\/t\/tecnologia\/r\/3\?s=10$/);
  await expect(page.getByText("10/10 aciertos")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Leyenda digital" })).toBeVisible();
});

test("un enlace compartido invita a hacer el test", async ({ page }) => {
  await page.goto("/t/tecnologia/r/2?s=8&n=Ana");
  await expect(page.getByRole("heading", { name: /resultado de Ana/ })).toBeVisible();
  await expect(page.getByText("Ana es…")).toBeVisible();
  await page.getByRole("link", { name: "Hacer el test" }).click();
  await expect(page).toHaveURL(/\/t\/tecnologia$/);
});

test("editor: crear desde plantilla, publicar y jugar el test", async ({ page }) => {
  await page.goto("/crear");
  await page.getByRole("button", { name: /Test de conocimientos/ }).click();
  await page.getByLabel("Título").fill("¿Cuánto sabes de mi canal?");
  await page.getByRole("button", { name: "Publicar y obtener enlace" }).click();
  await expect(page.getByText("¡Tu test está listo!")).toBeVisible();

  const link = await page.getByLabel("Enlace del test").inputValue();
  expect(link).toMatch(/\/t\/c1\.[A-Za-z0-9_-]+$/);
  // Aparece en "Tus tests publicados" y sobrevive a recargar la página.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Tus tests publicados" })).toBeVisible();
  await expect(page.getByText("¿Cuánto sabes de mi canal?").first()).toBeVisible();

  await page.goto(link);
  await expect(page.getByRole("heading", { name: "¿Cuánto sabes de mi canal?" })).toBeVisible();
  await expect(page.getByText(/creado por un usuario/)).toBeVisible();
  await page.getByRole("button", { name: "Empezar el test" }).click();
  for (const index of [2, 0, 1]) {
    await page.getByRole("list").getByRole("button").nth(index).click();
  }
  await expect(page.getByRole("heading", { name: "Experto" })).toBeVisible();
  await expect(page.getByText("3/3 aciertos")).toBeVisible();
});

test("editor: explica qué falta antes de publicar", async ({ page }) => {
  await page.goto("/crear");
  await page.getByRole("button", { name: /En blanco/ }).click();
  await page.getByRole("button", { name: "Publicar y obtener enlace" }).click();
  const alert = page.getByRole("alert").filter({ hasText: "Revisa" });
  await expect(alert).toContainText("Título: no puede estar vacío");
  await expect(alert).toContainText("Resultado 1 › Nombre");
  await expect(page.getByText("¡Tu test está listo!")).toHaveCount(0);
});

test("editor: vista previa sin publicar", async ({ page }) => {
  await page.goto("/crear");
  await page.getByRole("button", { name: /Test de personalidad/ }).click();
  await page.getByRole("button", { name: "Probar el test" }).click();
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: /Relax total|Bañador|buen tiempo|Tumbona/ }).first().click();
  }
  await expect(page.getByRole("heading", { name: "Relax total" })).toBeVisible();
});

test("precios: el interés en Pro se registra sin cobrar nada", async ({ page }) => {
  await page.goto("/precios");
  await page.getByRole("button", { name: "Quiero Pro" }).click();
  await expect(page.getByText(/Gracias/).first()).toBeVisible();
});

test("enlaces rotos muestran una página de error amable", async ({ page }) => {
  await page.goto("/t/c1.enlace-roto");
  await expect(page.getByRole("heading", { name: "Este experimento no existe" })).toBeVisible();
  await page.goto("/t/emprendedor/r/99");
  await expect(page.getByRole("heading", { name: "Este experimento no existe" })).toBeVisible();
});
