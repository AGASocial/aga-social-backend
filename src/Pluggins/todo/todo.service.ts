import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import * as admin from 'firebase-admin'
import { ConfigService } from '@nestjs/config';
import { GetUsersResponseDto } from '../../auth/dto/getUsersResponse.dto';
import { ApiInternalServerErrorResponse, ApiOkResponse } from '@nestjs/swagger';
import { FirebaseService } from '../../firebase/firebase.service';
import { getDocs, orderBy, query } from 'firebase/firestore';
import { GetEmailsResponseDto } from '../../auth/dto/getEmailsResponse.dto';

@Injectable()
export class TodoService {
  constructor(private configService: ConfigService, private firebaseService: FirebaseService) { }

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


    //NEW BACKEND


    @ApiOkResponse({ description: 'User emails retrieved successfully', type: GetEmailsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getUsersEmails(): Promise<GetEmailsResponseDto> {
        try {
            console.log('Initializing getUsersEmails...');

            const cachedUsers = await this.firebaseService.getCollectionData('users');
            if (cachedUsers.length > 0) {
                console.log('Using cached users data.');

                const userEmails = cachedUsers.map((user) => user.email);

                const getEmailsResponseDto: GetEmailsResponseDto = {
                    statusCode: 200,
                    message: 'EMAILSRETRIEVEDSUCCESSFULLY',
                    emailsFound: userEmails,
                };
                return getEmailsResponseDto;
            }

            const usersRef = this.firebaseService.usersCollection;
            const usersQuery = query(usersRef, orderBy('name'));
            console.log('User query created.');

            const usersQuerySnapshot = await getDocs(usersQuery);
            console.log('Users query snapshot obtained.');

            let userEmails = [];
            usersQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                userEmails.push(data.email);
            });
            console.log('User emails collected.');

            const getEmailsResponseDto: GetEmailsResponseDto = {
                statusCode: 200,
                message: 'EMAILSRETRIEVEDSUCCESSFULLY',
                emailsFound: userEmails,
            };
            console.log('Response created.');

            return getEmailsResponseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error('There was an error retrieving the user emails.');
        }
    }








}
