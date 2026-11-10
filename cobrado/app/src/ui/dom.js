// Mini capa de vistas sin dependencias: `h()` crea elementos con texto seguro
// (siempre como nodos de texto, nunca como HTML), y unos pocos componentes comunes.

export function h(tag, props, ...children) {
  const el = document.createElement(tag)
  Object.entries(props ?? {}).forEach(([key, value]) => setProp(el, key, value))
  append(el, children)
  return el
}

function setProp(el, key, value) {
  if (value === null || value === undefined || value === false) return
  if (key === "class") return void (el.className = value)
  if (key.startsWith("on") && typeof value === "function") return el.addEventListener(key.slice(2).toLowerCase(), value)
  if (key === "dataset") return void Object.assign(el.dataset, value)
  if (key === "value" || key === "checked" || key === "selected") return void (el[key] = value)
  el.setAttribute(key, value === true ? "" : String(value))
}

export function append(el, children) {
  children.flat(Infinity).forEach((child) => {
    if (child === null || child === undefined || child === false || child === "") return
    el.append(child instanceof Node ? child : document.createTextNode(String(child)))
  })
  return el
}

export function replace(el, ...children) {
  el.replaceChildren()
  return append(el, children)
}

// Iconos de trazo (24×24). Son cadenas constantes del propio código, no datos del usuario.
const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 18h.01"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  euro: '<path d="M17 6.5A7 7 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>',
  scale: '<path d="M12 3v18M5 21h14M6 7h12"/><path d="M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  upload: '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
}

export function icon(name, className = "icon") {
  const span = document.createElement("span")
  span.className = className
  span.setAttribute("aria-hidden", "true")
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ""}</svg>`
  return span
}

export function button(label, options = {}) {
  return h(
    options.href ? "a" : "button",
    {
      class: `btn ${options.variant ?? "secondary"}${options.small ? " small" : ""}`,
      type: options.href ? null : (options.type ?? "button"),
      href: options.href,
      target: options.target,
      rel: options.target ? "noopener" : null,
      onclick: options.onClick,
      disabled: options.disabled,
      title: options.title,
    },
    options.icon ? icon(options.icon) : null,
    h("span", null, label),
  )
}

export function badge(text, tone = "neutral") {
  return h("span", { class: `badge ${tone}` }, text)
}

export function toast(message, tone = "success") {
  const host = document.getElementById("toasts")
  const el = h("div", { class: `toast ${tone}`, role: "status" }, message)
  host.append(el)
  setTimeout(() => el.classList.add("leaving"), 2600)
  setTimeout(() => el.remove(), 3000)
}

/**
 * Diálogo modal con formulario. Devuelve los valores o `null` si se cancela.
 * @param {{ title: string, intro?: string, submitLabel?: string, fields: { name: string, label: string, type?: string, value?: string, options?: [string, string][], required?: boolean, hint?: string, min?: string, step?: string }[] }} config
 */
export function formDialog(config) {
  return new Promise((resolve) => {
    const form = h(
      "form",
      { class: "dialog-form", method: "dialog" },
      h("h2", null, config.title),
      config.intro ? h("p", { class: "muted" }, config.intro) : null,
      config.fields.map((field) => fieldControl(field)),
      h(
        "div",
        { class: "dialog-actions" },
        button("Cancelar", { variant: "ghost", onClick: () => close(null) }),
        button(config.submitLabel ?? "Guardar", { variant: "primary", type: "submit" }),
      ),
    )
    const dialog = h("dialog", { class: "dialog" }, form)
    const close = (value) => {
      dialog.close()
      dialog.remove()
      resolve(value)
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      if (!form.reportValidity()) return
      close(Object.fromEntries(new FormData(form).entries()))
    })
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault()
      close(null)
    })
    document.body.append(dialog)
    dialog.showModal()
  })
}

export function confirmDialog(title, message, confirmLabel = "Confirmar") {
  return formDialog({ title, intro: message, submitLabel: confirmLabel, fields: [] }).then((values) => values !== null)
}

export function fieldControl(field) {
  const id = `f-${field.name}-${Math.random().toString(36).slice(2, 7)}`
  const common = { id, name: field.name, required: field.required, placeholder: field.placeholder }
  const control = (() => {
    if (field.type === "select")
      return h(
        "select",
        common,
        (field.options ?? []).map(([value, label]) => h("option", { value, selected: value === field.value }, label)),
      )
    if (field.type === "textarea") return h("textarea", { ...common, rows: field.rows ?? 3, value: field.value ?? "" })
    if (field.type === "checkbox")
      return h("input", { ...common, type: "checkbox", value: "1", checked: field.value === "1" || field.value === true })
    return h("input", {
      ...common,
      type: field.type ?? "text",
      value: field.value ?? "",
      min: field.min,
      step: field.step,
      inputmode: field.inputmode,
      autocomplete: field.autocomplete,
      list: field.list,
    })
  })()
  if (field.type === "checkbox")
    return h("label", { class: "check", for: id }, control, h("span", null, field.label), field.hint ? h("small", null, field.hint) : null)
  return h(
    "div",
    { class: `field${field.wide ? " wide" : ""}` },
    h("label", { for: id }, field.label, field.required ? h("span", { class: "req", "aria-hidden": "true" }, " *") : null),
    control,
    field.hint ? h("small", null, field.hint) : null,
  )
}

export function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = h("a", { href: url, download: filename })
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function readFile(accept) {
  return new Promise((resolve) => {
    const input = h("input", { type: "file", accept, class: "visually-hidden" })
    input.addEventListener("change", () => {
      const file = input.files?.[0]
      input.remove()
      if (!file) return resolve(null)
      file.text().then((text) => resolve({ name: file.name, text }))
    })
    input.addEventListener("cancel", () => {
      input.remove()
      resolve(null)
    })
    document.body.append(input)
    input.click()
  })
}
