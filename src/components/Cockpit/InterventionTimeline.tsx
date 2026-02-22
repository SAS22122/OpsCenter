import { GitPullRequest, Zap, User, Rocket, CheckCircle2 } from "lucide-react"
import { ErrorGroup } from "@/types/incident"
import { useIncidents } from "@/hooks/useIncidents"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TimelineProps {
    group: ErrorGroup | null
}

export function InterventionTimeline({ group }: TimelineProps) {
    const { groups } = useIncidents()

    if (!group) {
        return (
            <div className="border-l border-slate-800 pl-6 ml-2 space-y-8 py-2 opacity-50">
                <div className="flex items-center gap-3 text-sm text-slate-500 italic">
                    {/* PlusCircle removed too if unused*/}
                    Sélectionnez un incident pour voir l'historique...
                </div>
            </div>
        )
    }

    // Recursively resolve all ancestors to build the full history chain
    // [v1, v2, v3 (current)]
    const resolveAncestors = (currentGroup: ErrorGroup): ErrorGroup[] => {
        if (!currentGroup.regressionOf) return [currentGroup];
        const parent = groups.find(g => g.id === currentGroup.regressionOf);
        if (!parent) return [currentGroup];
        return [...resolveAncestors(parent), currentGroup];
    };

    const historyChain = resolveAncestors(group);

    // Helper to render a timeline segment based on chain index
    const renderTimelineSegment = (targetGroup: ErrorGroup, chainIndex: number) => {
        const isFirst = chainIndex === 0;
        const isHistorical = chainIndex !== historyChain.length - 1;

        // Use the new timeline array if available, otherwise fallback to legacy rendering
        // Actually, we should map legacy fields to a virtual timeline if missing for back-compat
        // But for this feature, let's focus on the new structure.

        // Combine legacy fields into a specific view if timeline missing?
        // Let's iterate the `timeline` array if present.
        const events = targetGroup.timeline || [];

        // If no timeline (legacy), we might want to keep the old display logic or migrate it?
        // For the purpose of the demo and "Contextual Action", we assume new actions generate timeline events.
        // Let's mix both: Always show "Detection" (Start), then iterate events.

        return (
            <div key={targetGroup.id} className={isHistorical ? "opacity-70 hover:opacity-100 transition-opacity" : ""}>
                {/* 1. Detection (Always exists based on firstSeen) */}
                <div className="relative animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className={`absolute -left-[31px] ${isHistorical ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-900 shadow-[0_0_8px_rgba(239,68,68,0.4)]'} border rounded-full p-1.5`}>
                        <Zap className={`h-4 w-4 ${isHistorical ? 'text-slate-400' : 'text-red-600 dark:text-red-500'}`} />
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mb-0.5">
                        {new Date(targetGroup.firstSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`text-base font-bold ${isHistorical ? 'text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                        {isFirst ? (isHistorical ? `Incident Original (v${targetGroup.version || 1})` : 'Incident Détecté') : `Régression (v${targetGroup.version})`}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full w-fit mt-1">Sentinelle IA</div>

                    {/* Show creation comment if any */}
                    {events.find(e => e.action === 'creation')?.comment && (
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-black/40 p-2 rounded border-l-2 border-slate-300 dark:border-slate-700 italic">
                            "{events.find(e => e.action === 'creation')?.comment}"
                        </div>
                    )}
                </div>

                {/* Render Timeline Events */}
                {events.filter(e => e.action !== 'creation').map((event) => {
                    const Icon = event.action === 'acknowledge' ? User :
                        event.action === 'fix' ? GitPullRequest :
                            event.action === 'deploy' ? Rocket : CheckCircle2;

                    const colorClass = event.action === 'acknowledge' ? 'text-blue-500' :
                        event.action === 'fix' ? 'text-amber-500' :
                            event.action === 'deploy' ? 'text-indigo-600' : 'text-emerald-600';

                    const tooltipText = event.action === 'acknowledge' ? 'Prise en charge par l\'équipe Ops' :
                        event.action === 'fix' ? 'Correctif mergé et prêt' :
                            event.action === 'deploy' ? 'Mise en production effectuée' : 'Validation finale du correctif';

                    return (
                        <div key={event.id} className="relative animate-in fade-in slide-in-from-left-4 duration-500 delay-100 mt-8">
                            <div className="absolute left-[-22px] top-[-30px] w-px h-8 border-l-2 border-slate-200 dark:border-slate-800" />

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={`absolute -left-[31px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 hover:scale-110 transition-transform cursor-help`}>
                                            <Icon className={`h-3 w-3 ${colorClass}`} />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{tooltipText}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="text-xs text-slate-500 mb-0.5">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className={`text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize`}>
                                {event.action.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{event.actor}</div>

                            {/* THE COMMENT */}
                            {event.comment && (
                                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-black/40 p-2 rounded border-l-2 border-slate-300 dark:border-slate-700 italic">
                                    "{event.comment}"
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="border-l border-slate-200 dark:border-slate-800 pl-6 ml-2 space-y-2 py-2">

            {historyChain.map((g, index) => renderTimelineSegment(g, index))}

            {/* Pending Step Visualization */}
            {(group.status === 'OPEN' || group.status === 'REGRESSION') && (
                <div className="relative opacity-40 mt-8">
                    <div className="absolute -left-[30px] h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 top-1.5" />
                    <div className="text-sm text-slate-400 dark:text-slate-500 italic">En attente de prise en charge...</div>
                </div>
            )}

        </div>
    )
}
