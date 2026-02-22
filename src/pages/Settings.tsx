import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Database } from 'lucide-react';
import { toast } from 'sonner';

interface SqlSource {
    id: string;
    name: string;
    host: string;
    database: string;
    table: string;
    user: string;
    password?: string;
    lastCheck?: string;
    env?: string;
}

export function SettingsPage() {
    const [sources, setSources] = useState<SqlSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        env: 'prod',
        host: '',
        database: '',
        table: ''
    });

    useEffect(() => {
        fetchSources();
        // Poll for updates (e.g. after a Sync)
        const interval = setInterval(fetchSources, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchSources = async () => {
        try {
            const res = await fetch('http://localhost:3001/config/sources');
            if (res.ok) {
                const data = await res.json();
                setSources(data);
            }
        } catch (e) {
            console.error("Failed to load sources", e);
            toast.error("Erreur", { description: "Impossible de charger la config (Serveur local éteint ?)" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette connexion ?")) return;
        try {
            await fetch(`http://localhost:3001/config/sources/${id}`, { method: 'DELETE' });
            toast.success("Supprimé");
            fetchSources();
        } catch (e) {
            console.error(e);
            toast.error("Erreur Suppression");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/config/sources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success("Source Ajoutée");
                setIsAdding(false);
                setFormData({ name: '', env: 'prod', host: '', database: '', table: '' });
                fetchSources();
            } else {
                toast.error("Erreur", { description: "Le serveur a refusé la config" });
            }
        } catch (e) {
            console.error(e);
            toast.error("Erreur Connexion");
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Database className="h-8 w-8 text-primary" />
                        Connecteurs SQL
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gérez les connexions aux bases de données externes pour l'import des incidents.
                    </p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "secondary" : "default"}>
                    {isAdding ? "Annuler" : <><Plus className="mr-2 h-4 w-4" /> Nouvelle Source</>}
                </Button>
            </div>

            {/* Content */}
            <div className="grid gap-8 md:grid-cols-2">

                {/* List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Sources Actives ({sources.length})</h2>

                    {loading ? <p>Chargement...</p> : (
                        <div className="space-y-4">
                            {sources.map(source => (
                                <div key={source.id} className="p-4 border rounded-lg bg-card/50 hover:bg-card transition-colors group relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-primary">{source.name}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${source.env === 'prod' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    source.env === 'stage' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                    {source.env?.toUpperCase() || 'PROD'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1 space-y-1 font-mono">
                                                <p>HOST: <span className="text-foreground">{source.host}</span></p>
                                                <p>DB: <span className="text-foreground">{source.database}</span></p>
                                                <p>TABLE: <span className="text-foreground">{source.table}</span></p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(source.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {source.lastCheck && (
                                        <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex justify-between">
                                            <span>Dernier Sync:</span>
                                            <span>{new Date(source.lastCheck).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {sources.length === 0 && !loading && (
                                <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                                    Aucune source configurée.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Form */}
                {isAdding && (
                    <div className="bg-card border rounded-lg p-6 h-fit sticky top-6 animate-in slide-in-from-right-4">
                        <h2 className="text-xl font-semibold mb-6">Ajouter une connexion</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nom de l'Application (Label)</label>
                                <input
                                    required
                                    className="w-full bg-background border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Ex: Maindar Production"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Ce nom sera utilisé pour regrouper les incidents dans le Dashboard.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Environnement</label>
                                <select
                                    className="w-full bg-background border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
                                    value={formData.env}
                                    onChange={e => setFormData({ ...formData, env: e.target.value })}
                                >
                                    <option value="prod">Production (PROD)</option>
                                    <option value="stage">Staging (STAGE)</option>
                                    <option value="dev">Developpement (DEV)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Host / Serveur</label>
                                    <input
                                        required
                                        className="w-full bg-background border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="server.database.windows.net"
                                        value={formData.host}
                                        onChange={e => setFormData({ ...formData, host: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Base de Données</label>
                                    <input
                                        required
                                        className="w-full bg-background border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="MaBaseDB"
                                        value={formData.database}
                                        onChange={e => setFormData({ ...formData, database: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Table SQL</label>
                                <input
                                    required
                                    className="w-full bg-background border rounded-md p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="dbo.ErrorLogs"
                                    value={formData.table}
                                    onChange={e => setFormData({ ...formData, table: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Annuler</Button>
                                <Button type="submit">Enregistrer la connexion</Button>
                            </div>

                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
