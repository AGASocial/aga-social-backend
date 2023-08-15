import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { saltOrRoundsNumber } from "./constants";

//Hash service using bcrypt
@Injectable()
export class HashService {
    constructor() { }

    //Hashes a string, commonly a password
    async hashString(stringToHash: string) {
        try {
            const saltOrRounds = await bcrypt.genSalt(saltOrRoundsNumber);
            return await bcrypt.hash(stringToHash, saltOrRounds);
        } catch (error) {
            // If an error occurs, returns a message that says "HASHFAILED"
            return "HASHFAILED";
        }
    }
    //Compares 2 strings, one is unhashed, the other is hashed
    async compareHashedStrings(stringUnhashed: string, hashedString: string) {
        try {
            return await bcrypt.compare(stringUnhashed, hashedString);
        } catch (error) {
            // If an error occurs, returns a message that says "COMPARISONFAILED"
            return "COMPARISONFAILED";
        }
    }
}