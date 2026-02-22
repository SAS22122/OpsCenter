import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { Incident } from '../entities/incident.entity';

import { AiModule } from '../ai/ai.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Incident]),
        AiModule
    ],
    controllers: [IngestController],
    providers: [IngestService],
})
export class IngestModule { }
