import { useState } from 'react';
import { useAuth } from '@/stores/AuthContext';
import { ApiClient } from '@/lib/api';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await ApiClient.login({ email, password });
            login(data.access_token, data.user);
            toast.success("Connexion réussie");
            navigate('/');
        } catch (err: any) {
            toast.error(err.message || "Email ou mot de passe incorrect");
        } finally {
            setLoading(false);
        }
    };

    const handleMicrosoftLogin = () => {
        // Redirect to the backend SSO endpoint (to be implemented)
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/microsoft`;
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
                        <CardTitle className="text-2xl font-semibold tracking-tight">Bon retour</CardTitle>
                        <CardDescription className="text-sm text-slate-500">
                            Entrez vos identifiants pour accéder à votre espace
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
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
                                    className="bg-slate-50 border-input shadow-sm h-11"
                                />
                            </div>
                            <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors" disabled={loading}>
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-slate-500">Ou</span>
                            </div>
                        </div>

                        <Button variant="outline" type="button" onClick={handleMicrosoftLogin} className="w-full h-11 flex items-center gap-2 justify-center border-slate-200 shadow-sm hover:bg-slate-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#f35325" d="M11.391 11.391H.443V.443h10.948v10.948z" /><path fill="#81bc06" d="M23.557 11.391H12.61V.443h10.948v10.948z" /><path fill="#05a6f0" d="M11.391 23.557H.443V12.61h10.948v10.948z" /><path fill="#ffba08" d="M23.557 23.557H12.61V12.61h10.948v10.948z" /></svg>
                            Continuer avec Microsoft
                        </Button>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
                        <p className="text-sm text-slate-500">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 underline-offset-4 hover:underline transition-all">
                                Demander un accès
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
