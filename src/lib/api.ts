import { BackendIncident, IngestPayload } from '@/types/incident';

// Use relative path by default to leverage Vite Proxy (or Nginx in prod)
const API_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || ''; // Read API Key

export class ApiClient {
    static async ingestLog(payload: IngestPayload): Promise<{ status: string, incidentId: string, isNew: boolean }> {
        try {
            const response = await fetch(`${API_URL}/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY, // Auth Header
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Ingest failed:', error);
            throw error;
        }
    }

    static async getIncidents(): Promise<BackendIncident[]> {
        try {
            // Updated endpoint: /incidents (GET)
            const response = await fetch(`${API_URL}/incidents`);
            if (!response.ok) throw new Error("Failed to fetch incidents");
            return await response.json();
        } catch (error) {
            console.error("Fetch incidents failed:", error);
            throw error; // Propagate error to caller (IncidentContext)
        }
    }

    static async clearIncidents(): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/ingest`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': API_KEY, // Auth Header
                },
            });
            if (!response.ok) throw new Error("Failed to clear incidents");
        } catch (error) {
            console.error("Clear incidents failed:", error);
            throw error;
        }
    }
}
