import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

import { getUserId } from '../utils'

const logger = createLogger('createTodo')

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE
const bucketName = process.env.ATTACH_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Adding Todo: ', event)
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  const todoId = uuid.v4()
  if(!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'UserId invalid.'
      })
    }
  }

  const newItem = {
    userId, 
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    ...newTodo,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  }

  await docClient.put({
    TableName: todoTable,
    Item: newItem
  })
  .promise()

  // TODO: Implement creating a new TODO item
  return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: newItem
      })
    }
}
