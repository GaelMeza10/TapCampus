# 0002 — Autenticación y perfil obligatorio

Estado: **Planificado; implementación pendiente** | Fecha: 2026-10-01

## Contexto y fuentes

RF-01, RF-02, RNF-03; US-01 y US-02; `docs/03_ARCHITECTURE.md` (User, API y JWT), `docs/04_UI_UX_GUIDELINES.md`, `docs/05_USER_FLOWS.md`, `TASKS.md` 1.1–1.4, 2.1–2.2, 4.3 y 5.1. Existen controladores, DTO, pantallas y almacenamiento con `expo-secure-store`; el backend no compila porque usa `prisma.usuario` tras migrar el modelo a `User` (GAP-05).

## Alcance

- Registro de estudiante con nombre, correo `@uabc.edu.mx`, contraseña y teléfono; inicio de sesión y protección de rutas con JWT.
- Sesión móvil guardada en `expo-secure-store` y navegación al feed al autenticarse.
- Fuera de alcance: verificación por email, recuperación de contraseña, pagos, GPS y edición de perfil.

## Contrato observable

- `POST /auth/register`: JSON `{ name, email, password, phone }`; acepta `phone` mexicano de diez dígitos nacionales con o sin `+52`, de cualquier región de México, y lo persiste como `+52` más diez dígitos. Crea usuario con contraseña hasheada y devuelve `201` con `{ access_token }`. El servidor valida campos y dominio exacto; correo ya registrado da `409`, teléfono no mexicano o ambiguo da `400`.
- `POST /auth/login`: JSON `{ email, password }`; credenciales válidas devuelven `200` con `{ access_token }`; credenciales inválidas dan `401` sin revelar si el correo existe.
- Rutas protegidas exigen `Authorization: Bearer <token>` y responden `401` si falta o no es válido. El ID del JWT corresponde a `User.id` UUID.
- La API nunca devuelve `password` ni `password_hash`. El teléfono no se expone por el registro/login a otros usuarios.
- El formulario deshabilita registro si falta cualquiera de los cuatro datos; errores se muestran según la guía UI/UX. Un registro exitoso abre el feed.

## Criterios de aceptación

### AC-01 — Dominio institucional
**Dado** un correo que no termina en `@uabc.edu.mx`, **cuando** se envía el registro, **entonces** responde `400`, no crea usuario y muestra el error en la app.

### AC-02 — Registro completo y seguro
**Dado** cuatro datos válidos, correo nuevo y un teléfono mexicano de cualquier lada, con o sin `+52`, **cuando** se registra, **entonces** responde `201` con JWT, guarda `User.phone` canónico `+52XXXXXXXXXX` y hash de contraseña; la respuesta no incluye el hash.

### AC-03 — Campos y duplicados
**Dado** un campo faltante, teléfono fuera del formato mexicano o correo ya usado, **cuando** se intenta registrar, **entonces** el formulario no envía datos incompletos; el servidor rechaza faltantes y teléfono inválido con `400`, y correo duplicado con `409`, sin crear otro usuario.

### AC-04 — Inicio de sesión
**Dado** una cuenta existente, **cuando** ingresa contraseña correcta, **entonces** recibe `200` y JWT; una contraseña incorrecta o correo inexistente recibe `401` con el mismo mensaje genérico.

### AC-05 — Sesión y autorización
**Dado** un token válido almacenado en `expo-secure-store`, **cuando** se abre la app y se invoca una ruta protegida, **entonces** navega al feed y envía el Bearer; sin token o con token inválido, la API responde `401` y la app presenta login.

### AC-06 — Contrato entre capas
**Dado** el esquema Prisma `User` con UUID y campos ingleses, **cuando** compilan backend y frontend y se ejecuta registro/login integrados, **entonces** DTO, servicio, cliente HTTP y JWT usan el mismo contrato sin referencias a `prisma.usuario`.

## Decisiones

DEC-03 está resuelta junto con 0008 DEC-01. Quedan pendientes la adaptación del código y la evidencia de ejecución.
