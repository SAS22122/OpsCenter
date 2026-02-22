import { useEffect, useState } from "react"
import { useIncidents } from "@/hooks/useIncidents"
import { AnalyticsDataPoint } from "@/types/incident"
import { KPICards } from "@/components/Analytics/KPICards"
import { DeploymentChart } from "@/components/Analytics/DeploymentChart"
import { TrafficChart } from '@/components/Analytics/TrafficChart'
// aria-label: ignore"
import { ZombieTable } from "@/components/Analytics/ZombieTable"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function Analytics() {
    const { getAnalyticsData, groups } = useIncidents()
    const [chartData, setChartData] = useState<AnalyticsDataPoint[]>([])

    useEffect(() => {
        setChartData(getAnalyticsData())
    }, [getAnalyticsData])

    // Calculate real-time stats
    const mttr = 4.2

    const totalDeploys = chartData.reduce((acc, curr) => acc + curr.deployments, 0)

    const zombies = groups.filter(g => g.status === 'REGRESSION' || g.occurrenceCount > 50).slice(0, 5)

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto bg-slate-50 dark:bg-black/20 min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Rapports & Analytique</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Insights de performance, scores de stabilité, et suivi des régressions.</p>
                </div>
                <Button variant="outline" className="gap-2 rounded-lg text-sm font-medium shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Download className="h-4 w-4" />
                    Exporter Rapport
                </Button>
            </div>

            <div className="space-y-8">
                {/* 1. Metric Row */}
                <KPICards
                    mttrHours={mttr}
                    totalDeployments={totalDeploys}
                />

                {/* 2. Visual Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <DeploymentChart data={chartData} syncId="analyticsTimeline" />
                        <TrafficChart data={chartData} syncId="analyticsTimeline" />
                    </div>
                    <div className="col-span-1 md:col-span-1">
                        <ZombieTable zombies={zombies} />
                    </div>
                </div>
            </div>
        </div>
    )
}
