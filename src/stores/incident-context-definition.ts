import { createContext } from 'react';
import { ErrorGroup, ErrorLog, ResolutionState, StatusUpdatePayload, AnalyticsDataPoint } from '../types/incident';
import { DateRange } from 'react-day-picker';

export interface IncidentContextType {
    groups: ErrorGroup[];
    ingestLog: (log: ErrorLog) => void;
    updateGroupStatus: (groupId: string, status: ResolutionState, payload?: StatusUpdatePayload) => void;


    clearAll: () => void;
    getAnalyticsData: () => AnalyticsDataPoint[];
    getAppStats: (appName: string) => import('../types/incident').AppStats;
    // Filters
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedEnv: string;
    setSelectedEnv: (env: string) => void;
    selectedService: string;
    setSelectedService: (service: string) => void;
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    sortStrategy: import('../types/incident').SortStrategy;
    setSortStrategy: (strategy: import('../types/incident').SortStrategy) => void;
    getFilteredGroups: () => ErrorGroup[];
    updateSeverity: (groupId: string, severity: ErrorGroup['severity']) => void;

    syncWithSql: () => Promise<void>; // Added
}

export const IncidentContext = createContext<IncidentContextType | undefined>(undefined);
