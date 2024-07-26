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
import { CreateSequenceDto } from './dto/createSequence.dto';
import { UpdateSequenceDto } from './dto/updateSequence.dto';


@Injectable()
export class AiService {
    constructor(private firebaseService: FirebaseService, private openAIService: OpenAiService) { }

    async createNewPrompt(
        createPromptDto: CreatePromptDto,
    ): Promise<ResponseDto> {
        try {
            const { creator, messages } = createPromptDto;

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
                ...Object.fromEntries(
                    Object.entries(createPromptDto).filter(([_, v]) => v !== undefined)
                ),
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

    //SEQUENCES

    async createNewSequence(createSequenceDto: CreateSequenceDto): Promise<ResponseDto> {
        try {
            const { name, description, prompts } = createSequenceDto;


            const sequenceRef = collection(this.firebaseService.fireStore, 'sequences');

            const newSequence = {
                name,
                description,
                prompts,
            };

            const newSequenceDocRef = await addDoc(sequenceRef, newSequence);

            await updateDoc(newSequenceDocRef, { id: newSequenceDocRef.id });

            const responseDto = new ResponseDto(
                'success',
                201,
                'The sequence was created successfully.',
                { id: newSequenceDocRef.id, ...newSequence },
            );
            return responseDto;
        } catch (error) {
            console.error('Error while creating a sequence:', error);
            const response: ResponseDto = new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
            return response;
        }
    }

    async updateSequence(sequenceId: string, updateSequenceDto: UpdateSequenceDto): Promise<ResponseDto> {
        try {
            const sequenceRef = doc(this.firebaseService.fireStore, 'sequences', sequenceId);

            const updateData = Object.entries(updateSequenceDto).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            await updateDoc(sequenceRef, updateData);

            const updatedSequenceSnapshot = await getDoc(sequenceRef);
            const updatedSequenceData = updatedSequenceSnapshot.data();

            return new ResponseDto(
                'success',
                200,
                'The sequence was updated successfully.',
                { id: sequenceId, ...updatedSequenceData },
            );
        } catch (error) {
            console.error('Error while updating the sequence:', error);
            return new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
        }
    }


    async getSequence(sequenceId: string): Promise<ResponseDto> {
        try {
            const sequenceRef = doc(this.firebaseService.fireStore, 'sequences', sequenceId);
            const sequenceSnapshot = await getDoc(sequenceRef);

            if (!sequenceSnapshot.exists()) {
                return new ResponseDto(
                    'error',
                    404,
                    'SequenceNotFound',
                    {},
                );
            }

            const sequenceData = sequenceSnapshot.data();

            return new ResponseDto(
                'success',
                200,
                'SequenceRetrievedSuccessfully',
                { id: sequenceId, ...sequenceData },
            );
        } catch (error) {
            console.error('Error while retrieving the sequence:', error);
            return new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
        }
    }

    async getAllSequences(): Promise<ResponseDto> {
        try {
            const sequencesRef = collection(this.firebaseService.fireStore, 'sequences');
            const querySnapshot = await getDocs(sequencesRef);

            if (querySnapshot.empty) {
                return new ResponseDto(
                    'error',
                    404,
                    'NoSequencesFound',
                    {},
                );
            }

            const sequences = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            return new ResponseDto(
                'success',
                200,
                'SequencesRetrievedSuccessfully',
                sequences,
            );
        } catch (error) {
            console.error('Error while retrieving sequences:', error);
            return new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
        }
    }

    async deleteSequence(sequenceId: string): Promise<ResponseDto> {
        try {
            const sequenceRef = doc(this.firebaseService.fireStore, 'sequences', sequenceId);

            const sequenceSnapshot = await getDoc(sequenceRef);
            if (!sequenceSnapshot.exists()) {
                return new ResponseDto(
                    'error',
                    404,
                    'SequenceNotFound',
                    {},
                );
            }

            await deleteDoc(sequenceRef);

            return new ResponseDto(
                'success',
                200,
                'SequenceDeletedSuccessfully',
                {},
            );
        } catch (error) {
            console.error('Error while deleting the sequence:', error);
            return new ResponseDto(
                'error',
                400,
                'There was an error with the request, try again.',
                {},
            );
        }
    }


    async executeEntireSequence(sequenceId: string, executePromptDto: ExecutePromptDto): Promise<ResponseDto> {
        console.log('Starting executeEntireSequence with sequenceId:', sequenceId);
        try {
            const sequenceRef = doc(this.firebaseService.fireStore, 'sequences', sequenceId);
            console.log('Retrieving sequence with ID:', sequenceId);
            const sequenceSnapshot = await getDoc(sequenceRef);

            if (!sequenceSnapshot.exists()) {
                console.log('Sequence not found:', sequenceId);
                return new ResponseDto('error', 404, 'ElementNotFound', null);
            }

            const prompts = sequenceSnapshot.data().prompts;
            console.log(`Found ${prompts.length} prompts in sequence ${sequenceId}`);
            const results = {};

            for (let i = 0; i < prompts.length; i++) {
                const prompt = prompts[i];
                const promptId = prompt.id;
                console.log(`Executing prompt ${i + 1} with ID: ${promptId}`);
                if (prompt.type === 'for' && i > 0) {
                    const previousResultContent = results[`prompt${i}`].content;
                    const listString = previousResultContent.split('[').pop().split(']').shift();
                    const list = listString.split(',').map(item => item.trim());

                    const forResults = [];
                    for (const item of list) {
                        executePromptDto.parameters[`PROMPT${i}_RESULT`] = item;
                        const result = await this.executePrompt(promptId, executePromptDto);
                        forResults.push(result.data.result);
                    }
                    results[`prompt${i + 1}`] = forResults;
                }
                else if (prompt.type === 'IF' && i > 0) { 
                    const previousResultContent = results[`prompt${i}`]?.content || '';
                    console.log(`Evaluating IF condition for prompt ${i + 1} with previous result content: ${previousResultContent}`);
                    const regexp = new RegExp(prompt.regexp);

                    console.log(`RegExp to test: ${prompt.regexp}`);
                    if (regexp.test(previousResultContent)) {
                        console.log(`IF condition met for prompt ${i + 1}`);
                        const result = await this.executePrompt(promptId, executePromptDto);
                        const promptKey = `prompt${i + 1}`;
                        results[promptKey] = result.data.result;
                        const resultKey = `PROMPT${i + 1}_RESULT`;
                        if (!executePromptDto.parameters) {
                            executePromptDto.parameters = {};
                        }
                        executePromptDto.parameters[resultKey] = result.data.result.content;
                        console.log(`Result for prompt ${i + 1} stored with key: ${resultKey}`);
                    } else {
                        console.log(`Skipping prompt ${i + 1} due to IF condition not met.`);
                    }
                }

                else {
                    const result = await this.executePrompt(promptId, executePromptDto);
                    const promptKey = `prompt${i + 1}`;
                    results[promptKey] = result.data.result;
                    const resultKey = `PROMPT${i + 1}_RESULT`;
                    if (!executePromptDto.parameters) {
                        executePromptDto.parameters = {};
                    }
                    executePromptDto.parameters[resultKey] = result.data.result.content;

                    console.log(`Result for prompt ${i + 1} stored with key: ${resultKey}`);
                }
            }

            console.log('All prompts executed successfully.');

            const sequenceLogData = {
                sequenceId: sequenceId,
                executionTime: new Date().toISOString(),
                results: results,
            };

            const sequenceLogsRef = collection(this.firebaseService.fireStore, 'sequenceLogs');
            const sequenceLogDocRef = await addDoc(sequenceLogsRef, sequenceLogData);

            await updateDoc(sequenceLogDocRef, { id: sequenceLogDocRef.id });

            console.log('Sequence log created successfully.');

            return new ResponseDto('success', 200, 'AllPromptsExecutedSuccessfully', results);
        } catch (error) {
            console.error('Error executing entire sequence:', error);
            return new ResponseDto('error', 400, `UnableToCompleteOperation: ${error.message}`, null);
        }
    }



    async getSequenceLogs(sequenceId: string, startDate?: string, endDate?: string): Promise<ResponseDto> {
        try {
            console.log('Retrieving logs for sequence:', sequenceId);

            const logsRef = collection(this.firebaseService.fireStore, 'sequenceLogs');
            const logsQuery = query(logsRef, where('sequenceId', '==', sequenceId));
            const querySnapshot = await getDocs(logsQuery);

            if (querySnapshot.empty) {
                console.log('No logs found for sequence:', sequenceId);
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

            console.log('Logs retrieved successfully for sequence:', sequenceId);
            return new ResponseDto(
                'success',
                200,
                'LogsRetrievedSuccessfully',
                logs,
            );
        } catch (error) {
            console.error('Error retrieving sequence logs:', error);
            return new ResponseDto(
                'error',
                400,
                `UnableToCompleteOperation: ${error.message}`,
                null,
            );
        }
    }





}
