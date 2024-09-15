import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'
const logger = createLogger('dataLayer/TodoAccess')
export class TodoAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todoTable = process.env.TODO_TABLE
  ) {
    this.documentClient = documentClient
    this.todoTable = todoTable
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
  }

  async getAllTodosByUser(userId) {
    try {
      logger.info('getAllTodosByUser')
      const resuslt = await this.dynamoDbClient.query({
        TableName: this.todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      return resuslt.Items
    } catch (error) {
      logger.error('getAllTodosByUser', error)
      throw Error(error)
    }
  }

  async getAllTodos() {
    try {
      logger.info('getAllTodos')
      const result = await this.dynamoDbClient.scan({
        TableName: this.todoTable
      })
      return result.Items
    } catch (error) {
      logger.error('getAllTodos', error)
      throw Error(error)
    }
  }

  async createTodo(todo) {
    try {
      logger.info('createTodo')
      await this.dynamoDbClient.put({
        TableName: this.todoTable,
        Item: todo
      })
      return todo
    } catch (error) {
      logger.error('createTodo', error)
      throw Error(error)
    }
  }

  async updateTodo(userId, todoId, todo) {
    try {
      logger.info('updateTodo')
      await this.dynamoDbClient.update({
        TableName: this.todoTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression:
          'set #name = :name, #dueDate = :dueDate, #done = :done',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        },
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done
        }
      })
      return todo
    } catch (error) {
      logger.error('updateTodo', error)
      throw Error(error)
    }
  }

  async deleteTodo(userId, todoId) {
    try {
      logger.info('deleteTodo')
      await this.dynamoDbClient.delete({
        TableName: this.todoTable,
        Key: {
          userId,
          todoId
        }
      })
      return true
    } catch (error) {
      logger.error('deleteTodo', error)
      throw Error(error)
    }
  }
}
