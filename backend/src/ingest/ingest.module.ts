import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { Incident } from '../entities/incident.entity';

import { AiModule } from '../ai/ai.module';
import { SourceCodeModule } from '../source-code/source-code.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Incident]),
        AiModule,
        SourceCodeModule
    ],
    controllers: [IngestController],
    providers: [IngestService],
    exports: [IngestService]
})
export class IngestModule { }
