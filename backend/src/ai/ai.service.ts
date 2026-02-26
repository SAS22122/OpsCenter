import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface AiAnalysisResult {
    summary: string;
    fix: string;
    location: string;
}

@Injectable()
export class AiService {
    private openai: OpenAI | null = null;
    private readonly logger = new Logger(AiService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey && apiKey.startsWith('sk-')) {
            this.openai = new OpenAI({ apiKey });
            this.logger.log('AI Service initialized with OpenAI API Key.');
        } else {
            this.logger.warn('OPENAI_API_KEY missing or invalid. AI Service running in MOCK mode.');
        }
    }

    async generateAnalysis(message: string, stackTrace: string, sourceCodeContext?: string | null): Promise<AiAnalysisResult | null> {
        // MOCK MODE
        if (!this.openai) {
            this.logger.log(`[MOCK] Generating analysis for: ${message.substring(0, 50)}...`);
            await new Promise(r => setTimeout(r, 1000)); // Simulate latency
            return {
                summary: "Ceci est un résumé IA simulé. L'erreur semble liée à un timeout de connexion ou une mauvaise configuration de la base de données.",
                fix: "// Véfifiez le fichier .env \nDB_TIMEOUT=5000\nDB_RETRY_ATTEMPTS=3\n\n// Ou le pare-feu :\nsudo ufw allow 5432/tcp",
                location: "backend/src/database.module.ts (Ligne 42)"
            };
        }

        // REAL MODE
        try {
            const prompt = `
            You are an expert DevOps Engineer. Analyze the following error log.
            
            Error Message: "${message}"
            Stack Trace: "${stackTrace || 'No stack trace provided'}"
            ${sourceCodeContext ? `\nHere is the actual source code surrounding the error line:\n"""\n${sourceCodeContext}\n"""\n` : ''}
            
            Provide a JSON response with THREE fields:
            1. "summary": A concise explanation of the root cause IN FRENCH (max 2 sentences).
            2. "fix": A specific technical suggestion to fix it. If applicable, provide the exact code snippet or command needed. Be detailed but concise.
            3. "location": The most likely file path and line number causing the issue (e.g. "src/main.ts:15"), inferred from stack trace.
            
            Do not include any other text, just the JSON.
            `;

            const completion = await this.openai.chat.completions.create({
                messages: [{ role: 'system', content: prompt }],
                model: 'gpt-4o-mini',
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            if (!content) return null;

            return JSON.parse(content) as AiAnalysisResult;

        } catch (error) {
            this.logger.error('Failed to generate AI analysis', error);
            return null;
        }
    }
}
