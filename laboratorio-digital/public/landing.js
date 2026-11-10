// Interacciones mínimas de la landing: menú móvil, aparición suave de
// secciones y enlaces de redes aún no activos. Funciona también sin JavaScript.
const menuButton = document.querySelector("[data-menu]")
const menu = document.getElementById("menu")

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true"
  menuButton.setAttribute("aria-expanded", String(open))
  menu.classList.toggle("open", open)
})
menu.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return
  menuButton.setAttribute("aria-expanded", "false")
  menu.classList.remove("open")
})

document.querySelectorAll('a[aria-disabled="true"]').forEach((link) =>
  link.addEventListener("click", (event) => event.preventDefault()),
)

document.querySelector("[data-year]").textContent = String(new Date().getFullYear())

if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js")
  const observer = new IntersectionObserver(
    (entries) =>
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          entry.target.classList.add("visible")
          observer.unobserve(entry.target)
        }),
    { rootMargin: "0px 0px -8% 0px" },
  )
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
}
