import { registerAs } from "@nestjs/config";

export default registerAs('jwt', () => ({
    accessToken: process.env.JWT_ACCESS_TOKEN,
    refreshToken: process.env.JWT_REFRESH_TOKEN
}));