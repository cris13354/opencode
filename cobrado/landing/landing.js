import { todayIso } from "../app/src/domain/dates.js"
import { calculator } from "../app/src/ui/components.js"

// Dirección a la que enviar la lista de espera (por ejemplo, un formulario de
// Tally, Formspree o Google Forms). Vacía a propósito: conectarla es una decisión
// del propietario y, hasta entonces, el formulario no recoge ningún dato.
const WAITLIST_ENDPOINT = ""

document.getElementById("calc-host").append(calculator({ asOf: todayIso() }))

const form = document.getElementById("waitlist")
const status = form.querySelector(".form-status")

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  if (!form.reportValidity()) return
  if (!WAITLIST_ENDPOINT) {
    status.textContent = "Prototipo: el formulario todavía no está conectado y no se ha guardado nada."
    return
  }
  status.textContent = "Enviando…"
  const response = await fetch(WAITLIST_ENDPOINT, {
    method: "POST",
    headers: { accept: "application/json" },
    body: new FormData(form),
  }).catch(() => null)
  if (!response?.ok) {
    status.textContent = "No se pudo enviar. Inténtalo de nuevo en unos minutos."
    return
  }
  form.reset()
  status.textContent = "¡Gracias! Te escribiremos para probarlo."
})
