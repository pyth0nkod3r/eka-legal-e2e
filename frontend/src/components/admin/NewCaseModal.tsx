import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { User } from '@/types';

interface NewCaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const caseTypes = [
    'Corporate Law',
    'Estate Planning',
    'Civil Litigation',
    'Contract Law',
    'Business Formation',
    'Intellectual Property',
    'Personal Injury',
    'Immigration',
];

export default function NewCaseModal({ open, onOpenChange, onSuccess }: NewCaseModalProps) {
    const [clientId, setClientId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [caseType, setCaseType] = useState('');
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            api.clients.getAll().then((res) => {
                if (res.success) {
                    setClients(res.data);
                }
                setLoadingClients(false);
            });
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await api.cases.createCase({
            clientId,
            title,
            description,
            caseType,
        });

        if (result.success) {
            toast({ title: 'Success', description: 'Case created successfully!' });
            setClientId('');
            setTitle('');
            setDescription('');
            setCaseType('');
            onOpenChange(false);
            onSuccess?.();
        } else {
            toast({ title: 'Error', description: result.message || 'Failed to create case', variant: 'destructive' });
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Case</DialogTitle>
                    <DialogDescription>
                        Open a new case for a client.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="client">Client</Label>
                            <Select value={clientId} onValueChange={setClientId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingClients ? 'Loading clients...' : 'Select a client'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name} ({client.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Case Title</Label>
                            <Input
                                id="title"
                                placeholder="Business Contract Review"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="caseType">Case Type</Label>
                            <Select value={caseType} onValueChange={setCaseType} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select case type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {caseTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the case..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="gold" disabled={loading || !clientId}>
                            {loading ? 'Creating...' : 'Create Case'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
