import { BadRequestException, Injectable } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { addDoc, collection, doc, DocumentReference, getDocs, query, where } from "firebase/firestore";
import { FirebaseService } from "../../firebase/firebase.service";
import { HashService } from "../../utils/hash.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { CreateUserResponseDto } from "./dto/createUserResponse.dto";
import { v4 as uuidv4 } from 'uuid';
import { GetUsersByPluginIdResponseDto } from "./dto/getUsersResponse.dto";









@Injectable()
export class PluginUsersService {
    constructor(private firebaseService: FirebaseService, private hashService: HashService) { }

    @ApiCreatedResponse({
        description: 'The user has been registered successfully.',
        type: CreateUserResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Error registering the user.' })
    @ApiOperation({ summary: 'Register a new user' })
    async registerUser(createUserDto: CreateUserDto, pluginId: string): Promise<CreateUserResponseDto> {
        try {
            const { email, username, password, name } = createUserDto;

            const emailQuery = query(
                collection(this.firebaseService.fireStore, 'newPlugins', pluginId, 'pluginUsers'),
                where('email', '==', email)
            );
            const emailQuerySnapshot = await getDocs(emailQuery);

            const usernameQuery = query(
                collection(this.firebaseService.fireStore, 'newPlugins', pluginId, 'pluginUsers'),
                where('username', '==', username)
            );
            const usernameQuerySnapshot = await getDocs(usernameQuery);

            if (!emailQuerySnapshot.empty) {
                throw new BadRequestException('Email already exists');
            }

            if (!usernameQuerySnapshot.empty) {
                throw new BadRequestException('Username already exists');
            }

            const hashedPassword = await this.hashService.hashString(password);
            createUserDto.password = hashedPassword;

            const userId = uuidv4();

            const pluginDocumentRef: DocumentReference = doc(this.firebaseService.fireStore, 'newPlugins', pluginId);
            const usersCollectionRef = collection(pluginDocumentRef, 'pluginUsers');

            await addDoc(usersCollectionRef, { email, username, hashedPassword, name, userId });

            return new CreateUserResponseDto(201, 'USERREGISTEREDSUCCESSFULLY', userId);
        } catch (error) {
            console.error('Error registering the user:', error);
            throw new BadRequestException(`Error registering the user: ${error.message}`);
        }
    }





    @ApiOperation({ summary: 'Retrieve users by plugin ID' })
    @ApiOkResponse({
        description: 'Users retrieved successfully.',
        type: GetUsersByPluginIdResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Error fetching users.' })
    async getUsersByPluginId(pluginId: string): Promise<GetUsersByPluginIdResponseDto> {
        try {
            const pluginDocumentRef = doc(this.firebaseService.fireStore, 'newPlugins', pluginId);
            const usersCollectionRef = collection(pluginDocumentRef, 'pluginUsers');
            const querySnapshot = await getDocs(usersCollectionRef);

            const users: Record<string, any>[] = [];

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const { hashedPassword, ...userWithoutPassword } = userData;
                users.push(userWithoutPassword);
            });

            const responseDto = new GetUsersByPluginIdResponseDto(
                200,
                'USERSRETRIEVEDSUCCESSFULLY',
                users,
            );

            return responseDto;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new BadRequestException(`Error fetching users: ${error.message}`);
        }
    }












}




