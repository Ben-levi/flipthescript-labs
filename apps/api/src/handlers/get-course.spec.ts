import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import type { Course } from '@flipthescript-academy/shared-types';

const { send } = vi.hoisted(() => {
  // The handler reads the table name at module load, so set it before import.
  process.env['COURSES_TABLE_NAME'] = 'test-courses-table';
  return { send: vi.fn() };
});

vi.mock('@flipthescript-academy/dynamo-client', () => ({
  dynamoDocumentClient: { send },
}));

import { handler } from './get-course.js';

const course: Course = {
  id: 'course-1',
  title: 'Intro to Web Security',
  description: 'Learn the basics',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const invoke = (pathParameters: APIGatewayProxyEvent['pathParameters']) =>
  handler(
    { pathParameters } as APIGatewayProxyEvent,
    {} as never,
    undefined as never,
  );

const JSON_HEADERS = { 'Content-Type': 'application/json' };

describe('get-course handler', () => {
  beforeEach(() => {
    send.mockReset();
  });

  it('returns 200 with the course when it exists', async () => {
    send.mockResolvedValue({ Item: course });

    const result = await invoke({ courseId: 'course-1' });

    expect(result?.statusCode).toBe(200);
    expect(result?.headers).toEqual(JSON_HEADERS);
    expect(JSON.parse(result?.body ?? '')).toEqual(course);
  });

  it('gets the item from the configured table by id', async () => {
    send.mockResolvedValue({ Item: course });

    await invoke({ courseId: 'course-1' });

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(GetCommand);
    expect(command.input).toEqual({
      TableName: 'test-courses-table',
      Key: { id: 'course-1' },
    });
  });

  it('returns 404 when no course has that id', async () => {
    send.mockResolvedValue({});

    const result = await invoke({ courseId: 'missing' });

    expect(result?.statusCode).toBe(404);
    expect(result?.headers).toEqual(JSON_HEADERS);
    expect(JSON.parse(result?.body ?? '')).toEqual({
      message: 'Course not found',
    });
  });

  it('returns 400 when the path parameter is missing', async () => {
    const result = await invoke(null);

    expect(result?.statusCode).toBe(400);
    expect(result?.headers).toEqual(JSON_HEADERS);
    expect(JSON.parse(result?.body ?? '')).toEqual({
      message: 'courseId is required',
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('returns 400 when the path parameter is empty', async () => {
    const result = await invoke({ courseId: '' });

    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? '')).toEqual({
      message: 'courseId is required',
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('propagates DynamoDB errors', async () => {
    send.mockRejectedValue(new Error('boom'));

    await expect(invoke({ courseId: 'course-1' })).rejects.toThrow('boom');
  });
});
