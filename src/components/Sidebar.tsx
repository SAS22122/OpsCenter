import React from "react"
import { LayoutDashboard, BarChart2, Activity } from 'lucide-react'
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

type SidebarProps = React.HTMLAttributes<HTMLDivElement>

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("pb-6 h-screen w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col sticky top-0", className)}>
            <div className="flex items-center gap-2 px-2 mb-8 pt-4 shrink-0">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">OpsCenter</span>
            </div>

            <nav className="space-y-1 overflow-y-auto flex-1">
                <Link to="/overview">
                    <Button variant="ghost" className="w-full justify-start gap-3 pl-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800">
                        <LayoutDashboard className="h-4 w-4" />
                        Vue d'Ensemble
                    </Button>
                </Link>
                <Link to="/">
                    <Button variant="ghost" className="w-full justify-start gap-3 pl-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800">
                        <Activity className="h-4 w-4" />
                        Incidents & Logs
                    </Button>
                </Link>
                <Link to="/analytics">
                    <Button variant="ghost" className="w-full justify-start gap-3 pl-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800">
                        <BarChart2 className="h-4 w-4" />
                        Analytique
                    </Button>
                </Link>
            </nav>

            <div className="px-6 flex justify-center mt-auto py-4 border-t border-slate-200 dark:border-slate-800">
                <ThemeToggle />
            </div>
        </div>
    )
}
