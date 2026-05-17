# Plan: Email Value Object

## Task Description
Implementar el Value Object `Email` en la capa de dominio del backend de FamilyLink, siguiendo los principios DDD y la arquitectura hexagonal definidos en design.md. El Value Object debe ser inmutable, validar el formato RFC 5322, y ser testeado al 100%.

## Objective
Crear `backend/src/domain/value-objects/Email.ts` con validación robusta, tests unitarios con 100% de cobertura, y documentación técnica del módulo.

## Problem Statement
La capa de dominio necesita un tipo seguro para representar emails que garantice en tiempo de construcción que el valor es válido. Sin este Value Object, la validación de emails estaría dispersa por la aplicación y podría llegar un email inválido al dominio.

## Solution Approach
- Clase `Email` inmutable con constructor privado y factory method estático `create()`
- Validación con regex RFC 5322 simplificado en el constructor
- Método `equals()` para comparación por valor
- Método `toString()` para serialización
- Tests con Vitest cubriendo casos válidos, inválidos, inmutabilidad y value equality
- Documentación en `docs/domain/email-value-object.md`

## Relevant Files

### Existing Files
- `backend/src/shared/errors/AppError.ts` — usar `ValidationError` para emails inválidos
- `backend/src/shared/config/env.ts` — referencia de estilo TypeScript
- `.kiro/specs/family-link/design.md` — especificación del Value Object (sección 3.1)
- `.kiro/specs/family-link/requirements.md` — Req 1 y 2 (registro y login usan email)

### New Files
- `backend/src/domain/value-objects/Email.ts` — implementación del Value Object
- `backend/tests/unit/domain/value-objects/Email.test.ts` — tests unitarios
- `docs/domain/email-value-object.md` — documentación técnica

## Team Orchestration

### Team Members

- **Builder**
  - Name: builder-email
  - Role: Implementar Email.ts siguiendo DDD
  - Agent: builder

- **Validator**
  - Name: validator-email
  - Role: Verificar que el código cumple los criterios de seguridad y diseño
  - Agent: validator

- **Tester**
  - Name: tester-email
  - Role: Escribir y ejecutar tests unitarios con 100% de cobertura
  - Agent: tester

- **Documenter**
  - Name: documenter-email
  - Role: Generar documentación técnica del módulo
  - Agent: documenter

## Step by Step Tasks

### 1. Implementar Email Value Object
- **Task ID**: build-email-vo
- **Depends On**: none
- **Assigned To**: builder-email
- **Agent**: builder
- **Actions**:
  - Leer `backend/src/shared/errors/AppError.ts` para usar `ValidationError`
  - Crear `backend/src/domain/value-objects/Email.ts` con:
    - Clase `Email` con propiedad `value` readonly
    - Constructor privado
    - Factory method estático `create(value: string): Email` que valida y lanza `ValidationError` si inválido
    - Regex de validación: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (simplificado RFC 5322)
    - Método `equals(other: Email): boolean`
    - Método `toString(): string`
    - `Object.freeze(this)` para garantizar inmutabilidad
- **Acceptance Criteria**:
  - `Email.create('user@example.com')` no lanza error
  - `Email.create('invalid')` lanza `ValidationError`
  - `Email.create('user@example.com').equals(Email.create('user@example.com'))` retorna `true`
  - La propiedad `value` no puede ser modificada después de la construcción

### 2. Validar implementación
- **Task ID**: validate-email-vo
- **Depends On**: build-email-vo
- **Assigned To**: validator-email
- **Agent**: validator
- **Checks**:
  - El constructor es privado (no se puede instanciar con `new Email()`)
  - La clase usa `Object.freeze()` o propiedades readonly
  - El mensaje de error es descriptivo
  - No hay dependencias externas (solo usa código del propio proyecto)
  - El código sigue el estilo TypeScript del proyecto (strict mode)

### 3. Escribir y ejecutar tests
- **Task ID**: test-email-vo
- **Depends On**: validate-email-vo
- **Assigned To**: tester-email
- **Agent**: tester
- **Actions**:
  - Crear `backend/tests/unit/domain/value-objects/Email.test.ts`
  - Tests a cubrir:
    - ✅ Emails válidos: `user@example.com`, `user.name+tag@domain.co.uk`, `user@subdomain.domain.com`
    - ❌ Emails inválidos: `invalid`, `@domain.com`, `user@`, `user @domain.com`, cadena vacía
    - 🔒 Inmutabilidad: intentar modificar `email.value` lanza error en strict mode
    - ⚖️ Value equality: dos instancias con el mismo valor son iguales
    - 📝 toString: retorna el valor del email
  - Ejecutar: `cd backend && npx vitest run tests/unit/domain/value-objects/Email.test.ts`
  - Verificar que todos los tests pasan
- **Acceptance Criteria**:
  - Todos los tests pasan
  - Cobertura del archivo `Email.ts`: 100% líneas, 100% ramas

### 4. Documentar el módulo
- **Task ID**: document-email-vo
- **Depends On**: test-email-vo
- **Assigned To**: documenter-email
- **Agent**: documenter
- **Actions**:
  - Crear `docs/domain/email-value-object.md` con:
    - Qué es y por qué existe (contexto DDD)
    - API pública: `Email.create()`, `equals()`, `toString()`, propiedad `value`
    - Ejemplos de uso
    - Errores que puede lanzar
    - Enlace al requisito relacionado (Req 1 y 2 de requirements.md)
- **Acceptance Criteria**:
  - El documento existe y tiene ejemplos de código
  - Incluye referencia a los requisitos

### 5. Validación final
- **Task ID**: validate-all
- **Depends On**: document-email-vo
- **Assigned To**: validator-email
- **Agent**: validator
- **Checks**:
  - El archivo `Email.ts` existe en la ruta correcta
  - Los tests pasan al 100%
  - La documentación existe
  - No hay errores de TypeScript: `cd backend && npx tsc --noEmit`

## Acceptance Criteria
- [ ] `backend/src/domain/value-objects/Email.ts` existe y compila sin errores
- [ ] `backend/tests/unit/domain/value-objects/Email.test.ts` existe y todos los tests pasan
- [ ] Cobertura 100% en `Email.ts`
- [ ] `docs/domain/email-value-object.md` existe con documentación completa
- [ ] No hay errores de TypeScript (`tsc --noEmit`)

## Validation Commands
```bash
# Ejecutar tests del Value Object
cd backend && npx vitest run tests/unit/domain/value-objects/Email.test.ts

# Verificar TypeScript
cd backend && npx tsc --noEmit

# Cobertura
cd backend && npx vitest run --coverage tests/unit/domain/value-objects/Email.test.ts
```

## Notes
- El Value Object `Email` será usado por las entidades `User` e `Invitation`
- Seguir el patrón de `AppError.ts` para el manejo de errores
- No usar librerías externas de validación de email (mantener el dominio puro)
- La validación es intencionalmente simple — RFC 5322 completo es innecesariamente complejo para este caso
