import { IsString, IsOptional, IsNotEmpty, IsISO8601 } from 'class-validator';

export class CreateIncidentDto {
    @IsString()
    @IsNotEmpty()
    message: string;

    @IsString()
    @IsNotEmpty()
    serviceName: string;

    @IsString()
    @IsNotEmpty()
    environment: string;

    @IsString()
    @IsOptional()
    stackTrace?: string;

    @IsOptional()
    metadata?: Record<string, unknown>;

    @IsISO8601()
    @IsOptional()
    timestamp?: string;
}
