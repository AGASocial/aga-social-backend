import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlugginModule } from './pluggin/pluggin.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { StripeModule } from './stripe/stripe.module';
import { NotesModule } from './notes/notes.module';
import { TodoModule } from './todo/todo.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [PlugginModule, UsersModule, StripeModule, NotesModule, TodoModule, LikesModule],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule { }
