import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { Access } from '../dataLayer/Access'
import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const access = new Access()

export function getAllTodo(userId: string): Promise<TodoItem[]>{
    return access.getAllTodo(userId)
}

export function createToDo(newTodo: CreateTodoRequest, userId: string) {
    const todoId = uuid.v4()
    return access.createToDo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        ...newTodo,
    }, todoId);
}

export function deleteTodo(todoId: string, userId: string) {
    return access.deleteToDo(todoId, userId)
}

export function generateUrl(todoId: string) {
    return access.generateUploadUrl(todoId)
}

export function getTodo(userId: string, todoId: string) {
    return access.getTodo(userId, todoId)
}

export function updateTodo(updateTodo: UpdateTodoRequest, todoId: string, userId: string) {
    return access.updateToDo(updateTodo, todoId, userId)
}