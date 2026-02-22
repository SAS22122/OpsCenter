import { GitPullRequest, ArrowRight, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"


interface AIFixPanelProps {
    errorId: string
    summary?: string
    suggestedFix?: string
    location?: string
}

export function AIFixPanel({ errorId, summary, suggestedFix, location }: AIFixPanelProps) {
    if (!summary && !suggestedFix) return null;

    return (
        <div className="mt-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-slate-900/50 p-0 overflow-hidden text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/50 bg-indigo-100/50 dark:bg-indigo-950/30 px-4 py-2">
                <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Analyse IA</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer">
                        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">Ref: {errorId}</span>
                        <ArrowRight className="h-3 w-3 text-indigo-500" />
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Summary Section */}
                {summary && (
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">Résumé :</span>
                        {summary}
                    </div>
                )}

                {/* Code Fix Section */}
                {suggestedFix && (
                    <div className="bg-slate-50 dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900/30 rounded-md overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-slate-900/80">
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                {location ? `// ${location}` : '// Piste de correction'}
                            </span>
                        </div>
                        <div className="p-3 font-mono text-xs overflow-x-auto text-slate-800 dark:text-slate-300 leading-relaxed bg-white dark:bg-transparent">
                            <pre className="whitespace-pre-wrap">{suggestedFix}</pre>
                        </div>
                        <div className="px-3 py-2 border-t border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10 flex items-center gap-2">
                            <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-none gap-2 shadow-sm">
                                <GitPullRequest className="h-3 w-3" />
                                Créer Issue Jira
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
