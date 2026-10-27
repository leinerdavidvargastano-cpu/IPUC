# ⛪ Sistema de Control de Asistencia — IPUC

### Gestión y seguimiento de la asistencia a los cultos

Sistema web diseñado para facilitar el registro, control y seguimiento de la asistencia de los hermanos a los diferentes cultos de la **Iglesia Pentecostal Unida de Colombia (IPUC)**.

El objetivo es digitalizar el proceso de registro que realiza la secretaría de la iglesia, permitiendo organizar la información, consultar estadísticas y conocer la asistencia de la congregación de manera clara y eficiente.

---

## 📌 Descripción del proyecto

El Sistema de Control de Asistencia de la IPUC surge como una solución tecnológica a la necesidad de conocer cuántos hermanos asisten a los cultos realizados durante la semana.

Mediante una interfaz intuitiva y organizada, los responsables de secretaría podrán registrar la asistencia, consultar los datos de cada culto y generar reportes que faciliten el seguimiento de la participación de la congregación.

## 🎯 Objetivos

- Digitalizar el registro de asistencia a los cultos.
- Centralizar la información de asistencia en un solo sistema.
- Facilitar el trabajo de la secretaría de la iglesia.
- Consultar estadísticas de asistencia por día y tipo de culto.
- Generar reportes para apoyar la organización y la toma de decisiones.
- Reducir errores y evitar la dependencia de registros manuales.

## 🗓️ Cultos contemplados

El sistema está diseñado para organizar los registros según la programación semanal de la iglesia.

| Día | Actividad |
|---|---|
| Domingo | Culto de la mañana |
| Domingo | Culto de la tarde |
| Martes | Culto general |
| Miércoles | Culto de barrios |
| Jueves | Culto de damas y caballeros |
| Viernes | Culto de barrios |
| Sábado | Culto de jóvenes |

*La programación puede adaptarse a los horarios y actividades particulares de cada congregación.*

## ⚙️ Funcionalidades principales

### 📋 Registro de asistencia
Permite registrar la cantidad de asistentes a cada culto y organizar la información por fecha y actividad.

### 📊 Panel de estadísticas
Presenta información resumida sobre la asistencia, facilitando la consulta de totales y tendencias.

### 📅 Historial de asistencia
Permite consultar los registros de cultos anteriores para revisar y comparar la participación.

### 🔎 Búsqueda y filtros
Facilita la localización de registros según la fecha, el día de la semana o el tipo de culto.

### 📈 Reportes
Permite consultar y organizar la información para elaborar informes de asistencia.

### 👥 Gestión de usuarios
Puede incorporar acceso para los responsables de secretaría y otros usuarios autorizados, según los permisos definidos.

## 👤 Usuarios del sistema

- **Secretaría:** responsable del registro y la actualización de la asistencia.
- **Administración:** encargada de gestionar la configuración y los permisos, si el sistema incluye este rol.
- **Liderazgo de la congregación:** puede consultar los reportes autorizados para hacer seguimiento a la asistencia.

## 🛠️ Tecnologías

Las tecnologías utilizadas dependerán de la implementación final del proyecto.

Entre las opciones contempladas para su desarrollo se encuentran:

- **Frontend:** React o Next.js.
- **Lenguajes:** JavaScript, HTML y CSS.
- **Backend:** funciones de servidor o API, según la arquitectura.
- **Base de datos:** PostgreSQL, Supabase u otra solución compatible.
- **Control de versiones:** Git y GitHub.

*Actualiza esta sección para reflejar las tecnologías realmente utilizadas en el proyecto.*

## 🔐 Seguridad y privacidad

La información de asistencia debe manejarse de forma responsable.

- Restringir el acceso a usuarios autorizados.
- Proteger las credenciales y los datos de conexión.
- Validar los registros enviados al sistema.
- Implementar copias de seguridad cuando corresponda.
- Evitar la exposición pública de información administrativa.

## 🚀 Instalación y ejecución

Los siguientes pasos son una guía general para un proyecto basado en Node.js. Los comandos exactos pueden variar según las tecnologías y la estructura del repositorio.

### Requisitos

- Node.js en una versión compatible con el proyecto.
- npm u otro gestor de paquetes compatible.
- Acceso a la base de datos, si el sistema la utiliza.

### Pasos

1. Clonar el repositorio:

   ```bash
   git clone URL_DEL_REPOSITORIO
   ```

2. Entrar a la carpeta del proyecto:

   ```bash
   cd NOMBRE_DEL_PROYECTO
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

4. Configurar las variables de entorno necesarias en un archivo `.env.local`, siguiendo las instrucciones del proyecto.

5. Iniciar el servidor de desarrollo si el proyecto utiliza Next.js:

   ```bash
   npm run dev
   ```

6. Abrir en el navegador la dirección indicada por la terminal, normalmente `http://localhost:3000` para Next.js.

## 🔮 Mejoras futuras

Entre las posibles ampliaciones del sistema se encuentran:

- Exportación de reportes a Excel o PDF.
- Comparación de asistencia entre semanas y meses.
- Gráficas de evolución de la asistencia.
- Gestión de diferentes congregaciones.
- Registro individual de asistentes, si la iglesia lo requiere.
- Paneles diferenciados según los permisos de cada usuario.

## 🙏 Propósito

Este proyecto busca apoyar el trabajo administrativo de la iglesia mediante herramientas tecnológicas que faciliten la organización, el seguimiento y la consulta de la asistencia a los cultos.

## 👨‍💻 Desarrollo

Desarrollado como una solución tecnológica para la gestión de asistencia de la Iglesia Pentecostal Unida de Colombia (IPUC).

---

<div align="center">

**Sistema de Control de Asistencia — IPUC**

*Organización, seguimiento y tecnología al servicio de la iglesia.* ⛪

</div>
