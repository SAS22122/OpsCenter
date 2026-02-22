import { ErrorGroup, IncidentAction, ActionPayload } from '@/types/incident'
import { ErrorRow } from './ErrorRow'
import { EmptyState } from '@/components/ui/empty-state'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface IncidentFeedProps {
    groups: ErrorGroup[]
    selectedGroupId: string | null
    onSelectGroup: (id: string | null) => void
    onAction: (groupId: string, action: IncidentAction, payload?: ActionPayload) => void
    density: 'comfortable' | 'compact'
    hasActiveFilters: boolean
    onClearFilters: () => void
}

export function IncidentFeed({
    groups,
    selectedGroupId,
    onSelectGroup,
    onAction,
    density,
    hasActiveFilters,
    onClearFilters
}: IncidentFeedProps) {

    // Group by Application
    const apps = Array.from(new Set(groups.map(g => g.appId)));

    if (apps.length === 0) {
        return (
            <EmptyState
                icon={Search}
                title="No Incidents Found"
                description={hasActiveFilters
                    ? "Adjust your filters to see more results."
                    : "All systems are operational. No active incidents detected."}
                actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
                onAction={onClearFilters}
            />
        )
    }

    return (
        <div className="space-y-6">
            {apps.map(appId => {
                const appIncidents = groups.filter(g => g.appId === appId);
                if (appIncidents.length === 0) return null;

                const isCrit = appIncidents.some(g => g.severity === 'CRITICAL');

                return (
                    <div key={appId} className="space-y-0 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className={`h-2 w-2 rounded-full ${isCrit ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">{appId}</h3>
                                {isCrit && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-900">CRITICAL</span>}
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-500">Erreurs Uniques:</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{appIncidents.length}</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                    <span className="text-slate-500">Total Occurrences:</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{appIncidents.reduce((acc, curr) => acc + curr.occurrenceCount, 0).toLocaleString()}</span>
                                </div>
                                <span className="text-xs text-slate-400 font-mono pl-2 border-l border-slate-200 dark:border-slate-800">{(appIncidents[0]?.env || 'unknown').toUpperCase()}</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            <AnimatePresence initial={false}>
                                {appIncidents.map(group => (
                                    <motion.div
                                        key={group.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ErrorRow
                                            group={group}
                                            isSelected={group.id === selectedGroupId}
                                            onSelect={() => onSelectGroup(selectedGroupId === group.id ? null : group.id)}
                                            onAction={onAction}
                                            density={density}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
