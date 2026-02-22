import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService, SqlSource } from './config.service';

@Controller('config')
export class ConfigController {
    constructor(private readonly configService: ConfigService) { }

    @Get('sources')
    getSources() {
        return this.configService.getSources();
    }

    @Post('sources')
    addSource(@Body() sourceData: Omit<SqlSource, 'id'>) {
        return this.configService.addSource(sourceData);
    }

    @Delete('sources/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteSource(@Param('id') id: string) {
        this.configService.deleteSource(id);
    }

    @Get('manual-sync')
    manualSync() {
        return []; // No actual DB scraping implemented in NestJS yet
    }

    @Post('reset')
    @HttpCode(HttpStatus.OK)
    reset() {
        this.configService.resetSources();
        return { message: 'Reset OK' };
    }
}
