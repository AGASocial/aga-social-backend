/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, setDoc, where, query} from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { CreatePromptDto } from './dto/createPrompt.dto';
import { ResponseDto } from '../shared/dto/response.dto';
import { Prompt } from './entities/prompt';
import { UpdatePromptDto } from './dto/updatePrompt.dto';
import { OpenAiService } from './openai/openai.service';
import Handlebars from 'handlebars';
import { ExecutePromptDto } from './dto/executePrompt.dto';


@Injectable()
export class AiService {
    constructor(private firebaseService: FirebaseService, private openAIService: OpenAiService) { }

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

    async getPromptsByQuery(query: {
        company?: string;
        creator?: string;
        app?: string;
        tags?: string[] | string;
    }): Promise<ResponseDto> {
        try {
            const promptRef = collection(this.firebaseService.fireStore, 'prompts');
            const promptSnapshot = await getDocs(promptRef);
            let prompts = promptSnapshot.docs.map(doc => doc.data());

            if (query.company) {
                prompts = prompts.filter(prompt => prompt.company === query.company);
            }
            if (query.creator) {
                prompts = prompts.filter(prompt => prompt.creator === query.creator);
            }
            if (query.app) {
                prompts = prompts.filter(prompt => prompt.app === query.app);
            }
            if (query.tags) {
                const tags = Array.isArray(query.tags) ? query.tags : [query.tags];
                prompts = prompts.filter(prompt =>
                    tags.every(tag => prompt.tags.includes(tag))
                );
            }

            if (prompts.length === 0) {
                return new ResponseDto('error', 404, 'ElementsNotFound', null);
            }

            return new ResponseDto(
                'success',
                200,
                'ElementsRetrievedSuccessfully',
                prompts,
            );
        } catch (error) {
            console.error('Error retrieving prompts:', error);
            return new ResponseDto(
                'error',
                400,
                `UnableToCompleteOperation ${error.message}`,
                null,
            );
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


    async executePrompt(
        promptId: string,
        executePromptDto: ExecutePromptDto,
    ): Promise<ResponseDto> {
        try {
            console.log('Starting executePrompt with parameters:', executePromptDto);

            const promptRef = doc(this.firebaseService.fireStore, 'prompts', promptId);
            const promptSnapshot = await getDoc(promptRef);

            if (!promptSnapshot.exists()) {
                console.log('Prompt not found:', promptId);
                return new ResponseDto('error', 404, 'ElementNotFound', null);
            }

            let messages = promptSnapshot.data().messages;

            messages = messages.map((message) => {
                if (message.role !== 'system') {
                    const template = Handlebars.compile(message.content);
                    message.content = template(executePromptDto.parameters);
                }
                return message;
            });

            console.log('Messages after Handlebars processing:', messages);

            const aiParameters = {
                model: executePromptDto.aiparameters.model,
                messages: messages,
                ...executePromptDto.aiparameters,
            };
            const openai = await this.openAIService.getOpenAI()
            const response = await openai.chat.completions.create(aiParameters);
            console.log('Response from OpenAI:', response);

            const logData = {
                promptId: promptId,
                executionTime: new Date().toISOString(),
                tags: promptSnapshot.data().tags,
                creator: promptSnapshot.data().creator,
                company: promptSnapshot.data().company,
                app: promptSnapshot.data().app,
                messages: promptSnapshot.data().messages,
                ...response,
            };

            const logRef = await addDoc(collection(this.firebaseService.fireStore, 'promptLogs'), logData);
            console.log('Log ID:', logRef.id);

            await setDoc(logRef, { logId: logRef.id }, { merge: true });

            const logSnapshot = await getDoc(logRef);
            const assistantMessageContent = logSnapshot.data().choices[0].message.content;

            return new ResponseDto(
                'success',
                200,
                'PromptAnsweredSuccessfully',
                { content: assistantMessageContent },
            );
        }
        catch (error) {
            console.error('Error executing prompt:', error);
            return new ResponseDto(
                'error',
                400,
                `UnableToCompleteOperation: ${error.message}`,
                null,
            );
        }
    }


  async getPromptLogs(promptId: string, startDate?: string, endDate?: string): Promise<ResponseDto> {
    try {
        console.log('Retrieving logs for prompt:', promptId);

        const logsRef = collection(this.firebaseService.fireStore, 'promptLogs');
        const logsQuery = query(logsRef, where('promptId', '==', promptId));
        const querySnapshot = await getDocs(logsQuery);

        if (querySnapshot.empty) {
            console.log('No logs found for prompt:', promptId);
            return new ResponseDto('error', 404, 'LogsNotFound', null);
        }

        let logs = querySnapshot.docs.map(doc => ({ ...doc.data() }));

        if (startDate || endDate) {
            const startDateTimestamp = startDate ? new Date(startDate).getTime() : null;
            const endDateTimestamp = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

            logs = logs.filter(log => {
                const logDate = new Date(log.executionTime).getTime();
                return (!startDateTimestamp || logDate >= startDateTimestamp) &&
                       (!endDateTimestamp || logDate <= endDateTimestamp);
            });
        }

        console.log('Logs retrieved successfully for prompt:', promptId);
        return new ResponseDto(
            'success',
            200,
            'LogsRetrievedSuccessfully',
            logs,
        );
    } catch (error) {
        console.error('Error retrieving prompt logs:', error);
        return new ResponseDto(
            'error',
            400,
            `UnableToCompleteOperation: ${error.message}`,
            null,
        );
    }
}





}
