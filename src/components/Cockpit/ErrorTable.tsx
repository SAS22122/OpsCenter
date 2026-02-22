import { ErrorGroup, IncidentAction, ActionPayload } from '@/types/incident'
import { ErrorRow } from './ErrorRow'

interface ErrorTableProps {
    groups: ErrorGroup[]
    onAction: (groupId: string, action: IncidentAction, payload?: ActionPayload) => void
}

export function ErrorTable({ groups, onAction }: ErrorTableProps) {
    if (groups.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500 mb-1">Aucun incident actif.</p>
                <p className="text-xs text-slate-400">Temps pour un café ? ☕</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {groups.map(group => (
                <ErrorRow key={group.id} group={group} onAction={onAction} />
            ))}
        </div>
    )
}
