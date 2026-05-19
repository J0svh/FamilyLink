# HTTP Integration Tests

These tests use Supertest to test the Express routes with in-memory mocks.
No database or external services required.

## Running

```bash
npx vitest run tests/integration/http/
```

## Dependencies

Make sure `supertest` and `@types/supertest` are installed:
```bash
npm install -D supertest @types/supertest
```
