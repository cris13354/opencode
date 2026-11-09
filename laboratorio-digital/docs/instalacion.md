# Guía de instalación

## Requisitos

| Requisito | Notas |
|---|---|
| [Bun](https://bun.sh) ≥ 1.1 | Única dependencia. Incluye el servidor HTTP y SQLite. |
| Navegador moderno | Chrome, Edge, Firefox o Safari recientes. |
| Sistema operativo | macOS, Linux o Windows (Bun tiene instalador nativo para los tres). |

El proyecto **no tiene dependencias de npm**: no hay que ejecutar `bun install`, no hay `node_modules` ni paso de compilación.

### Instalar Bun

Sigue las instrucciones oficiales en https://bun.sh (un solo comando en macOS, Linux y Windows). Comprueba la versión con:

```bash
bun --version
```

## Arranque

```bash
cd laboratorio-digital
bun run start
```

Verás:

```
  EL LABORATORIO DIGITAL
  “No hablamos de lo que podría funcionar. Lo ponemos a prueba.”

  Landing page    http://localhost:4321/
  Content Studio  http://localhost:4321/studio/
  Datos           …/data/laboratorio.db  (creada con el contenido inicial)
```

En el primer arranque se crea `data/laboratorio.db` con las 30 ideas, los 10 guiones, el calendario de 30 días (empieza el lunes siguiente), las tareas, la biblioteca y las hipótesis de negocio. En los siguientes arranques se usan tus datos tal como los dejaste.

Para detenerlo: `Ctrl + C`.

## Configuración

Variables de entorno opcionales:

| Variable | Por defecto | Uso |
|---|---|---|
| `PORT` | `4321` | Puerto del servidor. |
| `HOST` | `127.0.0.1` | Interfaz de red. **Déjalo en local**: el Studio no tiene autenticación. |
| `LAB_DATA_DIR` | `./data` | Carpeta de la base de datos y las copias. |

Ejemplo:

```bash
PORT=5000 LAB_DATA_DIR=~/laboratorio-datos bun run start
```

## Copias de seguridad

Tres formas, de más a menos completa:

1. `bun run backup` — copia consistente del archivo SQLite en `data/backups/copia-<fecha>.db`. Se puede ejecutar con el servidor en marcha.
2. Studio → **Datos y copias → Exportar** — archivo JSON con todos los datos, legible y portable.
3. Copiar la carpeta `data/` con el servidor detenido.

Para restaurar un JSON: Studio → **Datos y copias → Restaurar**. Antes de sustituir los datos, el servidor guarda automáticamente `data/backups/antes-de-restaurar-<fecha>.db`.

Para restaurar un `.db`: detén el servidor, sustituye `data/laboratorio.db` por la copia y elimina `laboratorio.db-wal` y `laboratorio.db-shm` si existen.

## Empezar de cero

Detén el servidor y borra (o mueve) `data/laboratorio.db*`. En el siguiente arranque se vuelve a crear con el contenido inicial y un calendario que empieza el lunes siguiente.

## Pruebas

```bash
bun run test
```

Ejecuta 26 pruebas de la API: contenido inicial, validación, flujo de producción, copias, seguridad y migraciones. Usan una base de datos en memoria; no tocan tus datos.

## Abrir la landing sin servidor

`public/index.html` usa rutas relativas y no necesita el servidor: puedes abrirlo directamente con el navegador.

## Solución de problemas

| Problema | Solución |
|---|---|
| `EADDRINUSE` / puerto ocupado | Otro proceso usa el 4321. Arranca con `PORT=4322 bun run start`. |
| El Studio dice «No hay conexión con el servidor local» | El servidor no está en marcha o se abrió `studio/index.html` como archivo. Usa `bun run start` y entra por `http://localhost:4321/studio/`. |
| «Host no permitido» | Entra por `localhost` o `127.0.0.1`. Otros nombres se rechazan a propósito (protección contra DNS rebinding). |
| Quiero ver los datos con otra herramienta | `data/laboratorio.db` es SQLite estándar: ábrelo con cualquier visor de SQLite (mejor con el servidor detenido). |
