import { useIncidents } from "@/hooks/useIncidents"
// aria-label: ignore
// aria-label: ignoreobalKPI"
import { GlobalKPI } from "@/components/AppsOverview/GlobalKPI"
import { AppMetricCard } from "@/components/AppsOverview/AppMetricCard"
import { motion } from "framer-motion"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

export default function AppsOverview() {
    const { groups, getAppStats, dateRange, setDateRange } = useIncidents()

    // Aggregate data by Application
    // Force full static registry of critical services (always visible)
    // Aggregate data by Application
    // Force full static registry of critical services (always visible)
    const allApps = ['Brains', 'Discovery'];

    // Calculate Global Stats (Filtered by Date Range if active, otherwise 24h default logic?)
    // Actually, if Date Range is active, "24h" should probably become "Selected Period" or just respect the filter.
    // Let's make KPIs respect the filtered view.

    // Helper to filter global groups by date range
    const globalFilteredGroups = groups.filter(g => {
        if (!dateRange?.from) return true; // Default to all? Or should we default to 24h if no range?
        // If no range selected, maybe show 24h? User asked for filter.
        // Let's assume if NO filter, use ALL or 24h?
        // "Une carte en haut du total des erreurs Unique sur les dernières 24h"
        // If filter is active, it overrides.
        const incidentDate = new Date(g.lastSeen);
        if (incidentDate < dateRange.from!) return false;
        if (dateRange.to && incidentDate > dateRange.to) return false;
        return true;
    });

    // If dateRange is set, use filtered. If not, use last 24h for "24h" cards?
    // User asked "sur les dernières 24h" originally.
    // Now "avoir le filtre avec la période".
    // Logic: If Filter Active -> Show Filtered Data. If No Filter -> Show 24h (Default).

    const activeGroups = dateRange?.from ? globalFilteredGroups : groups.filter(g => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return new Date(g.lastSeen) > yesterday;
    });

    const totalUnique = activeGroups.length;
    const totalOccurrences = activeGroups.reduce((acc, g) => acc + g.occurrenceCount, 0);
    const totalRegressions = activeGroups.filter(g => g.status === 'REGRESSION').length;

    return (
        <div className="p-6 space-y-8 bg-slate-50 dark:bg-transparent min-h-screen max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Vue d'Ensemble</h1>
                    <p className="text-muted-foreground text-slate-500 dark:text-slate-400">
                        État de santé global du système et des services.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
            </div>

            {/* 1. Global KPI Row (24h / Selected Period) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <GlobalKPI
                    totalUnique24h={totalUnique}
                    totalOccurrences24h={totalOccurrences}
                    totalRegressions24h={totalRegressions}
                    isFiltered={!!dateRange?.from}
                />
            </motion.div>

            <div className="border-t border-slate-200 dark:border-slate-800 my-4" />

            {/* 2. Applications Grid */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                État des Services
                <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {allApps.length} actifs
                </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allApps.map((appName, index) => (
                    <motion.div
                        key={appName}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <AppMetricCard stats={getAppStats(appName)} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
