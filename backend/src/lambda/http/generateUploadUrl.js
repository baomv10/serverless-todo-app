import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUploadUrl } from '../../businessLogic/todo.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    try {
      const todoId = event.pathParameters.todoId
      const url = await getUploadUrl(todoId)
      return {
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        statusCode: 201,
        body: JSON.stringify({ uploadUrl: url })
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
