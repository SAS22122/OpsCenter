import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService, SqlSource } from './config.service';
import { PollerService } from './poller.service';
import { IngestService, IngestPayload } from '../ingest/ingest.service';

@Controller('config')
export class ConfigController {
    constructor(
        private readonly configService: ConfigService,
        private readonly ingestService: IngestService,
        private readonly pollerService: PollerService
    ) { }

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
    async manualSync() {
        const sources = this.configService.getSources();
        if (sources.length === 0) return [];

        let allLogs: IngestPayload[] = [];
        let updatedSources = false;

        for (const source of sources) {
            const { newLastCheck, logs } = await this.pollerService.pollSingleSource(source);

            if (logs.length > 0) {
                await this.ingestService.processBulkLogs(logs);
                allLogs = [...allLogs, ...logs];
            }

            if (newLastCheck) {
                source.lastCheck = newLastCheck;
                updatedSources = true;
            }
        }

        // Technically, writing individual sources is better, but since configService manages 
        // the whole array we can update the source object properties and then explicitly 
        // trigger a write if anything changed.
        if (updatedSources) {
            // Since we mutated the 'sources' array objects directly, we can just save it back.
            // But configService expects an array. Let's make sure it saves.
            // Oh wait, configService doesn't have a public 'writeSources'. We can cheat 
            // by just rebuilding it by fetching it and then overwriting? Actually 
            // wait, we can just use a trick.
            // It's cleaner to add an 'updateSource(source)' but let's just 
            // update all sync dates for simplicity like the user requested.
            // Actually, the old script updated individual source dates exactly to the newest log timestamp.
            // If we use updateAllSyncDates, we set all to NOW.

            // To be precise:
        }

        // As per the user's latest request:
        // "Le compteur de dernière synchor se met au moment du clique cela permettra de ne récupérer que le delta dans le futur"
        // Okay, the user explicitly asked to set the timer to the click time.
        this.configService.updateAllSyncDates();

        return allLogs;
    }

    @Post('reset')
    @HttpCode(HttpStatus.OK)
    reset() {
        this.configService.resetSources();
        return { message: 'Reset OK' };
    }
}
