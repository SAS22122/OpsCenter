import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';


interface FilterBarProps {
    onSearchChange: (val: string) => void;
    onServiceChange: (val: string) => void;
    onViewChange: (view: 'active' | 'archived' | 'whitelisted') => void;
    currentView: 'active' | 'archived' | 'whitelisted';
    dateRange?: DateRange;
    setDateRange?: (range: DateRange | undefined) => void;
    density: 'comfortable' | 'compact';
    onDensityChange: (d: 'comfortable' | 'compact') => void;
    sortStrategy: import('../../types/incident').SortStrategy;
    onSortChange: (s: import('../../types/incident').SortStrategy) => void;
}
import { useIncidents } from '@/hooks/useIncidents';

export function FilterBar({ onSearchChange, onServiceChange, onViewChange, currentView, dateRange, setDateRange, density, onDensityChange, sortStrategy, onSortChange }: FilterBarProps) {
    const { groups } = useIncidents();
    const apps = Array.from(new Set(groups.map(g => g.appId))).filter(Boolean);


    return (
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 backdrop-blur-sm sticky top-0 z-40 shadow-sm">

            {/* Top Row: Search (Full width on key mobile, flexible on desktop) */}
            <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                <div className="relative flex-1 w-full order-1 md:order-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Rechercher des incidents (ID, erreur, service)..."
                        className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:ring-indigo-500 placeholder:text-slate-500"
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>



                {/* Desktop: View Switcher aligned right */}
                <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-950 rounded-md p-1 border border-slate-200 dark:border-slate-800 shrink-0">
                    <button
                        onClick={() => onViewChange('active')}
                        aria-label="Vue incidents actifs"
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${currentView === 'active' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        Direct
                    </button>
                    <button
                        onClick={() => onViewChange('archived')}
                        aria-label="Vue historique"
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${currentView === 'archived' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        Historique
                    </button>
                    <button
                        onClick={() => onViewChange('whitelisted')}
                        aria-label="Vue whitelist"
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${currentView === 'whitelisted' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
                        Whitelist
                    </button>
                </div>
            </div>     {/* Second Row: Filters (Scrollable on mobile if needed, or Grid) */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full overflow-x-auto pb-2 md:pb-0">
                {/* Mobile: View Switcher (Visible only on mobile) */}
                <div className="flex md:hidden w-full items-center bg-slate-100 dark:bg-slate-950 rounded-md p-1 border border-slate-200 dark:border-slate-800 shrink-0 mb-2">
                    <button
                        onClick={() => onViewChange('active')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${currentView === 'active' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Direct
                    </button>
                    <button
                        onClick={() => onViewChange('archived')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${currentView === 'archived' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Historique
                    </button>
                    <button
                        onClick={() => onViewChange('whitelisted')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${currentView === 'whitelisted' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Whitelist
                    </button>
                </div>

                {/* Date Range Picker */}
                <div className="w-full md:w-auto shrink-0">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>

                {/* Service Filter */}
                <div className="w-full md:w-32 shrink-0">
                    <Select onValueChange={onServiceChange}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-slate-500" />
                                <SelectValue placeholder="Service" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                            <SelectItem value="all">Tous les services</SelectItem>
                            {apps.map(app => (
                                <SelectItem key={app} value={app}>{app}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort Strategy */}
                <div className="w-full md:w-32 shrink-0">
                    <Select value={sortStrategy} onValueChange={(v) => onSortChange(v as import('../../types/incident').SortStrategy)}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-medium">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="m21 8-4-4-4 4" /><path d="M17 4v16" /></svg>
                                <SelectValue placeholder="Trier par" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                            <SelectItem value="urgency">Urgence</SelectItem>
                            <SelectItem value="volume">Volume</SelectItem>
                            <SelectItem value="recency">Récence</SelectItem>
                            <SelectItem value="debt">Dette</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Density Toggle (Right aligned on desktop) */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-md p-1 border border-slate-200 dark:border-slate-800 ml-auto shrink-0">
                    <button
                        onClick={() => onDensityChange('comfortable')}
                        aria-label="Mode confort"
                        className={`p-1.5 rounded transition-colors ${density === 'comfortable' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        title="Confortable"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /></svg>
                    </button>
                    <button
                        onClick={() => onDensityChange('compact')}
                        aria-label="Mode compact"
                        className={`p-1.5 rounded transition-colors ${density === 'compact' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        title="Compact"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M3 21h18" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
