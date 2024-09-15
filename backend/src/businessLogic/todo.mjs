import { TodoAccess } from '../dataLayer/todoAccess.mjs'
import * as uuid from 'uuid'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createLogger } from '../utils/logger.mjs'

const todoAccess = new TodoAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('businessLogic/todo')
const s3Client = new S3Client()
export async function getAllTodosByUser(userId) {
  try {
    logger.info('getAllTodosByUser')
    return await todoAccess.getAllTodosByUser(userId)
  } catch (error) {
    logger.error('getAllTodosByUser', error)
    throw Error(error)
  }
}

export async function createTodo(todo, userId) {
  try {
    logger.info('createTodo')
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const newItem = {
      ...todo,
      userId,
      todoId,
      createdAt,
      done: false,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }
    return await todoAccess.createTodo(newItem)
  } catch (error) {
    logger.error('createTodo', error)
    throw Error(error)
  }
}

export async function updateTodo(userId, todoId, todo) {
  try {
    logger.info('updateTodo')
    return await todoAccess.updateTodo(userId, todoId, todo)
  } catch (error) {
    logger.error('updateTodo', error)
    throw Error(error)
  }
}

export async function deleteTodo(userId, todoId) {
  try {
    logger.info('deleteTodo')
    return await todoAccess.deleteTodo(userId, todoId)
  } catch (error) {
    logger.error('deleteTodo', error)
    throw Error(error)
  }
}
export async function getUploadUrl(todoId) {
  try {
    logger.info('getUploadUrl')
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId
    })
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: parseInt(urlExpiration)
    })
    return url
  } catch (error) {
    logger.error('getUploadUrl', error)
    throw Error(error)
  }
}
