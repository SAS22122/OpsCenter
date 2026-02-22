import { useState } from "react"
import { AppStats } from "@/types/incident"
import { Card } from "@/components/ui/card"
import { Shield, Lock, Database, ShoppingCart, Server, ChevronDown, Activity, AlertTriangle, CheckCircle2, Flame, Layers } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Tooltip, XAxis } from "recharts"
import { motion, AnimatePresence } from "framer-motion"


interface AppMetricCardProps {
    stats: AppStats
}

export function AppMetricCard({ stats }: AppMetricCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Icon Selection
    let AppIcon = Server
    if (stats.appName.includes('Auth')) AppIcon = Lock
    if (stats.appName.includes('Payment')) AppIcon = Shield
    if (stats.appName.includes('DB')) AppIcon = Database
    if (stats.appName.includes('Store')) AppIcon = ShoppingCart

    // Status Color
    const statusColor = stats.status === 'critical' ? 'text-red-500 bg-red-50 dark:bg-red-950/30' :
        stats.status === 'warning' ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' :
            'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'

    return (
        <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <Card className={`group overflow-hidden border-l-4 transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-500/20 shadow-lg' : 'hover:shadow-md'} 
                ${stats.status === 'critical' ? 'border-l-red-500' : stats.status === 'warning' ? 'border-l-amber-500' : 'border-l-emerald-500'}
                bg-white dark:bg-slate-900 border-y border-r border-slate-200 dark:border-slate-800`}>

                <button
                    className="w-full text-left p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={`Détails pour ${stats.appName}`}
                >
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${statusColor}`}>
                                <AppIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">{stats.appName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border 
                                        ${stats.status === 'critical' ? 'text-red-600 border-red-200 bg-red-50' :
                                            stats.status === 'warning' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                                'text-emerald-600 border-emerald-200 bg-emerald-50'}`}>
                                        {stats.status === 'critical' ? <Flame className="h-3 w-3" /> :
                                            stats.status === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
                                                <CheckCircle2 className="h-3 w-3" />}
                                        {stats.status}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">v2.4.0</span>
                                </div>
                            </div>
                        </div>

                        {/* Sparkline Preview (Visible when collapsed) */}
                        {!isExpanded && (
                            <div className="h-10 w-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.dailyStats}>
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke={stats.status === 'critical' ? '#ef4444' : '#6366f1'}
                                            fill={stats.status === 'critical' ? '#ef4444' : '#6366f1'}
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chevron */}
                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>

                    {/* Metrics Grid (Typographic Brutalism) */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Actifs Uniques</p>
                            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{stats.uniqueErrors}</div>
                        </div>
                        <div className="border-l border-slate-100 dark:border-slate-800 pl-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total (Occ.)</p>
                            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{stats.total.toLocaleString()}</div>
                        </div>
                        <div className="border-l border-slate-100 dark:border-slate-800 pl-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Régressions</p>
                            <div className={`text-2xl font-bold font-mono ${stats.regressions > 0 ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                {stats.regressions}
                            </div>
                        </div>
                    </div>
                </button>

                {/* Expanded Content: Deep Dive Charts */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-slate-50/50 dark:bg-black/20 border-t border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-5 space-y-6">
                                {/* Chart 1: Volume Trend */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                            <Activity className="h-3 w-3" />
                                            Volume Incidents (Semaine Glissante)
                                        </h4>
                                    </div>
                                    <div className="h-32 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.dailyStats}>
                                                <defs>
                                                    <linearGradient id={`gradient-${stats.appName}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={stats.status === 'critical' ? '#ef4444' : '#6366f1'} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={stats.status === 'critical' ? '#ef4444' : '#6366f1'} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke={stats.status === 'critical' ? '#ef4444' : '#6366f1'}
                                                    fill={`url(#gradient-${stats.appName})`}
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Chart 2: Regressions (Bar) */}
                                {stats.regressions > 0 && (
                                    <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <h4 className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                                            <Layers className="h-3 w-3" />
                                            Impact Régressions
                                        </h4>
                                        <div className="h-24 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.dailyStats}>
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                                    <Bar dataKey="regressions" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}


                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    )
}

