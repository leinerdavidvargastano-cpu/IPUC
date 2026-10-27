# Sistema de Asistencia IPUC

Aplicación web privada para registrar la asistencia a los cultos de la
Iglesia Pentecostal Unida de Colombia y consultar estadísticas.

## Estructura

- `frontend/`: interfaz hecha con Next.js y React (puerto 3000).
- `backend/`: API hecha con Node.js y Express (puerto 4000).
- `database/`: esquema SQL de PostgreSQL (en construcción).

## Requisitos

- Node.js 18 o superior
- Git
- PostgreSQL (se usa desde la Fase 4)

## Cómo ejecutarlo en tu computador

Se necesitan dos terminales abiertas al mismo tiempo.

**Terminal 1: backend**

    cd backend
    npm install
    npm run dev

Antes, crea el archivo `backend/.env` copiando `backend/.env.example`.

**Terminal 2: frontend**

    cd frontend
    npm install
    npm run dev

Abre http://localhost:3000. En el menú lateral debe aparecer
"Servidor conectado" con un punto verde.

## Estado

- Fase 1: planificación. Hecha.
- Fase 2: diseño visual con datos de demostración. Hecha.
- Fase 3: configuración del proyecto. Hecha.
- Fase 4: base de datos. En curso.