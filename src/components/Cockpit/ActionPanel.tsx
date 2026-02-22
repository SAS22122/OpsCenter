import { Button } from '@/components/ui/button'
import { CheckCircle2, GitPullRequest, Terminal, Monitor, ArrowRight, UserCheck, BookOpen, FileText, Archive as ArchiveIcon, Activity, AlertOctagon, Flame, History, MessageSquare, X, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { AIFixPanel } from './AIFixPanel'
import { ErrorGroup, IncidentAction, ActionPayload } from '@/types/incident'
import { generatePDFReport } from '@/lib/incident-utils'
import { useIncidents } from '@/hooks/useIncidents'

interface ActionPanelProps {
    group: ErrorGroup
    onAction: (action: IncidentAction, payload?: ActionPayload) => void
}

export function ActionPanel({ group, onAction }: ActionPanelProps) {
    const { groups } = useIncidents()
    const [deployVersion, setDeployVersion] = useState('')
    const [viewMode, setViewMode] = useState<'current' | 'history'>(group.status === 'ARCHIVED' ? 'history' : 'current')

    // State for Action Comment Dialog
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
    const [pendingAction, setPendingAction] = useState<{ action: IncidentAction, payload?: ActionPayload } | null>(null)
    const [actionComment, setActionComment] = useState('')

    // Find parent group if this is a regression
    const parentGroup = group.regressionOf ? groups.find(g => g.id === group.regressionOf) : undefined
    const isRegression = !!parentGroup || group.status === 'REGRESSION';

    // Determine which group to show based on tabs
    const displayGroup = (viewMode === 'history' && parentGroup) ? parentGroup : group

    // Helpers to determine "Current Action" availability (based on displayGroup)
    const showAck = displayGroup.status === 'OPEN' || displayGroup.status === 'REGRESSION'
    const showFix = displayGroup.status === 'ACKNOWLEDGED'
    const showDeploy = displayGroup.status === 'FIXED'
    const showVerify = displayGroup.status === 'DEPLOYED'

    // Only allow actions on the CURRENT group (disable actions if viewing history, unless it's just archive/report)
    const isHistoryView = viewMode === 'history';

    const handleDeploy = () => {
        if (!deployVersion) return
        if (isHistoryView) return; // Prevent actions on history
        handleActionRequest('deploy', { version: deployVersion })
    }

    const handleVerify = () => {
        if (isHistoryView) return;
        handleActionRequest('verify')
    }

    // Overload onAction to block changes if in history mode (except safe ones like download)
    const handleAction = (action: IncidentAction, payload?: ActionPayload) => {
        if (isHistoryView && action !== 'archive' && action !== 'qualify') return;
        onAction(action, payload);
    }

    // Intercept actions that require comments
    const handleActionRequest = (action: IncidentAction, payload?: ActionPayload) => {
        if (isHistoryView && action !== 'archive' && action !== 'qualify') return;

        // Actions that prompt for comment: Acknowledge, Fix, Deploy, Verify, Ignore, Restore
        const needsComment = ['acknowledge', 'fix', 'deploy', 'verify', 'ignore', 'restore'].includes(action);

        if (needsComment) {
            setPendingAction({ action, payload });
            setActionComment(''); // Reset
            setIsCommentDialogOpen(true);
        } else {
            // Qualify, Archive, etc. typically fast actions without note (or optional?)
            // Let's keep Qualify fast. Archive might need note but for now fast.
            onAction(action, payload);
        }
    }

    const confirmAction = () => {
        if (!pendingAction) return;
        // Construct correct payload merging existing payload + comment
        const finalPayload = { ...(pendingAction.payload || {}), comment: actionComment };
        onAction(pendingAction.action, finalPayload);
        setIsCommentDialogOpen(false);
        setPendingAction(null);
    }

    const handleDownloadReport = () => {
        generatePDFReport(displayGroup);
    }

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col bg-white dark:bg-slate-900 rounded-b-lg border-t border-slate-100 dark:border-slate-800 shadow-inner relative"
        >
            {/* Version Tabs (Only if Regression) */}
            {isRegression && parentGroup && (
                <div className="flex items-center px-4 pt-4 gap-2">
                    <button
                        onClick={() => setViewMode('current')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${viewMode === 'current'
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 relative top-[1px] z-10'
                            : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Flame className="h-3.5 w-3.5" />
                        Régression (v{group.version || 2})
                    </button>
                    <button
                        onClick={() => setViewMode('history')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-t-lg border-t border-x transition-colors ${viewMode === 'history'
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 relative top-[1px] z-10'
                            : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <History className="h-3.5 w-3.5" />
                        Historique (v{parentGroup.version || 1})
                    </button>
                    <div className="flex-1 border-b border-slate-200 dark:border-slate-700 relative top-[1px]"></div>
                </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 p-4 ${isRegression && parentGroup ? 'border-t border-slate-200 dark:border-slate-700' : ''}`}>

                {/* LEFT: Technical Context */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                            <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-3">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Analyse & Stack Trace</h4>
                                {group.runbookUrl && (
                                    <a
                                        href={group.runbookUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-full"
                                    >
                                        <BookOpen className="h-3 w-3" />
                                        Runbook Disponible
                                    </a>
                                )}
                            </div>

                            <div className="flex gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1.5 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900"
                                    onClick={() => window.open(`https://www.dynatrace.com/hub/detail/java/?id=${group.id}`, '_blank')}
                                >
                                    <Activity className="h-3 w-3" />
                                    Voir sur Dynatrace
                                </Button>
                            </div>
                            <div className="mt-2 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 p-3 rounded-md font-mono text-xs overflow-x-auto shadow-sm">
                                {group.logs[0]?.message || "Aucun message de log"}
                                <div className="text-slate-400 dark:text-slate-500 mt-1">at com.service.payment.Process (line 42)</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-slate-500 pl-11">
                        <div className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            <span>Affecté : {group.aiLocation || group.env || 'Non spécifié'}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Workflow Actions */}
                <div className="border-l border-slate-100 dark:border-slate-800 pl-6 flex flex-col justify-center space-y-6">
                    {/* Qualification Section */}
                    <div className="mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Qualification Sévérité</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className={`flex flex-col h-auto py-2 gap-1 ${group.severity === 'MINOR' ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                                onClick={() => handleAction('qualify', { severity: 'MINOR' })}
                            >
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[10px]">Mineur</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`flex flex-col h-auto py-2 gap-1 ${group.severity === 'MEDIUM' ? 'bg-amber-50 border-amber-200 text-amber-700 ring-1 ring-amber-200' : 'hover:bg-slate-50'}`}
                                onClick={() => handleAction('qualify', { severity: 'MEDIUM' })}
                            >
                                <Activity className="h-3 w-3 text-amber-500" />
                                <span className="text-[10px]">Moyen</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`flex flex-col h-auto py-2 gap-1 ${group.severity === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200' : 'hover:bg-slate-50'}`}
                                onClick={() => handleAction('qualify', { severity: 'CRITICAL' })}
                            >
                                <AlertOctagon className="h-3 w-3 text-red-500" />
                                <span className="text-[10px]">Critique</span>
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Flux de Résolution</h4>

                    {showAck && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                            <Button
                                onClick={() => handleActionRequest('acknowledge')}
                                className="w-full justify-between group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                                variant="outline"
                            >
                                <span className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                                    Accepter & Assigner
                                </span>
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            <p className="text-[10px] text-slate-500 text-center">Assigne au PO actuel</p>
                        </div>
                    )}

                    {showFix && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                            <Button
                                onClick={() => handleActionRequest('fix')}
                                className="w-full justify-between group bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                            >
                                <span className="flex items-center gap-2">
                                    <GitPullRequest className="h-4 w-4" />
                                    Correctif Prêt
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2 justify-center text-[10px] text-slate-500">
                                <img src="https://github.com/shadcn.png" alt="Dev Avatar" className="h-4 w-4 rounded-full opacity-70" />
                                <span>Dev: Seif</span>
                            </div>
                        </div>
                    )}

                    {showDeploy && (
                        <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-300">Version à Déployer</label>
                                <input
                                    type="text"
                                    placeholder="ex: v2.1.4"
                                    className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    value={deployVersion}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setDeployVersion(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleDeploy}
                                disabled={!deployVersion}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                size="sm"
                            >
                                Confirmer Déploiement
                            </Button>
                        </div>
                    )}

                    {showVerify && (
                        <div className="space-y-3 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30 animate-in fade-in zoom-in-95">
                            <div className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400 mb-2">
                                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>Le correctif est déployé. Veuillez confirmer la résolution en production.</p>
                            </div>
                            <Button
                                onClick={handleVerify}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                size="sm"
                            >
                                Confirmer la Résolution
                            </Button>
                        </div>
                    )}

                    {(group.status === 'VERIFIED_FIXED' || group.status === 'ARCHIVED') && (
                        <div className="space-y-3">
                            <div className="text-center p-4 bg-emerald-50 dark:bg-slate-800/30 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800">
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                                <div className="font-semibold text-sm">Incident Résolu</div>
                                <div className="text-xs opacity-70 mt-1">Version : {group.deployedAt ? group.deployedVersion || 'v2.x' : 'N/A'}</div>
                            </div>

                            {/* Post-Resolution Actions */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    onClick={handleDownloadReport}
                                >
                                    <FileText className="h-3 w-3 mr-2" />
                                    Rapport
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                    onClick={() => handleActionRequest('archive')}
                                >
                                    <ArchiveIcon className="h-3 w-3 mr-2" />
                                    Historiser
                                </Button>
                            </div>

                            {/* Simulation Tool for Demo */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-[10px] text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 h-6"
                                onClick={() => handleActionRequest('simulate_regression')}
                            >
                                <Flame className="h-3 w-3 mr-1" />
                                Simuler Récurrence (Demo)
                            </Button>
                        </div>
                    )}

                    {/* Ignore / Whitelist Action (Always available if OPEN/REGRESSION) */}
                    {(group.status === 'OPEN' || group.status === 'REGRESSION') && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                                onClick={() => handleActionRequest('ignore')}
                            >
                                <ShieldCheck className="h-3 w-3 mr-2" />
                                Whitelister cet incident
                            </Button>
                        </div>
                    )}

                    {/* Restore from Whitelist (Only if IGNORED) */}
                    {group.status === 'IGNORED' && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg text-slate-500 mb-3 border border-slate-100 dark:border-slate-800">
                                <ShieldCheck className="h-6 w-6 mx-auto mb-1 text-indigo-400" />
                                <div className="font-semibold text-xs">Incident Whitelisté</div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                onClick={() => handleActionRequest('restore')}
                            >
                                <Activity className="h-3 w-3 mr-2" />
                                Retirer de la Whitelist
                            </Button>
                        </div>
                    )}
                </div>
                {/* AI Fix Panel Integration */}
                <div className="md:col-span-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <AIFixPanel
                        errorId={`ERR-${group.id.substring(0, 8)}`}
                        summary={group.aiSummary}
                        suggestedFix={group.aiSuggestedFix}
                        location={group.aiLocation}
                    />
                </div>
            </div>

            {/* Custom Modal for Comments (Tailwind only) */}
            {isCommentDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-indigo-500" />
                                Note d'intervention
                            </h3>
                            <button
                                onClick={() => setIsCommentDialogOpen(false)}
                                className="text-slate-400 hover:text-slate-500 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Ajoutez du contexte pour cette action. Ce commentaire sera visible dans la timeline.
                            </p>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Ex: Redémarrage effectif, correctif appliqué..."
                                value={actionComment}
                                onChange={(e) => setActionComment(e.target.value)}
                            />
                        </div>

                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={confirmAction}>
                                Confirmer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
