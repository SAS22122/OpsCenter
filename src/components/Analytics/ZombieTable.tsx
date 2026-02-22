import { ErrorGroup } from '@/types/incident'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skull, Flame } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface ZombieTableProps {
    zombies: ErrorGroup[]
}

export function ZombieTable({ zombies }: ZombieTableProps) {
    return (
        <Card className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm" aria-label="Tableau des erreurs zombies">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
                    <Skull className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    Clusters Zombies
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-500">Problèmes récurrents nécessitant attention.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {zombies.length === 0 ? (
                        <div className="text-center text-xs text-slate-400 py-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                            Aucune erreur zombie trouvée.
                        </div>
                    ) : (
                        zombies.map((zombie) => (
                            <div key={zombie.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all">
                                <div className="space-y-1 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-200 truncate">{zombie.title}</span>
                                        {zombie.status === 'REGRESSION' && <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">REGR</Badge>}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">
                                        ID: {zombie.id.slice(0, 6)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <Flame className="h-3 w-3 text-orange-500" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{zombie.occurrenceCount}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
