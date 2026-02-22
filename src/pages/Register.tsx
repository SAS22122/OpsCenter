import { useState } from 'react';
import { useAuth, User } from '@/stores/AuthContext';
import { ApiClient } from '@/lib/api';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Inscription
            await ApiClient.register({ name, email, password });
            toast.success("Compte créé avec succès !");

            // 2. Auto-login immédiat après inscription
            const data = await ApiClient.login({ email, password });
            login(data.access_token, data.user as unknown as User);
            navigate('/');
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xl">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">OpsCenter</span>
                    </div>
                </div>

                <Card className="shadow-lg border-0">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-semibold tracking-tight">Créer un compte</CardTitle>
                        <CardDescription className="text-sm text-slate-500">
                            Complétez vos informations pour accéder à OpsCenter
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Prénom Nom"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-slate-50 border-input shadow-sm h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nom@entreprise.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-slate-50 border-input shadow-sm h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-slate-50 border-input shadow-sm h-11"
                                />
                            </div>
                            <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors" disabled={loading}>
                                {loading ? 'Création en cours...' : "S'inscrire"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
                        <p className="text-sm text-slate-500">
                            Vous avez déjà un compte ?{' '}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline-offset-4 hover:underline transition-all">
                                Se connecter
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
