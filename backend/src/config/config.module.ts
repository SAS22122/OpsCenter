import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { PollerService } from './poller.service';
import { IngestModule } from '../ingest/ingest.module';

@Module({
    imports: [IngestModule],
    controllers: [ConfigController],
    providers: [ConfigService, PollerService],
})
export class SourcesConfigModule { }
