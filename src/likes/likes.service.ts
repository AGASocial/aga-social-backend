import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin'


@Injectable()
export class LikesService {
  private firestore: FirebaseFirestore.Firestore;
  constructor(private configService: ConfigService) { 
    this.firestore = admin.firestore(); // obtenemos una instancia de Firestore
  }


  async create(idDomain: string, idElement: string, idUser: string): Promise<void> {
    const elementoRef = this.firestore.collection('likes').doc('elements').collection(idDomain).doc(idElement);
    // utilizamos una transacción para actualizar el contador de likes y agregar un nuevo like
    await this.firestore.runTransaction(async (transaction) => {
       const elementoDoc = await transaction.get(elementoRef);

      if (!elementoDoc.exists) {
        transaction.set(elementoRef, { likesCount: 0 });
      }else {
        const likeDoc = await elementoRef.collection('likes').where('id_user', '==', idUser).where('id_element', '==', idElement).limit(1).get();
        if (!likeDoc.empty) {
          return;
        }
      }
  
    const likesCount = elementoDoc.data()?.likesCount ?? 0;
    const newLikesCount = likesCount + 1;

    const likeDoc = elementoRef.collection('likes').doc();
    transaction.update(elementoRef, { likesCount: newLikesCount });
      transaction.set(likeDoc, { id_user: idUser,id_element:idElement, fecha: admin.firestore.FieldValue.serverTimestamp() });
    });
  }
  async GetLikes(idDomain: string, idElement: string): Promise<any[]> {
    const elementoRef = await this.firestore.collection('likes').doc('elements').collection(idDomain).doc(idElement);
    const elementoDoc = await elementoRef.get();

    if (!elementoDoc.exists) {
      throw new Error('El elemento especificado no existe en el dominio especificado');
    }
  
    const data = elementoDoc.data();
    const likesCount = data?.likesCount ?? 0;
    
    return likesCount;
  }
  async DeleteLike(IdDomain: string, IdElement: string, IdUser: string): Promise<void> {
    const elementoRef = this.firestore.collection('likes').doc('elements').collection(IdDomain).doc(IdElement);

    // utilizamos una transacción para actualizar el contador de likes y quitar un like
    await this.firestore.runTransaction(async (transaction) => {
      const elementoDoc = await transaction.get(elementoRef);

      if (!elementoDoc.exists) {
        throw new Error('El elemento no existe');
      }

      const likesCount = elementoDoc.data().likesCount;
      const newLikesCount = likesCount - 1;

      const likeDocs = await transaction.get(elementoRef.collection('likes').where('id_user', '==', IdUser));

      if (likeDocs.empty) {
        throw new Error('El like no existe');
      }

      const likeId = likeDocs.docs[0].id;
      const likeRef = elementoRef.collection('likes').doc(likeId);

      transaction.update(elementoRef, { likesCount: newLikesCount });
      transaction.delete(likeRef);
    });
  }
  async UserLike(IdDomain: string, idElement: string, idUser: string): Promise<boolean> {
    const likeDocs = await this.firestore.collection('likes').doc('elements').collection(IdDomain).doc(idElement).collection('likes').where('id_user', '==', idUser).get();
    return !likeDocs.empty;
  }
}


 

