import { Controller, Post, Body, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { IncidentStatus } from '../entities/incident.entity';

@Controller()
export class IngestController {
    constructor(private readonly ingestService: IngestService) { }

    @Post('ingest')
    @UseGuards(ApiKeyGuard)
    async ingest(@Body() payload: CreateIncidentDto) {
        return this.ingestService.processLog(payload);
    }

    @Post('ingest/:id/status') // Using POST for simplicity or PATCH
    @UseGuards(ApiKeyGuard)
    async updateStatus(@Body() body: { status: string }, @Param('id') id: string) {
        return this.ingestService.updateStatus(id, body.status as IncidentStatus);
    }

    @Get('incidents')
    async findAll() {
        return this.ingestService.findAll();
    }

    @Delete('ingest')
    @UseGuards(ApiKeyGuard)
    async deleteAll() {
        return this.ingestService.deleteAll();
    }
}
