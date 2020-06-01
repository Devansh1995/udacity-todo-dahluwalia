import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { getUserId } from '../utils'
import { createToDo } from '../../businessLogic/ToDo'

const logger = createLogger('createTodo')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Adding Todo: ', event)
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  
  if(!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'UserId invalid.'
      })
    }
  }

  const name = newTodo.name

  if(name == ''){
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Name invalid.'
      })
    }
  }

  const result = await createToDo(newTodo, userId)
  // TODO: Implement creating a new TODO item
  return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: result
      })
    }
}
