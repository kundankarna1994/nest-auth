import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';
import { validate } from './env.validation';
import { UserController } from './user/user.controller';
import jwtConfig from './config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './common/guards/accessToken.guard';

@Module({
  imports: [AuthModule, UserModule, BookmarkModule, DatabaseModule, ConfigModule.forRoot({
    isGlobal: true,
    load: [databaseConfig, jwtConfig],
    validate
  })],
  controllers: [UserController],
  providers: [{
    provide: APP_GUARD,
    useClass: AccessTokenGuard
  }],
})
export class AppModule { }
