import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingDown, AlertOctagon } from "lucide-react"

interface GlobalKPIProps {
    totalUnique24h: number
    totalOccurrences24h: number
    totalRegressions24h: number
    isFiltered?: boolean
}

export function GlobalKPI({ totalUnique24h, totalOccurrences24h, totalRegressions24h, isFiltered }: GlobalKPIProps) {
    const periodLabel = isFiltered ? "(Période)" : "(24h)";

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* 1. Unique Errors (24h) */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" aria-label="KPI Erreurs Uniques">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Erreurs Uniques {periodLabel}</CardTitle>
                    <Activity className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{totalUnique24h}</div>
                    <p className="text-xs text-muted-foreground mt-1">+2 nouveaux</p>
                </CardContent>
            </Card>

            {/* 2. Total Volumetrics (24h) */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Volume Total {periodLabel}</CardTitle>
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{totalOccurrences24h.toLocaleString()}</div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">-12% vs hier</p>
                </CardContent>
            </Card>

            {/* 3. Regressions (24h) */}
            <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${totalRegressions24h > 0 ? 'border-l-4 border-l-red-500' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Régressions {periodLabel}</CardTitle>
                    <AlertOctagon className={`h-4 w-4 ${totalRegressions24h > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold font-mono ${totalRegressions24h > 0 ? 'text-red-600 dark:text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>
                        {totalRegressions24h}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{totalRegressions24h > 0 ? 'Action requise immédiate' : 'Stable'}</p>
                </CardContent>
            </Card>

            {/* 4. Health Score Removed per user request */}


        </div>
    )
}
