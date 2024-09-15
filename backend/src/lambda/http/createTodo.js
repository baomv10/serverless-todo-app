import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { createTodo } from '../../businessLogic/todo.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    try {
      const newTodo = JSON.parse(event.body)
      const userId = getUserId(event)
      const result = await createTodo(newTodo, userId)
      return {
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        statusCode: 201,
        body: JSON.stringify({
          item: result
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
