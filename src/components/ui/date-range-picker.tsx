import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
    className?: string
    date?: DateRange | undefined
    setDate?: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {

    // Quick Presets
    const presets = [
        {
            label: 'Aujourd\'hui',
            action: () => {
                const now = new Date()
                setDate?.({ from: startOfDay(now), to: endOfDay(now) })
            }
        },
        {
            label: 'Hier',
            action: () => {
                const yesterday = subDays(new Date(), 1)
                setDate?.({ from: startOfDay(yesterday), to: endOfDay(yesterday) })
            }
        },
        {
            label: '7 derniers jours',
            action: () => {
                const now = new Date()
                setDate?.({ from: subDays(now, 7), to: now })
            }
        },
        {
            label: '30 derniers jours',
            action: () => {
                const now = new Date()
                setDate?.({ from: subDays(now, 30), to: now })
            }
        }
    ]

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd LLL y", { locale: fr })} -{" "}
                                    {format(date.to, "dd LLL y", { locale: fr })}
                                </>
                            ) : (
                                format(date.from, "dd LLL y", { locale: fr })
                            )
                        ) : (
                            <span>Choisir une période</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden rounded-xl shadow-xl" align="start">
                    <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
                        {/* Sidebar: Presets */}
                        <div className="flex flex-col p-2 space-y-1 bg-slate-50/50 dark:bg-slate-950/50 min-w-[140px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">Raccourcis</span>
                            {presets.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={preset.action}
                                    className="px-2 py-1.5 text-xs text-left font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Content: Calendar + Time Inputs */}
                        <div className="flex flex-col">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                className="p-4"
                            />

                            {/* Footer: Time Inputs */}
                            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 flex items-center justify-end gap-6">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Début</span>
                                        <input
                                            type="time"
                                            aria-label="Heure de début"
                                            className="h-7 w-[96px] rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-xs font-medium shadow-sm transition-colors text-slate-900 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={date?.from ? format(date.from, 'HH:mm') : "00:00"}
                                            onChange={(e) => {
                                                if (!date?.from) return
                                                const [hours, minutes] = e.target.value.split(':').map(Number)
                                                const newDate = new Date(date.from)
                                                newDate.setHours(hours)
                                                newDate.setMinutes(minutes)
                                                setDate?.({ ...date, from: newDate })
                                            }}
                                            disabled={!date?.from}
                                        />
                                    </div>
                                </div>

                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fin</span>
                                        <input
                                            type="time"
                                            aria-label="Heure de fin"
                                            className="h-7 w-[96px] rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-xs font-medium shadow-sm transition-colors text-slate-900 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={date?.to ? format(date.to, 'HH:mm') : "00:00"}
                                            onChange={(e) => {
                                                if (!date) return
                                                const [hours, minutes] = e.target.value.split(':').map(Number)
                                                // Handle undefined to date by defaulting to from date or current date
                                                const baseDate = date.to || date.from || new Date()
                                                const newDate = new Date(baseDate)
                                                newDate.setHours(hours)
                                                newDate.setMinutes(minutes)
                                                setDate?.({ ...date, to: newDate })
                                            }}
                                            disabled={!date?.from}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
