import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ChartDataPoint {
    date: string
    errors: number
    deployments: number
}

interface DeploymentChartProps {
    data: ChartDataPoint[]
    syncId?: string
}

export function DeploymentChart({ data, syncId }: DeploymentChartProps) {
    return (
        <Card className="col-span-1 md:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm" aria-label="Graphique de déploiements et erreurs">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-400">
                    Derniers Déploiements vs Erreurs
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-500">Corrélation entre les mises à jour et les pics d'erreurs</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} syncId={syncId}>
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
                            {/* Hidden Axis for Deployment Bars */}
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

                            {/* Fake "Lines" using 2px Bars */}
                            <Bar
                                yAxisId="right"
                                dataKey="deployments"
                                barSize={2}
                                fill="#6366f1" // Indigo-500
                                radius={[2, 2, 0, 0]}
                            />

                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="errors"
                                stroke="#f43f5e"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#fff', stroke: '#f43f5e', strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
