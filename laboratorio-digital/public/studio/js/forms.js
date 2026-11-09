import { ApiError } from "./api.js"
import { html, mount, toast } from "./dom.js"
import { icon } from "./icons.js"
import { fieldDef } from "./state.js"

// Formularios generados a partir del esquema del servidor: mismo nombre,
// etiqueta, límites y opciones que la validación de la API.

export function fieldHtml(entity, key, value, refs = {}) {
  const def = fieldDef(entity, key)
  const full = def.multiline || ["links", "checklist"].includes(def.type) || key === "title"
  const hint = def.hint ? html`<small>${def.hint}</small>` : ""
  const wrap = (control) =>
    html`<label class="field ${full ? "full" : ""}" data-field="${key}">
      <span>${def.label}${def.required ? " *" : ""}</span>${control}${hint}<small class="error" hidden></small>
    </label>`
  if (def.type === "text" && def.multiline)
    return wrap(html`<textarea name="${key}" maxlength="${def.max}" rows="${def.max >= 4000 ? 6 : 3}">${value ?? ""}</textarea>`)
  if (def.type === "text")
    return wrap(
      html`<input type="text" name="${key}" maxlength="${def.max}" value="${value ?? ""}" ${def.required ? "required" : ""} />`,
    )
  if (def.type === "int")
    return wrap(
      html`<input type="number" name="${key}" min="${def.min}" max="${def.max}" step="1" inputmode="numeric" value="${value ?? 0}" />`,
    )
  if (def.type === "date") return wrap(html`<input type="date" name="${key}" value="${value ?? ""}" />`)
  if (def.type === "time") return wrap(html`<input type="time" name="${key}" value="${value ?? ""}" />`)
  if (def.type === "url")
    return wrap(html`<input type="url" name="${key}" placeholder="https://" value="${value ?? ""}" />`)
  if (def.type === "enum")
    return wrap(
      html`<select name="${key}">
        ${Object.entries(def.options).map(
          ([option, text]) => html`<option value="${option}" ${option === (value ?? def.default) ? "selected" : ""}>${text}</option>`,
        )}
      </select>`,
    )
  if (def.type === "ref")
    return wrap(
      html`<select name="${key}">
        <option value="">— Ninguno —</option>
        ${(refs[key] ?? []).map(
          (item) => html`<option value="${item.id}" ${item.id === value ? "selected" : ""}>${item.title}</option>`,
        )}
      </select>`,
    )
  if (def.type === "bool")
    return html`<label class="check" data-field="${key}">
      <input type="checkbox" name="${key}" ${value ? "checked" : ""} /> <span>${def.label}</span>
    </label>`
  if (def.type === "links")
    return html`<div class="field full links-editor" data-field="${key}" data-links="${key}">
      <span class="field-label">${def.label}</span>
      <div data-rows>${(value?.length ? value : [{ label: "", url: "" }]).map(linkRow)}</div>
      <div><button type="button" class="btn btn-sm btn-ghost" data-action="add-link">${icon("plus")} Añadir referencia</button></div>
      ${hint}<small class="error" hidden></small>
    </div>`
  if (def.type === "checklist")
    return html`<div class="field full" data-field="${key}" data-checklist="${key}">
      <span class="field-label">${def.label}</span>
      ${Object.entries(def.items).map(
        ([item, text]) =>
          html`<label class="check"><input type="checkbox" data-item="${item}" ${value?.[item] ? "checked" : ""} /> <span>${text}</span></label>`,
      )}
      <small class="error" hidden></small>
    </div>`
  return ""
}

export function linkRow(link) {
  return html`<div class="row">
    <input type="text" data-link="label" placeholder="Descripción" maxlength="200" value="${link.label}" />
    <input type="url" data-link="url" placeholder="https://" value="${link.url}" />
    <button type="button" class="icon-btn" data-action="remove-link" aria-label="Quitar referencia">${icon("close")}</button>
  </div>`
}

export function readFields(form, entity, keys) {
  return Object.fromEntries(
    keys.map((key) => {
      const def = fieldDef(entity, key)
      const input = form.elements.namedItem(key)
      if (def.type === "int") return [key, input.value === "" ? 0 : Number(input.value)]
      if (def.type === "bool") return [key, input.checked]
      if (def.type === "ref") return [key, input.value ? Number(input.value) : null]
      if (def.type === "links")
        return [
          key,
          [...form.querySelectorAll(`[data-links="${key}"] .row`)].map((row) => ({
            label: row.querySelector('[data-link="label"]').value,
            url: row.querySelector('[data-link="url"]').value,
          })),
        ]
      if (def.type === "checklist")
        return [
          key,
          Object.fromEntries(
            [...form.querySelectorAll(`[data-checklist="${key}"] [data-item]`)].map((box) => [box.dataset.item, box.checked]),
          ),
        ]
      return [key, input.value]
    }),
  )
}

export function showErrors(root, fields) {
  root.querySelectorAll("[data-field]").forEach((wrapper) => {
    const message = fields[wrapper.dataset.field]
    const slot = wrapper.querySelector(".error")
    wrapper.querySelectorAll("input, select, textarea").forEach((control) => control.classList.toggle("invalid", !!message))
    if (!slot) return
    slot.hidden = !message
    slot.textContent = message ?? ""
  })
  root.querySelector(".invalid")?.focus()
}

export function handleLinkActions(event) {
  const action = event.target.closest("[data-action]")?.dataset.action
  if (action === "add-link") {
    const rows = event.target.closest("[data-links]").querySelector("[data-rows]")
    rows.insertAdjacentHTML("beforeend", String(linkRow({ label: "", url: "" })))
    rows.lastElementChild.querySelector("input").focus()
    return true
  }
  if (action === "remove-link") {
    event.target.closest(".row").remove()
    return true
  }
  return false
}

// Diálogo de edición genérico. `onSubmit` recibe los datos ya leídos y debe
// devolver una promesa; si falla con ApiError se marcan los campos.
export function openForm({ title, entity, keys, item = {}, refs = {}, onSubmit, onDelete, intro }) {
  const dialog = document.getElementById("modal")
  mount(
    dialog,
    html`<form novalidate>
      <div class="dialog-head">
        <h2 id="modal-title">${title}</h2>
        <button type="button" class="icon-btn" data-action="close" aria-label="Cerrar">${icon("close")}</button>
      </div>
      <div class="dialog-body">
        ${intro ? html`<p class="muted small">${intro}</p><div class="mt"></div>` : ""}
        <div class="form-grid">${keys.map((key) => fieldHtml(entity, key, item[key], refs))}</div>
      </div>
      <div class="dialog-foot">
        ${onDelete ? html`<button type="button" class="btn btn-ghost btn-danger" data-action="delete">${icon("trash")} Eliminar</button>` : ""}
        <div class="actions">
          <button type="button" class="btn btn-ghost" data-action="close">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </div>
    </form>`,
  )
  const form = dialog.querySelector("form")
  form.onclick = async (event) => {
    if (handleLinkActions(event)) return
    const action = event.target.closest("[data-action]")?.dataset.action
    if (action === "close") dialog.close()
    if (action === "delete" && onDelete && (await onDelete()) !== false) dialog.close()
  }
  form.onsubmit = async (event) => {
    event.preventDefault()
    const button = form.querySelector('[type="submit"]')
    button.disabled = true
    try {
      await onSubmit(readFields(form, entity, keys))
      dialog.close()
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
      showErrors(form, error.fields)
      toast(error.message, "error")
    } finally {
      button.disabled = false
    }
  }
  dialog.showModal()
  form.querySelector("input, textarea, select")?.focus()
  return dialog
}
