import { ErrorGroup, IncidentAction, ActionPayload } from '@/types/incident'
import { WorkflowTimeline } from './WorkflowTimeline'
import { ActionPanel } from './ActionPanel'
import { AlertOctagon, Activity, GitPullRequest, Flame } from 'lucide-react'

interface ErrorRowProps {
    group: ErrorGroup
    isSelected?: boolean
    onSelect?: () => void
    onAction: (groupId: string, action: IncidentAction, payload?: ActionPayload) => void
    density?: 'comfortable' | 'compact'
}

export function ErrorRow({ group, isSelected = false, onSelect, onAction, density = 'comfortable' }: ErrorRowProps) {
    // Helper for color logic
    const priorityColor = group.severity === 'CRITICAL' ? 'red' :
        group.severity === 'MEDIUM' ? 'amber' :
            group.severity === 'MINOR' ? 'blue' : 'slate';

    const isCompact = density === 'compact';


    return (
        <div
            onClick={onSelect}
            // Accessibility: Make row focusable
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect?.();
                }
            }}
            role="button"
            aria-expanded={isSelected}
            className={`group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-200 cursor-pointer border-l-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-sm ${group.status === 'REGRESSION' ? 'border-2 border-red-500' :
                priorityColor === 'red' ? 'border-l-red-500' :
                    priorityColor === 'amber' ? 'border-l-amber-500' :
                        priorityColor === 'blue' ? 'border-l-blue-500' :
                            'border-l-slate-300 dark:border-l-slate-700 border-dashed'
                } ${isSelected ? 'bg-white dark:bg-slate-900/80 border-l-4 shadow-sm' : ''} 
                ${(group.version || 1) > 1 ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] mb-2 translate-x-[-2px] translate-y-[-2px]' : ''}`}
        >
            <div className={`flex items-center gap-4 ${isCompact ? 'p-2' : 'p-4'}`}>
                {/* Icon */}
                <div className={`rounded-lg ${isCompact ? 'p-1.5' : 'p-2'} ${priorityColor === 'red' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500' :
                    priorityColor === 'amber' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500' :
                        priorityColor === 'blue' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-500' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                    {group.severity === 'CRITICAL' ? <AlertOctagon className={isCompact ? "h-4 w-4" : "h-5 w-5"} /> :
                        group.status === 'REGRESSION' ? <Flame className={isCompact ? "h-4 w-4" : "h-5 w-5"} /> :
                            group.severity === 'UNQUALIFIED' ? <AlertOctagon className={isCompact ? "h-4 w-4 opacity-50" : "h-5 w-5 opacity-50"} /> :
                                <GitPullRequest className={isCompact ? "h-4 w-4" : "h-5 w-5"} />}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-500">{group.severity}</span>


                        {group.status === 'REGRESSION' && (
                            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                                <Activity className="h-3 w-3" /> Non correction
                            </div>
                        )}
                        {(group.version || 1) > 1 && (
                            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                v{group.version}
                            </div>
                        )}
                        {group.assignee && (
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in zoom-in-95">
                                <img src="https://github.com/shadcn.png" className="h-3 w-3 rounded-full" alt="avatar" />
                                {group.assignee}
                            </div>
                        )}
                    </div>
                    <div className="font-medium text-slate-900 dark:text-slate-200 truncate pr-4 text-sm group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                        {group.title}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-mono">
                        <span>
                            {new Date(group.firstSeen).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(group.lastSeen).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                {/* Timeline Mini */}
                <div className="hidden md:flex flex-col items-center justify-center flex-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Statut</span>
                    <WorkflowTimeline
                        status={group.status}
                        acknowledgedAt={group.acknowledgedAt}
                        fixedAt={group.fixedAt}
                        deployedAt={group.deployedAt}
                        compact
                    />
                </div>

                {/* Metrics */}
                <div className="w-24 text-right pl-4 border-l border-slate-100 dark:border-slate-800 flex flex-col items-end justify-center">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-sm ${priorityColor === 'red' ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400' :
                        priorityColor === 'amber' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400' :
                            priorityColor === 'blue' ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400' :
                                'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                        <Flame className={`h-3.5 w-3.5 ${priorityColor === 'red' && 'fill-red-500'}`} />
                        <span className="text-sm font-bold">{group.occurrenceCount}</span>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isSelected && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-800 shadow-inner">
                    <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <ActionPanel
                            group={group}
                            onAction={(action, payload) => onAction(group.id, action, payload)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
