import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { updateTodo } from '../../businessLogic/todo.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    try {
      const todo = JSON.parse(event.body)
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)
      const result = await updateTodo(userId, todoId, todo)
      return {
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        statusCode: 204,
        body: JSON.stringify({ item: result })
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
