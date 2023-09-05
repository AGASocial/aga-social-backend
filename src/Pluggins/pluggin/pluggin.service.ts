import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePlugginDto } from './dto/create-pluggin.dto';
import { UpdatePlugginDto } from './dto/update-pluggin.dto';
import { ConfigService } from '@nestjs/config';
import { FindOnePlugginDTO } from './dto/find-one-pluggin.dto';
import { FindPluginPayDTO } from './dto/Find-plugin-pay.dto';
import { admin } from '../../main';


@Injectable()
export class PlugginService {
  constructor(private configService: ConfigService) {

  }
  create(createPlugginDto: CreatePlugginDto) {
    const { name, description, monthly_price, yearly_price, active } = createPlugginDto;

    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_PLUGIN')).doc()
        .set({
          name: name,
          description: description,
          monthly_price: monthly_price,
          yearly_price: yearly_price,
          active: active
        })
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async findAll() {
    try {
      const collection = await admin.firestore().collection(this.configService.get<string>('COLLECTION_PLUGIN')).get();
      const mainDocs = [];
      collection.forEach(doc => {
        mainDocs.push({ ...doc.data(), _id: doc.id });
      })
      return mainDocs;

    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
    async findAllForSell() {
    try {
      const collection = await admin.firestore().collection(this.configService.get<string>('COLLECTION_PLUGIN')).where('active', '==', true).get();
      const mainDocs = [];
      collection.forEach(doc => {
        mainDocs.push({ ...doc.data(), _id: doc.id });
      })
      return mainDocs;

    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async findOne(uid: string) {
    try {
      const collection = await admin.firestore().collection(this.configService.get<string>('COLLECTION_PLUGIN')).doc(uid).get().then(querySnapshot => {
        return querySnapshot.data()
      })
      return collection
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }





  update(uid: string, updatePlugginDto: UpdatePlugginDto) {
    const {name, description, monthly_price, yearly_price, active } = updatePlugginDto;

    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_PLUGIN')).doc(uid)
        .update({
          name: name,
          description: description,
          monthly_price: monthly_price,
          yearly_price: yearly_price,
          active: active
        })
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
  deactivate(uid: string) {

    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_PLUGIN')).doc(uid)
        .update({
          active: false
        })
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
  activate(uid: string) {

    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_PLUGIN')).doc(uid)
        .update({
          active: true
        })
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  remove(uid: string) {

    try {
      return admin.firestore().collection(this.configService.get<string>('COLLECTION_PLUGIN')).doc(uid)
        .delete()
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
  
  async Install(token: string, url: string) {
    try {
      const collection = await admin.firestore().collection(this.configService.get<string>('COLLECTION_COMPANYPLUGIN')).where('token_id', '==', token).where('allowed_domain', '==', url).get();
      if (collection.empty) {
        console.log('No such token!');
        throw new UnauthorizedException('No such token!');
      }
      const mainDocs = [];
      collection.forEach(doc => {
        mainDocs.push({ ...doc.data(), _id: doc.id });
      });
      for (const doc of mainDocs) {
        var f1 = new Date().toJSON();
        doc.expiration_date
        if (f1 < doc.expiration_date) {
          return mainDocs;
        }
        else {
          throw new UnauthorizedException('Token Unauthorized!');
        }
      }

    }
    catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
