# GET /courses/{courseId} — product spec

## Why

The web app's course detail page (`/courses/[courseId]`) reads static data. To
back it with the API later, the API needs a way to fetch one course by id
instead of scanning the whole table.

## What

A new endpoint, `GET /courses/{courseId}`, returning a single course.

| Case | Status | Body |
|---|---|---|
| Course exists | `200` | the `Course` object as JSON |
| No course with that id | `404` | `{ "message": "Course not found" }` |
| `courseId` path parameter missing or empty | `400` | `{ "message": "courseId is required" }` |

All responses set `Content-Type: application/json`.

## Out of scope

- Wiring the web app to this endpoint.
- Auth, caching, pagination, or changes to `GET /courses`.
- Seeding data or deploying the stack.

## Done when

- The endpoint behaves as in the table above.
- It is covered by a co-located vitest spec.
- `bunx nx run-many -t lint typecheck test build` passes, and `cdk synth` still succeeds.
