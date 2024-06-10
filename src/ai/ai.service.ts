/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { CreatePromptDto } from './dto/createPrompt.dto';
import { ResponseDto } from '../shared/dto/response.dto';
import { Prompt } from './entities/prompt';
import { UpdatePromptDto } from './dto/updatePrompt.dto';

@Injectable()
export class AiService {
  constructor(private firebaseService: FirebaseService) {}

    async createNewPrompt(
        createPromptDto: CreatePromptDto,
    ): Promise<ResponseDto> {
        try {
            const { creator, messages, company, app, tags } = createPromptDto;

            const userRef = doc(this.firebaseService.fireStore, 'users', creator);
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()) {
                const response: ResponseDto = new ResponseDto(
                    'error',
                    404,
                    'UserNotFound',
                    {},
                );
                return response;
            }

            const promptRef = collection(this.firebaseService.fireStore, 'prompts');

            const newPrompt: Prompt = {
                creator,
                messages,
                company,
                app,
                tags,
            };

            const newPromptDocRef = await addDoc(promptRef, newPrompt);

            await updateDoc(newPromptDocRef, { id: newPromptDocRef.id });

            const responseDto = new ResponseDto(
                'success',
                201,
                'The prompt was created successfully.',
                { id: newPromptDocRef.id, ...newPrompt },
            );
            return responseDto;
        } catch (error) {
            console.error('Error while creating a prompt:', error);
            const response: ResponseDto = new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
            return response;
        }
    }


    async updatePrompt(id: string, updatePromptDto: UpdatePromptDto): Promise<ResponseDto> {
        try {
            const promptRef = doc(this.firebaseService.fireStore, 'prompts', id);
            const promptSnapshot = await getDoc(promptRef);

            if (!promptSnapshot.exists()) {
                const response: ResponseDto = new ResponseDto(
                    'error',
                    404,
                    'PromptNotFound',
                    {},
                );
                return response;
            }

            const updatedPromptData = {
                ...promptSnapshot.data(),
                ...updatePromptDto,
            };

            await updateDoc(promptRef, updatedPromptData);

            const responseDto = new ResponseDto(
                'success',
                200,
                'The prompt was updated successfully.',
                { id, ...updatedPromptData },
            );
            return responseDto;
        } catch (error) {
            console.error('Error while updating a prompt:', error);
            const response: ResponseDto = new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
            return response;
        }
    }

    async deletePrompt(id: string): Promise<ResponseDto> {
        try {
            const promptRef = doc(this.firebaseService.fireStore, 'prompts', id);
            const promptSnapshot = await getDoc(promptRef);

            if (!promptSnapshot.exists()) {
                const response: ResponseDto = new ResponseDto(
                    'error',
                    404,
                    'PromptNotFound',
                    {},
                );
                return response;
            }

            await deleteDoc(promptRef);

            const responseDto = new ResponseDto(
                'success',
                200,
                'The prompt was deleted successfully.',
                { id },
            );
            return responseDto;
        } catch (error) {
            console.error('Error while deleting a prompt:', error);
            const response: ResponseDto = new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
            return response;
        }
    }

    async getAllPrompts(): Promise<ResponseDto> {
        try {
            const promptRef = collection(this.firebaseService.fireStore, 'prompts');
            const promptSnapshot = await getDocs(promptRef);

            const prompts = promptSnapshot.docs.map(doc => doc.data());

            const responseDto = new ResponseDto(
                'success',
                200,
                'The prompts were retrieved successfully.',
                prompts,
            );
            return responseDto;
        } catch (error) {
            console.error('Error while retrieving prompts:', error);
            const response: ResponseDto = new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
            return response;
        }
    }

    async getPromptById(id: string): Promise<ResponseDto> {
        try {
            const promptRef = doc(this.firebaseService.fireStore, 'prompts', id);
            const promptSnapshot = await getDoc(promptRef);

            if (!promptSnapshot.exists()) {
                const response: ResponseDto = new ResponseDto(
                    'error',
                    404,
                    'PromptNotFound',
                    {},
                );
                return response;
            }

            const prompt = promptSnapshot.data();

            const responseDto = new ResponseDto(
                'success',
                200,
                'The prompt was retrieved successfully.',
                prompt,
            );
            return responseDto;
        } catch (error) {
            console.error('Error while retrieving a prompt:', error);
            const response: ResponseDto = new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
            return response;
        }
    }





}
