import { BadRequestException, Injectable } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { FirebaseService } from "../firebase/firebase.service";
import { CreateTagDto } from "./dto/createTag.dto";
import { CreateTagResponseDto } from "./dto/createTagResponse.dto";
import { Tags } from "./entities/tags.entity";
import { v4 as uuidv4 } from 'uuid';
import { UpdateTagResponseDto } from "./dto/updateTagResponse.dto";
import { UpdateTagDto } from "./dto/updateTag.dto";
import { DocResult } from "../utils/docResult.entity";
import { GetTagsResponseDto } from "./dto/getTags.dto";
import * as admin from 'firebase-admin';






@Injectable()
export class TagsService {

    constructor(private firebaseService: FirebaseService) { }



    @ApiOperation({ summary: 'Create a new tag and register it on Firestore using a DTO with its basic data' })
    @ApiBadRequestResponse({ description: 'Tag with the same name and username already exists' })
    @ApiCreatedResponse({
        description: 'The tag has been successfully created.',
        type: CreateTagResponseDto,
    })
    async createNewTag(createTagDto: CreateTagDto): Promise<CreateTagResponseDto> {
        const { name, username } = createTagDto;


        const userRef = collection(this.firebaseService.fireStore, 'users');
        const userQuery = query(userRef, where('username', '==', username));
        const userQuerySnapshot = await getDocs(userQuery);

        if (userQuerySnapshot.empty) {
            console.log('USERNAME_DOES_NOT_EXISTS');
            return { statusCode: 400, message: 'USERNAME_DOES_NOT_EXISTS' };
        }



        const tagRef = collection(this.firebaseService.fireStore, 'tags');
        const tagQuery = query(tagRef, where('name', '==', name), where('username', '==', username));
        const tagQuerySnapshot = await getDocs(tagQuery);

        if (!tagQuerySnapshot.empty) {
            throw new BadRequestException('TAG_ALREADY_EXISTS');
        }

        const newTagId: string = uuidv4();


        const newTag: Tags = {
            id: newTagId,
            name,
            username,
            active: true,
        };

        await addDoc(tagRef, newTag);


        //Add Tag to the cache
        const cachedTags = await this.firebaseService.getCollectionData('tags');
        cachedTags.push({
            id: newTagId,
            name,
            username,
            active: true,

        });
        this.firebaseService.setCollectionData('tags', cachedTags);
        console.log('Tag added to the cache successfully.');

        const responseDto = new CreateTagResponseDto(201, 'TAGCREATEDSUCCESSFULLY', newTagId);
        return responseDto;
    }




   @ApiOperation({ summary: 'Update tag information by id' })
@ApiOkResponse({
    description: 'Tag information has been successfully updated on Firestore.',
    type: UpdateTagResponseDto,
})
@ApiBadRequestResponse({ description: 'Tag with the given id does not exist' })
async updateTag(id: string, newData: Partial<UpdateTagDto>): Promise<UpdateTagResponseDto> {
       try {
        console.log(newData)
        console.log('Initializing updateTag...');
        const tagCollectionRef = admin.firestore().collection('tags');

        const querySnapshot = await tagCollectionRef.where('id', '==', id).get();

        if (querySnapshot.empty) {
            console.log(`The tag with the id "${id}" does not exist.`);
            const response: UpdateTagResponseDto = {
                statusCode: 404,
                message: 'TAG DOES NOT EXIST',
            };

            return response;        }

        const batch = admin.firestore().batch();
        querySnapshot.forEach((doc) => {
            batch.update(doc.ref, newData);
        });

        await batch.commit();
        console.log(`Updated info for tag with id "${id}"`);

        const response: UpdateTagResponseDto = {
            statusCode: 200,
            message: 'TAGUPDATEDSUCCESSFULLY',
        };

        return response;
    } catch (error) {
        console.error('There was an error updating the tag data:', error);
        throw error;
    }
}




    @ApiOperation({ summary: 'Get tags associated with a user' })
    @ApiOkResponse({ description: 'Tags retrieved successfully', type: GetTagsResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async getTagsById(userId: string): Promise<GetTagsResponseDto> {
        try {
            console.log('Initializing getTagsByUsername...');

            const userRef = this.firebaseService.usersCollection;
            const userQuery = query(userRef, where('id', '==', userId));
            const userQuerySnapshot = await getDocs(userQuery);

            let username: string | undefined;
            userQuerySnapshot.forEach((doc) => {
                const userData = doc.data();
                username = userData.username;
            });

            if (!username) {
                const responseDto: GetTagsResponseDto = {
                    statusCode: 404,
                    message: 'USER NOT FOUND',
                    tagsFound: null,
                };
                console.log('Response created.');

                return responseDto;            }

            // If there is no data in cache, query Firestore
            const tagRef = this.firebaseService.tagsCollection;
            const tagQuery = query(tagRef, where('username', '==', username));
            console.log('Tags query created.');

            const tagQuerySnapshot = await getDocs(tagQuery);
            console.log('Tags query snapshot obtained.');

            const activeTags = [];
            tagQuerySnapshot.forEach((doc) => {
                const tagData = doc.data();
                if (tagData.active) {
                    activeTags.push({
                        id: doc.id,
                        name: tagData.name,
                        active: tagData.active,
                    });
                }
            });
            console.log('Active tags collected.');

            const responseDto: GetTagsResponseDto = {
                statusCode: 200,
                message: 'TAGSRETRIEVEDSUCCESSFULLY',
                tagsFound: activeTags,
            };
            console.log('Response created.');

            return responseDto;
        } catch (error) {
            console.error('An error occurred:', error);
            throw new Error(`Error retrieving tags: ${error.message}`);
        }
    }







}
