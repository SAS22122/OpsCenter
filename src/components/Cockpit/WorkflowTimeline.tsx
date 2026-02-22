import { Check, GitCommit, LayoutDashboard, User, CheckCircle2 } from 'lucide-react'
import { ResolutionState } from '@/types/incident'
import { cn } from '@/lib/utils'

interface WorkflowTimelineProps {
    status: ResolutionState
    acknowledgedAt?: string
    fixedAt?: string
    deployedAt?: string
    compact?: boolean
}

export function WorkflowTimeline({ status, acknowledgedAt, fixedAt, deployedAt, compact }: WorkflowTimelineProps) {
    if (compact) {
        // Mini version for the dense row
        const steps = [
            { id: 'ack', active: !!acknowledgedAt, icon: User, label: 'Vu' },
            { id: 'fix', active: !!fixedAt, icon: GitCommit, label: 'Fix' },
            { id: 'dep', active: !!deployedAt, icon: LayoutDashboard, label: 'Dep' },
            { id: 'ver', active: status === 'VERIFIED_FIXED' || status === 'ARCHIVED', icon: CheckCircle2, label: 'Ok' },
        ]

        return (
            <div className="flex items-center gap-1.5 bg-slate-900/50 p-1 rounded-full border border-slate-800">
                {steps.map((s, i) => (
                    <div key={i} className="flex items-center">
                        <div className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center transition-colors",
                            s.active ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                                : "bg-slate-800 text-slate-600 border border-slate-700"
                        )}>
                            {s.active ? <Check className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
                        </div>
                        {i < steps.length - 1 && (
                            <div className={cn("w-2 h-0.5 mx-0.5 rounded-full", s.active ? "bg-emerald-900" : "bg-slate-800")} />
                        )}
                    </div>
                ))}
            </div>
        )
    }

    // Helper to determine step state
    const getStepState = (stepIndex: number) => {
        // Step 1: PO Validation (ACKNOWLEDGED)
        // Step 2: Dev Fix (FIXED)
        // Step 3: Ops Deploy (DEPLOYED)
        // Step 4: Verification (VERIFIED_FIXED)

        if (status === 'REGRESSION') return 'error' // Special case

        // ARCHIVED means everything is done and dusted
        if (status === 'ARCHIVED') return 'completed';

        // Check completion based on specific milestones or strictly sequential status
        if (stepIndex === 0 && (acknowledgedAt || status !== 'OPEN')) return 'completed'
        if (stepIndex === 1 && (fixedAt || ['FIXED', 'DEPLOYED', 'VERIFIED_FIXED'].includes(status))) return 'completed'
        if (stepIndex === 2 && (deployedAt || ['DEPLOYED', 'VERIFIED_FIXED'].includes(status))) return 'completed'
        if (stepIndex === 3 && status === 'VERIFIED_FIXED') return 'completed'

        // Determine if "Active/In Progress"
        // Active if previous step is done but this one isn't
        const prevDone = stepIndex === 0 ? true : getStepState(stepIndex - 1) === 'completed'
        if (prevDone) return 'active'

        return 'pending'
    }

    const steps = [
        { label: 'PO', icon: LayoutDashboard, date: acknowledgedAt },
        { label: 'Dev', icon: GitCommit, date: fixedAt },
        { label: 'Ops', icon: User, date: deployedAt },
        { label: 'Résolu', icon: CheckCircle2, date: status === 'VERIFIED_FIXED' ? new Date().toISOString() : null }, // Mock date for simplified view
    ]

    return (
        <div className="flex items-center w-full max-w-md gap-0">
            {steps.map((step, idx) => {
                const state = getStepState(idx)
                const isLast = idx === steps.length - 1

                return (
                    <div key={idx} className="flex items-center flex-1 last:flex-none">
                        {/* Step Circle */}
                        <div className="relative flex flex-col items-center gap-2 group">
                            <div className={cn(
                                "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 bg-background",
                                state === 'completed' && "bg-green-100 border-green-500 text-green-700",
                                state === 'active' && "border-blue-500 text-blue-600 animate-pulse",
                                state === 'pending' && "border-slate-200 text-slate-300"
                            )}>
                                {state === 'completed' ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <step.icon className="h-4 w-4" />
                                )}
                            </div>

                            {/* Hover tooltip or simple label below */}
                            <div className="absolute top-10 flex flex-col items-center">
                                <span className={cn(
                                    "text-xs font-semibold whitespace-nowrap",
                                    state === 'pending' && "text-muted-foreground",
                                    state === 'active' && "text-blue-600",
                                    state === 'completed' && "text-green-700"
                                )}>
                                    {step.label}
                                </span>
                                {step.date && <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{new Date(step.date).toLocaleDateString()}</span>}
                            </div>
                        </div>

                        {/* Connector Line */}
                        {!isLast && (
                            <div className={cn(
                                "h-0.5 flex-1 mx-2 transition-all duration-500",
                                state === 'completed' ? "bg-green-500" : "bg-slate-200"
                            )} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
