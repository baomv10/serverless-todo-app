import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { deleteTodo } from '../../businessLogic/todo.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    
    try {
      const todoId = event.pathParameters.todoId;
      const userId = getUserId(event)
      const result = await deleteTodo(userId, todoId);
      return {
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        statusCode: 204,
        body: result
      }
    } catch (error) {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        statusCode: 500,
        body: JSON.stringify({ Error: error })
      }
    }
  })
