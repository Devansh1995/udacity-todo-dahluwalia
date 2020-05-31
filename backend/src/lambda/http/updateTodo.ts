import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODO_TABLE
const logger = createLogger('updateTodo')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  logger.info('Update Todo: ', todoId)
  const userId = getUserId(event)
  const validtodo = await toDoExist(userId, todoId)

  if(!validtodo){
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  await docClient.update({
    TableName: todoTable,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
    ExpressionAttributeNames: {
      '#name' : 'name',
      '#dueDate': 'dueDate',
      '#done' : 'done'
    },
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
    }
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
    })
  }
}

async function toDoExist(userId: string, todoId: string) {
  const result = await docClient.get({
    TableName: todoTable,
    Key: {
      userId,
      todoId
    }
  }).promise()

  console.log('Get todo: ', result)
  return !!result.Item
}