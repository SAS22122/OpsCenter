import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req) {
        return this.usersService.findById(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/preferences')
    async updatePreferences(@Request() req, @Body() body: any) {
        return this.usersService.updatePreferences(req.user.id, body);
    }
}
