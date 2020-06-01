import {Types} from 'aws-sdk/clients/s3';
import {TodoItem} from "../models/TodoItem";
import {TodoUpdate} from "../models/TodoUpdate";
import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS)

export class Access {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly s3: Types = new XAWS.S3({signatureVersion: 'v4'}),
        private readonly bucketName = process.env.ATTACH_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
    }

    async getAllTodo(userId: string): Promise<TodoItem[]> {
        
        const result = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            },
            ScanIndexForward: false
          }).promise()

        const items = result.Items

        return items as TodoItem[]
    }

    async createToDo(newItem: TodoItem, todoId: string): Promise<TodoItem> {

        newItem.attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`

        await this.docClient.put({
            TableName: this.todoTable,
            Item: newItem
          })
          .promise()
        
        return newItem as TodoItem
    }

    async deleteToDo(todoId: string, userId: string): Promise<string> {
        
        await this.docClient.delete({
            TableName: this.todoTable,
            Key: {
              userId,
              todoId
            }
          }).promise()

        return "" as string
    }

    async generateUploadUrl(todoId: string): Promise<string> {
        const url = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: parseInt(this.urlExpiration, 10)
          })

        return url as string
    }

    async getTodo(userId: string, todoId: string): Promise<TodoItem> {
        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: {
              userId,
              todoId
            }
          }).promise()

          return result.Item as TodoItem
    }

    async updateToDo(updatedTodo: TodoUpdate, todoId: string, userId: string): Promise<string> {
        await this.docClient.update({
            TableName: this.todoTable,
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

        return "" as string
    }

}