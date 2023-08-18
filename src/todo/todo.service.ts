import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import * as admin from 'firebase-admin'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TodoService {
  constructor(private configService: ConfigService) { }

  create(createTodoDto: CreateTodoDto) {
    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_TODO')).doc()
        .set({
          url: createTodoDto.url,
          description: createTodoDto.description,
          client_uid: createTodoDto.client_uid,
          done: createTodoDto.done
        })
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }



  async findAll(id: string, url: string) {
    try {
      const collection = await admin.firestore().collection(this.configService.get<string>('COLLECTION_TODO')).where('client_uid', '==', id).where('url', '==', url).get()
      const mainDocs = [];
      collection.forEach(doc => {
        mainDocs.push({ ...doc.data(), _id: doc.id });
      })
      return mainDocs;

    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
  CheckTodo(uid: string, updateTodoDto: UpdateTodoDto) {

    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_TODO')).doc(uid)
        .update({
          done: updateTodoDto.done
        })
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

    remove(id: string) {
    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_TODO')).doc(id)
        .delete()
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }



}
