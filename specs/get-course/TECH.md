# GET /courses/{courseId} — tech spec

Follow the repo conventions in `CLAUDE.md`.

## Handler

- New file `apps/api/src/handlers/get-course.ts`, exporting `handler` as an
  `APIGatewayProxyHandler` (same shape as `list-courses.ts`).
- Read the table name from `process.env['COURSES_TABLE_NAME']`.
- Read `courseId` from `event.pathParameters?.courseId`.
- Fetch with `GetCommand` (from `@aws-sdk/lib-dynamodb`) on key `{ id: courseId }`
  using the shared `dynamoDocumentClient` from
  `@flipthescript-academy/dynamo-client`. Never instantiate a new client.
- Type the item as `Course` from `@flipthescript-academy/shared-types`.
- Status codes and bodies exactly as in `PRODUCT.md`. Every response includes
  `headers: { 'Content-Type': 'application/json' }`.
- Let DynamoDB errors propagate (API Gateway returns 500); don't swallow them.

## Tests

- New file `apps/api/src/handlers/get-course.spec.ts` (vitest), mocking
  `dynamoDocumentClient.send` (e.g. `vi.mock` of the dynamo-client module).
- Cover: 200 with the course body, 404 when no `Item`, 400 when the path
  parameter is missing, and that the `GetCommand` targets the configured table
  with key `{ id }`.

## Build and infra

- Add `apps/api/src/handlers/get-course.ts` to `additionalEntryPoints` of the
  `build` target in `apps/api/package.json`.
- In `infra/cdk/lib/api-stack.ts`: add a `GetCourseFunction` `NodejsFunction`
  (Node 22, 10 s timeout, `COURSES_TABLE_NAME` env), grant it
  `coursesTable.grantReadData` only, and route `GET /courses/{courseId}` to it
  with an `HttpLambdaIntegration`.

## Don't touch

`.github/`, `CLAUDE.md`, `bun.lock`, any `package.json` dependency lists, and
existing handlers. No new dependencies.
