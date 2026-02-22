import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, TrendingUp } from "lucide-react"

interface KPICardsProps {
    mttrHours: number
    totalDeployments: number
}

export function KPICards({ mttrHours, totalDeployments }: KPICardsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* MTTR */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-shadow" aria-label="KPI Temps Moyen de Résolution">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Temps Moyen de Résolution</CardTitle>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{mttrHours}h</div>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">-14%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Temps moyen de résolution (30j)</p>
                </CardContent>
            </Card>

            {/* Velocity */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-shadow" aria-label="KPI Vélocité de Déploiement">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Nombre de déploiement</CardTitle>
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalDeployments}</div>
                        <span className="text-xs font-medium text-slate-500">versions</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Total déploiements (30j)</p>
                </CardContent>
            </Card>
        </div>
    )
}
