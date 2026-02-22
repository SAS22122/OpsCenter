import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/Sidebar"
import { GlobalFilterBar } from "@/components/Navigation/GlobalFilterBar"

export function MainLayout() {
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <GlobalFilterBar />
                <main className="flex-1 overflow-auto p-0">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
