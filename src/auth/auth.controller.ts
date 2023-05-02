import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "./dto";
import { UserDto } from "./dto/user.dto";
import { RefreshTokenDto } from "./dto/refreshToken.dto";
import { Public } from "src/common/decorators/public.decorator";
import { RefreshTokenGuard } from "src/common/guards/refreshToken.guard";

@Controller({})
export class AuthController {
    constructor(private readonly service: AuthService) { }

    @Public()
    @Post('register')
    register(@Body() dto: RegisterDto): Promise<UserDto> {
        return this.service.register(dto);
    }

    @Public()
    @Post('login')
    login(@Body() dto: LoginDto): Promise<UserDto> {
        return this.service.login(dto);
    }

    @Get('logout/:id')
    logout(@Param('id', ParseIntPipe) id: number) {
        return this.service.logout(id);
    }

    @Post('refresh/:id/token')
    refreshToken(@Body() dto: RefreshTokenDto, @Param('id', ParseIntPipe) id: number): Promise<UserDto> {
        return this.service.refreshToken(id, dto.refreshToken);
    }
}