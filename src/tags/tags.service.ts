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



  
    async createNewTag(createTagDto: CreateTagDto): Promise<CreateTagResponseDto> {
        const { name, username } = createTagDto;

        const userRef = collection(this.firebaseService.fireStore, 'users');
        const userQuery = query(userRef, where('username', '==', username));
        const userQuerySnapshot = await getDocs(userQuery);

        if (userQuerySnapshot.empty) {
            console.log('USERNAME_DOES_NOT_EXISTS');
            return new CreateTagResponseDto('error', 404, 'Username not found', {});
        }

        const tagRef = collection(this.firebaseService.fireStore, 'tags');
        const tagQuery = query(tagRef, where('name', '==', name), where('username', '==', username));
        const tagQuerySnapshot = await getDocs(tagQuery);

        if (!tagQuerySnapshot.empty) {
            console.log('TAG_ALREADY_EXISTS');
            return new CreateTagResponseDto('error', 400, 'Tag already exists with thst name for this user', {});
        }

        const newTag: Tags = {
            name,
            username,
            active: true,
        };

        const newTagRef = await addDoc(tagRef, newTag);

        const newTagId: string = newTagRef.id;

        await updateDoc(newTagRef, { id: newTagId });

        const cachedTags = await this.firebaseService.getCollectionData('tags');
        cachedTags.push({
            id: newTagId,
            name,
            username,
            active: true,
        });
        this.firebaseService.setCollectionData('tags', cachedTags);
        console.log('Tag added to the cache successfully.');

        return new CreateTagResponseDto('success', 201, 'Tag created successfully.', { result: { id: newTagId } });
    }




    async updateTag(id: string, newData: Partial<UpdateTagDto>): Promise<UpdateTagResponseDto> {
        try {
            console.log(newData);
            console.log('Initializing updateTag...');
            const tagCollectionRef = admin.firestore().collection('tags');

            const querySnapshot = await tagCollectionRef.where('id', '==', id).get();

            if (querySnapshot.empty) {
                console.log(`The tag with the id "${id}" does not exist.`);
                return new UpdateTagResponseDto('error', 404, 'Tag does not exist.', {});
            }

            const batch = admin.firestore().batch();
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, newData);
            });

            await batch.commit();
            console.log(`Updated info for tag with id "${id}"`);

            return new UpdateTagResponseDto('success', 200, 'Tag updated successfully.', {});
        } catch (error) {
            console.error('There was an error updating the tag data:', error);
            return new UpdateTagResponseDto('error', 400, 'The tag could not be updated.', {});
        }
    }



   
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
                return new GetTagsResponseDto('error', 404, 'User not found.', {});
            }

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

            return new GetTagsResponseDto('success', 200, 'Tags retrieved successfully.', { result: activeTags });
        } catch (error) {
            console.error('An error occurred:', error);
            return new GetTagsResponseDto('error', 400, `Error retrieving tags: ${error.message}`, {});
        }
    }





}
