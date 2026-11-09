// Cliente de la API local. Lanza ApiError con los errores por campo que
// devuelve el servidor para poder marcarlos en los formularios.

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message)
    this.status = status
    this.fields = fields ?? {}
  }
}

async function request(method, path, body) {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(data.error ?? `Error ${response.status}`, response.status, data.fields)
  return data
}

export const api = {
  meta: () => request("GET", "meta"),
  dashboard: () => request("GET", "dashboard"),
  list: (name, params = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""))
    return request("GET", `${name}${query.size ? `?${query}` : ""}`)
  },
  get: (name, id) => request("GET", `${name}/${id}`),
  create: (name, data) => request("POST", name, data),
  update: (name, id, data) => request("PATCH", `${name}/${id}`, data),
  remove: (name, id) => request("DELETE", `${name}/${id}`),
  convertIdea: (id) => request("POST", `ideas/${id}/convert`, {}),
  restore: (data) => request("POST", "restore", data),
}
