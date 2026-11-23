import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDocumentClient } from '@flipthescript-academy/dynamo-client';
import type { Course } from '@flipthescript-academy/shared-types';

const TABLE_NAME = process.env['COURSES_TABLE_NAME'] ?? '';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const handler: APIGatewayProxyHandler = async (
  event,
): Promise<APIGatewayProxyResult> => {
  const courseId = event.pathParameters?.courseId;

  if (!courseId) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'courseId is required' }),
    };
  }

  const result = await dynamoDocumentClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id: courseId } }),
  );

  const course = result.Item as Course | undefined;

  if (!course) {
    return {
      statusCode: 404,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'Course not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify(course),
  };
};
