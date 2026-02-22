import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];
        const validApiKey = this.configService.get<string>('API_KEY');

        if (!validApiKey) {
            console.warn("⚠️ API_KEY is not configured in environment! Blocking all requests by default for safety.");
            return false;
        }

        if (apiKey && apiKey === validApiKey) {
            return true;
        }

        throw new UnauthorizedException('Invalid or missing API Key');
    }
}
