# AGENTS.md — TurnoClase Backend

## Descripción del repositorio

Backend de TurnoClase implementado como Firebase Cloud Functions (v2). Expone una única función HTTPS callable que genera códigos únicos de aula para que los profesores puedan compartirlos con sus alumnos.

## Función principal

**`nuevoCodigo`** (`functions/index.js`)

- Región: `europe-west1`
- Requiere App Check válido (rechaza llamadas no verificadas).
- Incrementa un contador global en Firestore (`total/aulas`) dentro de una transacción y lo codifica con Hashids para producir un código alfanumérico de 5 caracteres (máx. 234.255 aulas).
- Retorna `{ codigo: "XXXXX" }` o `{ codigo: "?" }` en caso de error.

## Stack tecnológico

- **Runtime:** Node.js 22
- **Framework:** Firebase Functions v2 (`firebase-functions`) + Firebase Admin SDK
- **Base de datos:** Firestore
- **Generación de códigos:** Hashids
- **Despliegue:** Firebase CLI, dockerizado para el entorno local
- **Automatización local:** `make` + Docker Compose

## Comandos habituales

Todos los comandos se ejecutan desde la raíz del repositorio mediante `make`:

```bash
make build      # Construye la imagen Docker
make workspace  # Abre una shell dentro del contenedor
make update     # Actualiza dependencias npm y genera commit automático
make deploy     # Compila y despliega las funciones en Firebase (proyecto turnoclase-eu)
make clean      # Elimina contenedores y volúmenes Docker
```

### Sin Docker (desde `functions/`)

```bash
npm install          # Instalar dependencias
npm run serve        # Servidor local (emulador Firebase)
npm run deploy       # Despliegue directo
npm run logs         # Ver logs de Cloud Functions
```

## Estructura del repositorio

```
backend/
├── Makefile                # Automatización con Docker
├── Dockerfile              # Imagen con Node + Firebase CLI
├── docker-compose.yml      # Servicio "node" para dev/deploy
├── firebase.json           # Configuración de Firebase (functions)
├── .firebaserc             # Proyecto Firebase activo (turnoclase-eu)
├── env-example             # Variables de entorno requeridas (copiar a .env)
└── functions/
    ├── index.js            # Código de las Cloud Functions
    └── package.json        # Dependencias Node.js
```

## Convenciones

- Todo el código de las funciones reside en `functions/index.js`.
- Las variables de entorno sensibles van en `.env` (excluido de git); usar `env-example` como plantilla.
- Toda nueva función debe requerir App Check (`enforceAppCheck: true`) y desplegarse en `europe-west1`.
- El proyecto Firebase de producción es `turnoclase-eu`.

## Commits

Al completar cualquier característica o cambio, crear un commit con:

- **Mensaje en español**, en imperativo y conciso (p.ej. `Añadir función para borrar aulas expiradas`).
- Un commit por característica o cambio cohesionado; no agrupar cambios no relacionados.
- No incluir `node_modules/`, `.env` ni ficheros generados.

## Consideraciones para agentes

- No modificar `functions/node_modules/` directamente; usar `npm update` o `make update`.
- El fichero `.env` contiene credenciales reales; no leerlo ni incluir su contenido en el código.
- Antes de desplegar, verificar que el emulador local funciona correctamente con `make workspace` + `npm run serve`.
- El contador de Firestore `total/aulas` es el estado global de producción; no resetearlo en pruebas.
- Al añadir nuevas funciones, seguir el mismo patrón que `nuevoCodigo`: `onCall` con `enforceAppCheck` y región europea.
