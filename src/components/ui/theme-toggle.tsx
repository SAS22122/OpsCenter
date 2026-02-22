import { Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(true)

    useEffect(() => {
        // Sync with document class
        const isDarkClass = document.documentElement.classList.contains('dark')
        setIsDark(isDarkClass)
    }, [])

    const toggle = () => {
        const newDark = !isDark
        setIsDark(newDark)
        if (newDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    return (
        <div
            onClick={toggle}
            className="flex items-center justify-between bg-slate-900 rounded-full p-1 cursor-pointer border border-slate-800 w-20 relative h-9 transition-colors hover:border-slate-600"
            title="Toggle Theme"
        >
            <div className={cn(
                "absolute top-1 bottom-1 w-8 rounded-full bg-indigo-600 transition-all duration-300 z-0",
                isDark ? "left-[calc(100%-36px)]" : "left-1"
            )} />

            <div className={cn("z-10 flex items-center justify-center w-8 h-full transition-colors", !isDark ? "text-white" : "text-slate-500")}>
                <Sun className="h-4 w-4" />
            </div>

            <div className={cn("z-10 flex items-center justify-center w-8 h-full transition-colors", isDark ? "text-white" : "text-slate-500")}>
                <Moon className="h-4 w-4" />
            </div>
        </div>
    )
}
