import { raw } from "./dom.js"

// Iconos lineales propios (rejilla 24 × 24, trazo 1.8).
const PATHS = {
  panel: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  ideas: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.8.6 1.1 1.3 1.1 2.2h5c0-.9.3-1.6 1.1-2.2A6 6 0 0 0 12 3z",
  guiones: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5",
  produccion: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z",
  calendario: "M4 6h16v14H4zM4 10h16M8 3v5M16 3v5",
  analiticas: "M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6",
  biblioteca: "M5 4h4v16H5zM10 4h4v16h-4zM15.5 4.6l3.9-1 3.6 15.4-3.9 1z",
  negocio: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
  estrategia: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  ajustes: "M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  up: "M5 15l7-7 7 7",
  down: "M5 9l7 7 7-7",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  upload: "M12 20V9M7 14l5-5 5 5M5 4h14",
  close: "M6 6l12 12M18 6L6 18",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  flask: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3",
}

export function icon(name) {
  return raw(
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`,
  )
}
