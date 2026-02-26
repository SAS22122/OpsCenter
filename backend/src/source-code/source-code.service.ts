import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SourceCodeService {
    private readonly logger = new Logger(SourceCodeService.name);
    private readonly pat: string | undefined;
    private readonly orgUrl: string | undefined;
    private readonly project: string | undefined;

    constructor(private configService: ConfigService) {
        this.pat = this.configService.get<string>('AZURE_DEVOPS_PAT');
        this.orgUrl = this.configService.get<string>('AZURE_DEVOPS_ORG');
        this.project = this.configService.get<string>('AZURE_DEVOPS_PROJECT');

        if (this.pat) {
            this.logger.log('Azure DevOps integration ENABLED.');
        } else {
            this.logger.warn('Azure DevOps PAT missing. Running in MOCK/DISABLED mode.');
        }
    }

    /**
     * Tries to extract a filename and line number from a stack trace
     * and fetches the surrounding code from Azure DevOps.
     */
    async getSurroundingCodeFromStackTrace(stackTrace: string | undefined, repoName: string): Promise<string | null> {
        if (!stackTrace) return null;
        if (!this.pat) {
            this.logger.debug('Skipping source code fetch (No PAT configured).');
            return null; // Feature toggle
        }

        try {
            // 1. Parse the stack trace (Heuristic for C# / .NET)
            // Example match: in D:\\a\\1\\s\\GeneDoc\\Models\\GenerateDocument.cs:line 4340
            const fileMatch = stackTrace.match(/([a-zA-Z0-9_\-/\\]+\.(cs|ts|js|java)):line\s(\d+)/i);

            if (!fileMatch) {
                this.logger.debug('Could not extract file and line from stack trace.');
                return null;
            }

            const rawFilePath = fileMatch[1];
            const lineNumber = parseInt(fileMatch[3], 10);

            // Clean up the path (Windows paths to Unix style for Git, strip absolute drive temp folders)
            // This is a naive cleanup, might need refinement based on exact ADO structure
            const normalizedPath = rawFilePath.replace(/\\/g, '/').split('/s/').pop() || rawFilePath;

            this.logger.log(`Attempting to fetch code for ${normalizedPath} around L${lineNumber} in repo ${repoName}...`);

            // 2. Fetch the file from Azure DevOps API
            const fileContent = await this.fetchFileFromAzureDevOps(repoName, normalizedPath);
            if (!fileContent) return null;

            // 3. Extract the context (e.g., 15 lines before and after)
            const lines = fileContent.split('\n');
            const startLine = Math.max(0, lineNumber - 15);
            const endLine = Math.min(lines.length - 1, lineNumber + 15);

            const contextLines = lines.slice(startLine, endLine + 1).map((line, idx) => {
                const currentLineNum = startLine + idx + 1;
                const marker = currentLineNum === lineNumber ? '>> ' : '   ';
                return `${marker}${currentLineNum}: ${line}`;
            });

            return contextLines.join('\n');

        } catch (error: any) {
            this.logger.error(`Failed to fetch source code context: ${error.message}`);
            return null;
        }
    }

    /**
     * Simulates or makes the actual API call to Azure DevOps Repos API 
     * GET https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repositoryId}/items?path={path}&api-version=7.0
     */
    private async fetchFileFromAzureDevOps(repositoryName: string, filePath: string): Promise<string | null> {
        // --- TODO: IMPLEMENT REAL API CALL HERE WHEN TOKEN IS AVAILABLE ---
        // const authHandler = getPersonalAccessTokenHandler(this.pat);
        // ...

        // Simulating the API response for structural purposes
        this.logger.debug(`[MOCK] Fetching /${filePath} from Azure Repo ${repositoryName}...`);
        return null;
    }
}
