import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserDto } from 'src/auth/dto/user.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
    constructor(private readonly db: DatabaseService) { }


    async getUser(id: number) {
        const user = await this.db.user.findFirst({
            where: {
                id: id
            }
        })
        if (!user) {
            throw new BadRequestException("Invalid User");
        }

        return this.transformUserDto(user, {});
    }

    async updateRefreshToken(id: number, refreshToken: string) {
        const user = await this.db.user.update({
            where: {
                id: id
            },
            data: {
                refreshToken: refreshToken
            }
        })
        return user;
    }

    transformUserDto(user: User, tokens: { accessToken?: string, refreshToken?: string }): UserDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }
}
