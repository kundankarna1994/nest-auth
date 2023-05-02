import { BadRequestException, Injectable, UseGuards } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { LoginDto, RegisterDto } from "./dto";
import * as argon from "argon2";
import { UserDto } from "./dto/user.dto";
import { JwtDto } from "./dto/jwt.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
import { RefreshTokenGuard } from "src/common/guards/refreshToken.guard";

@Injectable({})
export class AuthService {
    constructor(private readonly db: DatabaseService, private readonly jwt: JwtService, private readonly config: ConfigService, private readonly userService: UserService) { }

    async register(dto: RegisterDto): Promise<UserDto> {
        //check for duplicate user
        const duplicateUser = await this.db.user.findUnique({
            where: {
                email: dto.email,
            },
        })
        if (duplicateUser) {
            // if found throw exception
            throw new BadRequestException("Email is already registered")
        }
        dto.password = await argon.hash(dto.password);
        const user = await this.db.user.create({
            data: dto,
        })
        const tokens = await this.getToken({
            sub: user.id,
            name: user.name,
            email: user.email
        });
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return this.userService.transformUserDto(user, tokens);
    }

    async login(dto: LoginDto): Promise<UserDto> {
        const user = await this.db.user.findUnique({
            where: {
                email: dto.email,
            },
        })
        if (!user) {
            throw new BadRequestException("Invalid Credentials");
        }

        const matchPassword = await argon.verify(user.password, dto.password);
        if (!matchPassword) {
            throw new BadRequestException("Invalid Credentials");
        }
        const tokens = await this.getToken({
            sub: user.id,
            name: user.name,
            email: user.email
        });
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return this.userService.transformUserDto(user, tokens);
    }

    async logout(id: number) {
        const user = await this.db.user.findUnique({
            where: {
                id: id,
            },
        })
        if (!user) {
            throw new BadRequestException("User not found");
        }
        await this.userService.updateRefreshToken(user.id, null);
        return {
            message: "Successfully logged out"
        }
    }

    @UseGuards(RefreshTokenGuard)
    async refreshToken(id: number, refreshToken: string) {
        const user = await this.db.user.findUnique({
            where: {
                id: id,
            },
        })
        if (!user) {
            throw new BadRequestException("User not found");
        }

        const refreshTokenMatches = await argon.verify(user.refreshToken, refreshToken);
        if (!refreshTokenMatches) {
            throw new BadRequestException("Refresh Token Invalid");
        }
        const tokens = await this.getToken({
            sub: user.id,
            name: user.name,
            email: user.email
        });
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return this.userService.transformUserDto(user, tokens);
    }

    async updateRefreshToken(id: number, refreshToken: string) {
        const hashedRefreshToken = await argon.hash(refreshToken);
        await this.userService.updateRefreshToken(id, hashedRefreshToken);
    }

    async getToken(payload: JwtDto) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get("jwt.accessToken"),
                expiresIn: "15m"
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get("jwt.refreshToken"),
                expiresIn: "7d"
            })
        ])
        return {
            accessToken, refreshToken
        }
    }
}