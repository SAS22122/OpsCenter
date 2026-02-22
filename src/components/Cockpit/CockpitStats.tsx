import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Zap, AlertCircle } from "lucide-react"

export interface CockpitStatsProps {
    activeCount: number
    criticalCount: number
    view: 'active' | 'archived' | 'whitelisted'
    selectedEnv: string
    onSelectEnv: (env: string) => void
    envStats: Record<string, { active: number, critical: number }>
}

export function CockpitStats({ activeCount, criticalCount, view, selectedEnv, onSelectEnv, envStats }: CockpitStatsProps) {
    const envs = [
        { id: 'prod', label: 'Production', status: 'Opérationnel', color: 'emerald', icon: Activity },
        { id: 'stage', label: 'Pré-prod', status: 'Stable', color: 'blue', icon: Activity },
        { id: 'dev', label: 'Recette', status: 'Dégradé', color: 'amber', icon: AlertCircle } // Simulated status
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Column 1: Stacked Environment Selectors (Thinner, Stacked) */}
            <div className="md:col-span-2 flex flex-col gap-2 justify-between">
                {envs.map(env => {
                    const isSelected = selectedEnv === env.id;
                    const Icon = env.icon;
                    const stats = envStats[env.id] || { active: 0, critical: 0 };

                    return (
                        <button
                            key={env.id}
                            onClick={() => onSelectEnv(env.id)}
                            className={`w-full text-left cursor-pointer transition-all duration-200 border rounded-lg shadow-sm relative overflow-hidden group flex items-center px-4 py-2 gap-4 h-full
                                ${isSelected
                                    ? `border-${env.color}-500 bg-${env.color}-50/80 dark:bg-${env.color}-950/30 ring-1 ring-${env.color}-500/20 backdrop-blur-[2px]`
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            aria-label={`Environnement ${env.label} - Statut ${env.status}`}
                        >
                            {isSelected && (
                                <div className={`absolute top-0 left-0 w-1 h-full bg-${env.color}-500`} />
                            )}

                            <div className="flex items-center gap-3 w-32 shrink-0">
                                <Icon className={`h-4 w-4 ${isSelected ? `text-${env.color}-600 dark:text-${env.color}-500` : 'text-slate-400'}`} />
                                <span className={`text-xs font-bold font-mono uppercase tracking-wider ${isSelected ? `text-${env.color}-700 dark:text-${env.color}-400` : 'text-slate-500'}`}>
                                    {env.id.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex-1 flex items-center justify-between border-l border-slate-100 dark:border-slate-800/50 pl-4">
                                <span className={`text-sm font-semibold ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{env.status}</span>
                                <div className="flex items-center gap-2">
                                    {stats.critical > 0 && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full border border-red-100 dark:border-red-900/30">
                                            <AlertCircle className="h-3 w-3" />
                                            {stats.critical}
                                        </span>
                                    )}
                                    {stats.active > 0 && (
                                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                                            {stats.active}
                                        </span>
                                    )}
                                    {stats.active === 0 && <div className={`h-1.5 w-1.5 rounded-full bg-${env.color}-400/50`} />}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Column 2: Active Incidents */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">{view === 'active' ? 'Incidents Actifs' : view === 'whitelisted' ? 'Whitelist' : 'Historique'}</CardTitle>
                    <Zap className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeCount}</div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-amber-500 w-[60%]" />
                    </div>
                </CardContent>
            </Card>

            {/* Column 3: Critical Attention */}
            <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 shadow-sm md:col-span-1 border-2 border-dashed">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                    <CardTitle className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Attention Requise</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCount}</div>
                    <p className="text-[10px] text-red-500/80 mt-1 font-medium">Priorité Haute</p>
                </CardContent>
            </Card>
        </div>
    )
}
