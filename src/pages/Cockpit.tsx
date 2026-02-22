import { InterventionTimeline } from '@/components/Cockpit/InterventionTimeline'
import { useIncidents } from "@/hooks/useIncidents"
import { IncidentAction, ActionPayload } from "@/types/incident"
import { FilterBar } from '@/components/Cockpit/FilterBar'
import { CockpitStats } from '@/components/Cockpit/CockpitStats'
import { IncidentFeed } from '@/components/Cockpit/IncidentFeed'



import { useState, useMemo } from 'react'
// import { DateRange } from 'react-day-picker'

export default function Cockpit() {
    const {
        groups,
        updateGroupStatus,
        getFilteredGroups,
        searchTerm,
        selectedService,
        dateRange,
        setSearchTerm,
        setSelectedService,
        setDateRange,
        selectedEnv,        // Added
        setSelectedEnv,      // Added
        updateSeverity,

        sortStrategy,
        setSortStrategy,
    } = useIncidents()
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
    const [view, setView] = useState<'active' | 'archived' | 'whitelisted'>('active')
    const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

    // Use global filtered groups with memoization
    const globalFiltered = useMemo(() => getFilteredGroups(), [getFilteredGroups]);

    // Apply View Filter (Active/Archived/Whitelisted) locally as it's view-specific
    const filteredGroups = useMemo(() => globalFiltered.filter(g => {
        if (view === 'active') return g.status !== 'ARCHIVED' && g.status !== 'IGNORED' && g.status !== 'VERIFIED_FIXED';
        if (view === 'archived') return g.status === 'ARCHIVED' || g.status === 'VERIFIED_FIXED';
        if (view === 'whitelisted') return g.status === 'IGNORED';
        return true;
    }), [globalFiltered, view]);

    // Derived state for the sidebar timeline
    const selectedGroup = useMemo(() => filteredGroups.find(g => g.id === selectedGroupId) || null, [filteredGroups, selectedGroupId]);

    // 2. Derive Statistics (Only from 'Active' pool for meaningful stats)
    const activeIncidents = useMemo(() => groups.filter(g => g.status !== 'VERIFIED_FIXED' && g.status !== 'ARCHIVED' && g.status !== 'IGNORED'), [groups]);
    const criticalCount = useMemo(() => activeIncidents.filter(g => g.severity === 'CRITICAL' || g.status === 'REGRESSION').length, [activeIncidents]);

    // 3. Compute Stats by Environment (for badges)
    const envStats = useMemo(() => {
        const stats: Record<string, { active: number, critical: number }> = {};
        groups.forEach(g => {
            if (g.status === 'ARCHIVED' || g.status === 'VERIFIED_FIXED' || g.status === 'IGNORED') return;
            if (!g.env) return;

            if (!stats[g.env]) stats[g.env] = { active: 0, critical: 0 };

            stats[g.env].active++;
            if (g.severity === 'CRITICAL' || g.status === 'REGRESSION') {
                stats[g.env].critical++;
            }
        });
        return stats;
    }, [groups]);

    const handleAction = (groupId: string, action: IncidentAction, payload?: ActionPayload) => {
        if (action === 'acknowledge') updateGroupStatus(groupId, 'ACKNOWLEDGED', payload)
        else if (action === 'fix') updateGroupStatus(groupId, 'FIXED', payload)
        else if (action === 'deploy') updateGroupStatus(groupId, 'DEPLOYED', payload)
        else if (action === 'archive') updateGroupStatus(groupId, 'ARCHIVED')
        else if (action === 'qualify' && payload?.severity) updateSeverity(groupId, payload.severity)
        else if (action === 'verify') updateGroupStatus(groupId, 'VERIFIED_FIXED')

        else if (action === 'ignore') updateGroupStatus(groupId, 'IGNORED', payload)
        else if (action === 'restore') updateGroupStatus(groupId, 'OPEN', { ...payload, comment: 'Retiré de la whitelist' }) // Restore to OPEN
    }

    const hasActiveFilters = !!(searchTerm || dateRange || selectedService !== 'all');

    return (
        <div className="p-6 space-y-6 max-w-[1800px] mx-auto bg-slate-50 dark:bg-black/20 min-h-screen">

            {/* Top Widgets Grid */}
            <CockpitStats
                activeCount={filteredGroups.length}
                criticalCount={criticalCount}
                view={view}
                selectedEnv={selectedEnv}
                onSelectEnv={setSelectedEnv}
                envStats={envStats}
            />

            {/* Filter Bar - Sync with Global State if kept, or simplify */}
            <FilterBar
                onSearchChange={setSearchTerm}
                onServiceChange={setSelectedService}
                onViewChange={setView}
                currentView={view}
                dateRange={dateRange}
                setDateRange={setDateRange}
                density={density}
                onDensityChange={setDensity}
                sortStrategy={sortStrategy}
                onSortChange={setSortStrategy}
            />



            {/* Content Layout: Feed + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-6 relative items-stretch">

                {/* Main Content: Hierarchical Incident Feed */}
                <div className="flex-1 space-y-6 min-w-0">
                    <IncidentFeed
                        groups={filteredGroups}
                        selectedGroupId={selectedGroupId}
                        onSelectGroup={setSelectedGroupId}
                        onAction={handleAction}
                        density={density}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={() => {
                            setSearchTerm('');
                            setSelectedService('all');
                            setDateRange(undefined);
                        }}
                    />
                </div>

                {/* Right Column: Intervention Timeline Track */}
                <div className="hidden lg:block relative w-full h-full">
                    {/* The Sticky Element */}
                    <div
                        className="sticky top-6 bg-slate-50 dark:bg-black/20 rounded-md border border-slate-200 dark:border-slate-800/50 shadow-sm p-4 overflow-y-auto hidden-scrollbar"
                        style={{ maxHeight: 'calc(100vh - 3rem)' }}
                    >
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Intervention Timeline</h3>
                                </div>
                            </div>
                            {selectedGroup && (
                                <div className="mt-4 pb-2 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug border-b border-slate-200 dark:border-slate-800/50">
                                    {selectedGroup.title || selectedGroup.description || "Titre de l'incident indisponible (vérifier les données entrantes)"}
                                </div>
                            )}
                        </div>
                        {/* Timeline Events */}
                        <InterventionTimeline group={selectedGroup} />
                    </div>
                </div>

            </div>
        </div>
    )
}
