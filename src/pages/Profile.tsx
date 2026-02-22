import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/AuthContext';
import { ApiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Settings, Palette, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [env, setEnv] = useState<string>('all');

    useEffect(() => {
        if (user && user.preferences) {
            if (user.preferences.theme) setTheme(user.preferences.theme);
            if (user.preferences.defaultEnvironment) setEnv(user.preferences.defaultEnvironment);
        }
    }, [user]);

    const handleSavePreferences = async () => {
        setLoading(true);
        try {
            await ApiClient.updatePreferences({
                theme,
                defaultEnvironment: env
            });
            await refreshUser();
            toast.success("Préférences enregistrées avec succès");
        } catch (error: any) {
            toast.error("Erreur lors de l'enregistrement", { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <User className="h-6 w-6" />
                        Mon Profil
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Gérez vos informations personnelles et vos préférences d'affichage.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Informations Personnelles (Read-Only pour l'instant) */}
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-500" />
                            Informations Personnelles
                        </CardTitle>
                        <CardDescription>
                            Vos informations principales liées à ce compte.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none text-slate-800 dark:text-slate-200">Nom Complet</label>
                            <Input id="name" value={user.name} readOnly className="bg-slate-50 dark:bg-slate-900" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none text-slate-800 dark:text-slate-200">Adresse Email</label>
                            <Input id="email" value={user.email} readOnly className="bg-slate-50 dark:bg-slate-900" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium leading-none text-slate-800 dark:text-slate-200">Rôle (Droits d'accès)</label>
                            <Input id="role" value={user.role || 'VIEWER'} readOnly className="bg-slate-50 dark:bg-slate-900 font-mono text-xs" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pt-4">
                        <p className="text-xs text-slate-500">Pour modifier votre nom ou adresse email, veuillez contacter un administrateur.</p>
                    </CardFooter>
                </Card>

                {/* Préférences */}
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5 text-pink-500" />
                            Préférences
                        </CardTitle>
                        <CardDescription>
                            Personnalisez votre expérience sur l'application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium leading-none text-slate-800 dark:text-slate-200">
                                <Palette className="h-4 w-4 text-slate-500" />
                                Thème Visuel
                            </label>
                            <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un thème" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="system">Apparence du Système</SelectItem>
                                    <SelectItem value="light">Mode Clair</SelectItem>
                                    <SelectItem value="dark">Mode Sombre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium leading-none text-slate-800 dark:text-slate-200">
                                <Settings className="h-4 w-4 text-slate-500" />
                                Environnement par défaut
                            </label>
                            <Select value={env} onValueChange={setEnv}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un environnement" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les services</SelectItem>
                                    <SelectItem value="Brains">Brains</SelectItem>
                                    <SelectItem value="Discovery">Discovery</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">Filtre appliqué par défaut lors de votre connexion.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                        <Button onClick={handleSavePreferences} disabled={loading} className="gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                            <Save className="h-4 w-4" />
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
