import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '../../firebase/firebase.service';

@Module({
    imports: [ConfigModule],
  controllers: [TodoController],
    providers: [FirebaseService, TodoService]
})
export class TodoModule {}
