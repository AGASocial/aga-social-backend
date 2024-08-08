/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { FirebaseService } from './firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from './authorization/authorization.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './authorization/roles.guard';
import { AuthorizationController } from './authorization/authorization.controller';
import { AbilityModule } from './ability/ability.module';
import { PoliciesGuard } from './authorization/policies.guard';
import { StageGuard } from './authorization/stage.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { throttlerLimit, timeToLive } from './utils/constants';
import { SessionModule } from './session/session.module';
import { RolesModule } from './roles/roles.module';
import { UnauthenticatedMiddleware } from './session/middleware/unauthenticated.middleware';
import { DataFiltererService } from './utils/dataFilterer.service';
import { HashService } from './utils/hash.service';
import { MediaController } from './media/media.controller';
import { MediaModule } from './media/media.module';
import { MediaService } from './media/media.service';
import { EbookService } from './ebooks/ebooks.service';
import { EbookModule } from './ebooks/ebooks.module';
import { EbookController } from './ebooks/ebooks.controller';
import { SectionService } from './sections/sections.service';
import { SectionController } from './sections/sections.controller';
import { CourseService } from './courses/course.service';
import { CourseController } from './courses/course.controller';
import { CourseModule } from './courses/course.module';
import { MessageModule } from './messages/message.module';
import { MessageService } from './messages/message.service';
import { MessageController } from './messages/message.controller';
import { CouponModule } from './coupons/coupon.module';
import { CouponService } from './coupons/coupon.service';
import { CouponController } from './coupons/coupon.controller';
import { VimeoService } from './vimeo/vimeo.service';
import { TagsModule } from './tags/tags.module';
import { TagsService } from './tags/tags.service';
import { TagsController } from './tags/tags.controller';
import { LikesModule } from './Pluggins/likes/likes.module';
import { NotesModule } from './Pluggins/notes/notes.module';
import { PlugginModule } from './Pluggins/pluggin/pluggin.module';
import { StripeModule } from './Pluggins/stripe/stripe.module';
import { LikesService } from './Pluggins/likes/likes.service';
import { NotesService } from './Pluggins/notes/notes.service';
import { PlugginService } from './Pluggins/pluggin/pluggin.service';
import { StripeService } from './Pluggins/stripe/stripe.service';
import { TodoService } from './Pluggins/todo/todo.service';
import { JwtModule } from '@nestjs/jwt';
import { LikesController } from './Pluggins/likes/likes.controller';
import { NotesController } from './Pluggins/notes/notes.controller';
import { PlugginController } from './Pluggins/pluggin/pluggin.controller';
import { StripeController } from './Pluggins/stripe/stripe.controller';
import { TodoController } from './Pluggins/todo/todo.controller';
import { ValidationController } from './validations/validations.controller';
import { TodoModule } from './Pluggins/todo/todo.module';
import { EmailsModule } from './Pluggins/emails/pluginEmails.module';
import { EmailsController } from './Pluggins/emails/pluginsEmails.controller';
import { EmailsService } from './Pluggins/emails/pluginEmails.service';
import { PluginUsersModule } from './Pluggins/users/pluginsUsers.module';
import { PluginUsersController } from './Pluggins/users/pluginUsers.controller';
import { PluginUsersService } from './Pluggins/users/pluginsUsers.service';
import { PluginCollectionsModule } from './Pluggins/collections/plugincollections.module';
import { PluginCollectionsService } from './Pluggins/collections/plugincollections.service';
import { PluginCollectionsController } from './Pluggins/collections/plugincollections.controller';
import { AiModule } from './ai/ai.module';
import { AiController } from './ai/ai.controller';
import { AiService } from './ai/ai.service';
import { OpenAiService } from './ai/openai/openai.service';
import { AuthGuard } from '@nestjs/passport'; 

@Module({
    imports: [AiModule, PluginCollectionsModule, PluginUsersModule, EmailsModule, TagsModule, CouponModule, MessageModule, CourseModule, EbookModule, UsersModule, AuthModule, MediaModule, LikesModule, NotesModule, PlugginModule, StripeModule, TodoModule, ConfigModule.forRoot(), AuthorizationModule, AbilityModule, ThrottlerModule.forRoot({
        ttl: timeToLive,
        limit: throttlerLimit
    }), SessionModule, RolesModule, JwtModule.register({
        secret: process.env.jwtConstants,
        signOptions: { expiresIn: '60s' }
    })],
    controllers: [AiController, PluginCollectionsController, PluginUsersController, EmailsController, ValidationController, TagsController, AppController, AuthController, AuthorizationController, MediaController, EbookController, SectionController, CourseController, MessageController, CouponController, LikesController, NotesController, PlugginController, StripeController, TodoController],
    providers: [
        AppService,
        DataFiltererService,
        StageGuard,
        PoliciesGuard,
        FirebaseService,
        HashService,
        MediaService,
        EbookService,
        SectionService,
        CourseService,
        MessageService,
        CouponService,
        VimeoService,
        TagsService,
        LikesService,
        NotesService,
        PlugginService,
        StripeService,
        TodoService,
        EmailsService,
        PluginUsersService,
        PluginCollectionsService,
        AiService,
        OpenAiService,
        
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
       
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule  {

}