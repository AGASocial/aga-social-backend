import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ConfigService } from '@nestjs/config';
import { admin } from '../../main';

@Injectable()
export class NotesService {
  constructor(private configService: ConfigService) { }
  create(createNoteDto: CreateNoteDto) {

    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_NOTES')).doc()
        .set({
          url: createNoteDto.url,
          description: createNoteDto.description,
          client_uid: createNoteDto.client_uid
        })
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async findOne(id: string, url: string) {
    try {
      const collection = await admin.firestore().collection(this.configService.get<string>('COLLECTION_NOTES')).where('client_uid', '==', id).where('url', '==', url).get()
      const mainDocs = [];
      collection.forEach(doc => {
        mainDocs.push({ ...doc.data(), _id: doc.id });
      })
      return mainDocs;

    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  remove(id: string) {
    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_NOTES')).doc(id)
        .delete()
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  

}
