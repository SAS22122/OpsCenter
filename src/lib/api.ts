import { BackendIncident, IngestPayload } from '@/types/incident';

// Use relative path by default to leverage Vite Proxy (or Nginx in prod)
const API_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || ''; // Read API Key

export class ApiClient {
    private static jwtToken: string | null = null;

    static setToken(token: string | null) {
        this.jwtToken = token;
    }

    private static getHeaders(): HeadersInit {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY, // Keeping the old key for ingest compatibility if needed
        };
        if (this.jwtToken) {
            headers['Authorization'] = `Bearer ${this.jwtToken}`;
        }
        return headers;
    }

    // --- Authentication ---
    static async login(credentials: Record<string, unknown>): Promise<{ access_token: string, user: Record<string, unknown> }> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(credentials),
        });
        if (!response.ok) throw new Error("Invalid credentials");
        return response.json();
    }

    static async register(userData: Record<string, unknown>): Promise<Record<string, unknown>> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Registration failed");
        }
        return response.json();
    }

    static async getMe(): Promise<Record<string, unknown>> {
        const response = await fetch(`${API_URL}/users/me`, {
            headers: this.getHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch user profile");
        return response.json();
    }

    static async updatePreferences(preferences: Record<string, unknown>): Promise<Record<string, unknown>> {
        const response = await fetch(`${API_URL}/users/me/preferences`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(preferences),
        });
        if (!response.ok) throw new Error("Failed to update preferences");
        return response.json();
    }

    // --- Incidents ---
    static async ingestLog(payload: IngestPayload): Promise<{ status: string, incidentId: string, isNew: boolean }> {
        try {
            const response = await fetch(`${API_URL}/ingest`, {
                method: 'POST',
                headers: this.getHeaders(),
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
            const response = await fetch(`${API_URL}/incidents`, {
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch incidents");
            return await response.json();
        } catch (error) {
            console.error("Fetch incidents failed:", error);
            throw error;
        }
    }

    static async clearIncidents(): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/ingest`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });
            if (!response.ok) throw new Error("Failed to clear incidents");
        } catch (error) {
            console.error("Clear incidents failed:", error);
            throw error;
        }
    }
}
