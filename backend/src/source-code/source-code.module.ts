import { Module } from '@nestjs/common';
import { SourceCodeService } from './source-code.service';

@Module({
    providers: [SourceCodeService],
    exports: [SourceCodeService],
})
export class SourceCodeModule { }
