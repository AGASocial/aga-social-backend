import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { FirebaseService } from "../../firebase/firebase.service";
import { AddJsonSectionsResponseDto } from "./dto/addJsonSectionsResponse.dto";
import { CreateJsonResponseDto } from "./dto/createJsonResponse.dto";
import { DeleteJsonSectionsResponseDto } from "./dto/deleteJsonSectionsResponse.dto";
import { GetJsonByIdResponseDto } from "./dto/getCompleteJsonByIdResponse.dto";
import { UpdateJsonResponseDto } from "./dto/updateJsonResponse.dto";




@Injectable()
export class PluginCollectionsService {
    constructor(private firebaseService: FirebaseService) { }






    @ApiOperation({ summary: 'Register JSON data' })
    @ApiCreatedResponse({
        description: 'JSON data registered successfully.',
        type: CreateJsonResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Error registering JSON data.' })
    async registerJson(pluginId: string, username: string, jsonData: any): Promise<CreateJsonResponseDto> {
        try {
            const usernameQuery = query(
                collection(this.firebaseService.fireStore, 'newPlugins', pluginId, 'pluginUsers'),
                where('username', '==', username)
            );
            const usernameQuerySnapshot = await getDocs(usernameQuery);

            if (usernameQuerySnapshot.empty) {
                throw new BadRequestException('Username does not exist');
            }

            const hasDuplicateTopLevelKeys = (obj: any) => {
                const keys = new Set<string>();
                for (const key in obj) {
                    if (keys.has(key)) {
                        return true;
                    }
                    keys.add(key);
                }
                return false;
            };

            if (hasDuplicateTopLevelKeys(jsonData)) {
                throw new BadRequestException('Duplicate top-level section names are not allowed');
            }

            const jsonWithUploader = { data: jsonData, uploaderUsername: username };

            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );
            const newJsonDocRef = await addDoc(userJsonsCollectionRef, jsonWithUploader);

            console.log(`JSON registered with ID: ${newJsonDocRef.id}`);

            return new CreateJsonResponseDto(201, 'JSONREGISTEREDSUCCESSFULLY', newJsonDocRef.id);
        } catch (error) {
            console.error('Error registering JSON:', error);
            throw new BadRequestException(`Error registering JSON: ${error.message}`);
        }
    }





    @ApiOperation({ summary: 'Retrieve JSON data by ID' })
    @ApiOkResponse({
        description: 'JSON data retrieved successfully.',
        type: GetJsonByIdResponseDto,
    })
    @ApiNotFoundResponse({ description: 'JSON not found.' })
    async getJsonById(pluginId: string, jsonId: string): Promise<GetJsonByIdResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data();
                return new GetJsonByIdResponseDto(200, 'JSONRETRIEVEDSUCCESSFULLY', jsonData);
            } else {
                throw new NotFoundException('JSON not found');
            }
        } catch (error) {
            console.error('Error getting JSON:', error);
            throw new NotFoundException(`Error getting JSON: ${error.message}`);
        }
    }







    @ApiOperation({ summary: 'Retrieve a specific JSON section by ID and name' })
    @ApiOkResponse({
        description: 'JSON section retrieved successfully.',
        type: GetJsonByIdResponseDto,
    })
    @ApiNotFoundResponse({ description: 'JSON section or JSON not found.' })
    async getJsonSectionById(pluginId: string, jsonId: string, sectionName: string): Promise<GetJsonByIdResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data()?.data;

                if (jsonData) {
                    const lowerSectionName = sectionName.toLowerCase();
                    const jsonDataLower = Object.keys(jsonData).reduce((acc, key) => {
                        acc[key.toLowerCase()] = jsonData[key];
                        return acc;
                    }, {});

                    if (jsonDataLower[lowerSectionName]) {
                        const sectionData = jsonDataLower[lowerSectionName];

                        const responsePayload = {
                            [lowerSectionName]: sectionData,
                        };

                        const response = new GetJsonByIdResponseDto(200, 'JSONRETRIEVEDSUCCESSFULLY', responsePayload);

                        return response;
                    }
                }
            }

            throw new NotFoundException(`Section '${sectionName}' not found in JSON`);
        } catch (error) {
            console.error(`Error getting section '${sectionName}':`, error);
            throw new NotFoundException(`Error getting section '${sectionName}': ${error.message}`);
        }
    }






    @ApiOperation({ summary: 'Add new sections to an existing JSON data' })
    @ApiCreatedResponse({
        description: 'Sections added successfully.',
        type: AddJsonSectionsResponseDto,
    })
    @ApiNotFoundResponse({ description: 'JSON not found.' })
    @ApiConflictResponse({ description: 'One or more sections have names that already exist.' })
    async addJsonSections(pluginId: string, jsonId: string, newSections: any): Promise<AddJsonSectionsResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data()?.data;

                if (jsonData) {
                    const existingSectionNames = Object.keys(jsonData);
                    const newSectionNames = Object.keys(newSections);

                    const intersection = existingSectionNames.filter(name => newSectionNames.includes(name));

                    if (intersection.length === 0) {
                        const updatedData = { ...jsonData, ...newSections };

                        await updateDoc(jsonDocRef, { data: updatedData });

                        return new AddJsonSectionsResponseDto(201, 'SECTIONSADDEDSUCCESSFULLY');
                    } else {
                        throw new Error('One or more sections have names that already exist.');
                    }
                }
            }

            throw new NotFoundException(`JSON with ID '${jsonId}' not found.`);
        } catch (error) {
            console.error('Error adding JSON sections:', error);
            throw error;
        }
    }





    @ApiOperation({ summary: 'Delete a specific JSON section by ID and name' })
    @ApiOkResponse({
        description: 'JSON section deleted successfully.',
        type: DeleteJsonSectionsResponseDto,
    })
    @ApiNotFoundResponse({ description: 'JSON section or JSON not found.' })
    async deleteJsonSectionById(pluginId: string, jsonId: string, sectionName: string): Promise<DeleteJsonSectionsResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data()?.data;

                if (jsonData && jsonData[sectionName]) {
                    delete jsonData[sectionName];

                    await updateDoc(jsonDocRef, { data: jsonData });

                    return new DeleteJsonSectionsResponseDto(200, 'SECTIONSDELETEDSUCCESSFULLY');
                } else {
                    throw new NotFoundException(`Section '${sectionName}' not found in JSON`);
                }
            }

            throw new NotFoundException(`JSON with ID '${jsonId}' not found.`);
        } catch (error) {
            console.error(`Error deleting section '${sectionName}':`, error);
            throw error;
        }
    }





    @ApiOperation({ summary: 'Delete a specific JSON section by ID and name' })
    @ApiOkResponse({
        description: 'JSON section deleted successfully.',
        type: DeleteJsonSectionsResponseDto,
    })
    @ApiNotFoundResponse({ description: 'JSON section or JSON not found.' })
    async updateJsonSection(pluginId: string, jsonId: string, sectionName: string, updatedData: any): Promise<UpdateJsonResponseDto> {
        try {
            const userJsonsCollectionRef = collection(
                this.firebaseService.fireStore,
                'newPlugins',
                pluginId,
                'usersJsons'
            );

            const jsonDocRef = doc(userJsonsCollectionRef, jsonId);
            const jsonDocSnapshot = await getDoc(jsonDocRef);

            if (jsonDocSnapshot.exists()) {
                const jsonData = jsonDocSnapshot.data()?.data;

                if (jsonData) {
                    const lowerSectionName = sectionName.toLowerCase();
                    const jsonDataLower = Object.keys(jsonData).reduce((acc, key) => {
                        acc[key.toLowerCase()] = jsonData[key];
                        return acc;
                    }, {});

                    if (jsonDataLower[lowerSectionName]) {
                        jsonDataLower[lowerSectionName] = updatedData[lowerSectionName];

                        await setDoc(jsonDocRef, { data: jsonDataLower }, { merge: true });

                        const responsePayload = {
                            [lowerSectionName]: jsonDataLower[lowerSectionName],
                        };

                        const response = new UpdateJsonResponseDto(200, 'JSONUPDATEDSUCCESSFULLY', responsePayload);

                        return response;
                    }
                }
            }

            throw new NotFoundException(`Section '${sectionName}' not found in JSON`);
        } catch (error) {
            console.error(`Error updating section '${sectionName}':`, error);
            throw new NotFoundException(`Error updating section '${sectionName}': ${error.message}`);
        }
    }


}