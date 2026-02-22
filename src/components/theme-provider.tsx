import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export const useTheme = () => {
    // This useTheme hook is now orphaned as ThemeProviderContext is removed.
    // If you intend to use next-themes's useTheme, you should import it:
    // import { useTheme } from "next-themes"
    // and remove this custom implementation.
    throw new Error("useTheme must be used within a ThemeProvider")
}
