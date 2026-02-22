import { Trash2, Database, Settings } from 'lucide-react'
import { useIncidents } from "@/hooks/useIncidents"
import { Link } from 'react-router-dom';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function GlobalFilterBar() {
    const {
        clearAll, syncWithSql,
        selectedService, setSelectedService,
    } = useIncidents()

    return (
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center px-4 justify-between shrink-0 transition-colors">
            {/* 1. Global Search Removed as per request */}
            <div className="flex-1" />

            {/* 2. Context Selectors */}
            <div className="flex items-center gap-3">
                {/* Env Select Removed - Moved to Cockpit Stats */}

                <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-[160px] h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors">
                        <div className="flex items-center gap-2">
                            <SelectValue placeholder="Tous les Services" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                        <SelectItem value="all">Tous les Services</SelectItem>
                        <SelectItem value="Brains">Brains</SelectItem>
                        <SelectItem value="Discovery">Discovery</SelectItem>
                    </SelectContent>
                </Select>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />



                {/* Demo Controls - Hidden in Prod usually, but visible for this MVP/Demo */}
                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 ml-2 pl-2">


                    <button
                        onClick={clearAll}
                        className="p-2 hover:bg-red-500/20 text-red-200 hover:text-red-100 rounded-md transition-colors"
                        title="Nettoyer la BD (Reset)"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>

                    <Link to="/settings">
                        <button
                            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
                            title="Paramètres de connexion"
                        >
                            <Settings className="h-4 w-4" />
                        </button>
                    </Link>

                    <button
                        onClick={() => syncWithSql()}
                        className="p-2 hover:bg-emerald-500/20 text-emerald-200 hover:text-emerald-100 rounded-md transition-colors flex items-center gap-2"
                        title="Synchroniser avec SQL Server"
                    >
                        <Database className="h-4 w-4" />
                        <span className="text-xs font-mono hidden md:inline">SYNC SQL</span>
                    </button>
                </div>

            </div>
        </div>
    )
}
