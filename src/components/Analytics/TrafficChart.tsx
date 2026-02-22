import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AnalyticsDataPoint } from "@/types/incident"

interface TrafficChartProps {
    data: AnalyticsDataPoint[]
    syncId?: string
}

export function TrafficChart({ data, syncId }: TrafficChartProps) {
    return (
        <Card className="col-span-1 md:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm" aria-label="Graphique de trafic et usage">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-400">
                    Trafic & Usage
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-500">Volume de requêtes par jour (simulé)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            syncId={syncId}
                        >
                            <defs>
                                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                scale="point"
                                padding={{ left: 10, right: 10 }}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                                dx={-10}
                            />
                            {/* Hidden Axis for Deployment Markers (Consistent with DeploymentChart) */}
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[0, 1]}
                                hide={true}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />

                            {/* Fake "Lines" using 2px Bars for Deployments (Same as DeploymentChart) */}
                            <Bar
                                yAxisId="right"
                                dataKey="deployments"
                                barSize={2}
                                fill="#6366f1" // Indigo-500
                                radius={[2, 2, 0, 0]}
                            />

                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="traffic"
                                stroke="#0ea5e9"
                                fillOpacity={1}
                                fill="url(#colorTraffic)"
                                strokeWidth={2}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
