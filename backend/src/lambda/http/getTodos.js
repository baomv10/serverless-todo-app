import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { getAllTodosByUser } from '../../businessLogic/todo.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {

    try {
      const userId = getUserId(event)
      const todos = await getAllTodosByUser(userId);
      return {
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        statusCode: 200,
        body: JSON.stringify({
          items: todos
        })
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
