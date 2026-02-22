import { Trash2, Database, Settings, LogOut, User as UserIcon } from 'lucide-react'
import { useIncidents } from "@/hooks/useIncidents"
import { Link } from 'react-router-dom';
import { useAuth } from '@/stores/AuthContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function GlobalFilterBar() {
    const {
        clearAll, syncWithSql,
        selectedService, setSelectedService,
    } = useIncidents()
    const { user, logout } = useAuth();

    return (
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center px-4 justify-between shrink-0 transition-colors">
            <div className="flex-1" />

            {/* 2. Context Selectors */}
            <div className="flex items-center gap-3">
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

                {/* Demo Controls - Hidden in Prod usually, but visible for this MVP/Demo */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={clearAll}
                        className="p-2 hover:bg-red-500/20 text-red-200 hover:text-red-100 rounded-md transition-colors"
                        title="Nettoyer la BD (Reset)"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => syncWithSql()}
                        className="p-2 hover:bg-emerald-500/20 text-emerald-200 hover:text-emerald-100 rounded-md transition-colors flex items-center gap-2"
                        title="Synchroniser avec SQL Server"
                    >
                        <Database className="h-4 w-4" />
                        <span className="text-xs font-mono hidden md:inline">SYNC SQL</span>
                    </button>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                {/* User Profile Menu */}
                <div className="flex items-center">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold text-sm hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all dark:ring-offset-slate-950">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" align="end">
                            <div className="flex flex-col space-y-1 p-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                                <p className="text-sm font-medium leading-none">{user?.name || 'Utilisateur'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <Link to="/settings" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                                    <Settings className="w-4 h-4 text-slate-500" />
                                    <span>Paramètres</span>
                                </Link>
                                <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                                    <UserIcon className="w-4 h-4 text-slate-500" />
                                    <span>Mon Profil</span>
                                </Link>
                                <button onClick={logout} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 cursor-pointer w-full text-left">
                                    <LogOut className="w-4 h-4" />
                                    <span>Se déconnecter</span>
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

            </div>
        </div>
    )
}
