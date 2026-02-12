import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { supabase } from '@/lib/supabase';
import { ProblemStatement } from '@/types/app';
import { mapProblemStatement, generateProblemStatementCode } from '@/lib/problemStatements';
import { useAuth } from '@/contexts/AuthContext';

const initialForm = {
  title: '',
  category: '',
  theme: '',
  description: '',
  faculty: '',
};

export default function ProblemStatementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPS, setSelectedPS] = useState<ProblemStatement | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadProblemStatements = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('problem_statements')
      .select('*')
      .order('last_updated', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Failed to load problem statements', description: error.message, variant: 'destructive' });
      setProblemStatements([]);
      setIsLoading(false);
      return;
    }

    setProblemStatements((data ?? []).map(mapProblemStatement));
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    void loadProblemStatements();
  }, [loadProblemStatements]);

  const filteredPS = useMemo(
    () =>
      problemStatements.filter(
        (ps) =>
          ps.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ps.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [problemStatements, searchQuery]
  );

  const handleAddPS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    const payload = {
      problem_statement_id: generateProblemStatementCode(),
      title: form.title,
      description: form.description,
      category: form.category,
      theme: form.theme,
      detailed_description: form.description,
      department: user.department.name,
      status: 'draft',
      created_by: user.id,
      department_id: user.department.id ?? null,
      faculty_owner: form.faculty,
      assigned_spoc: null,
      last_updated: new Date().toISOString(),
    };

    const { error } = await supabase.from('problem_statements').insert(payload);

    if (error) {
      toast({ title: 'Failed to create problem statement', description: error.message, variant: 'destructive' });
      setIsSaving(false);
      return;
    }

    toast({
      title: 'Problem Statement Created',
      description: 'Your new problem statement has been saved as a draft.',
    });
    setForm(initialForm);
    setIsAddDialogOpen(false);
    setIsSaving(false);
    await loadProblemStatements();
  };

  const handleView = (ps: ProblemStatement) => {
    setSelectedPS(ps);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (ps: ProblemStatement) => {
    if (ps.status !== 'draft') {
      toast({
        title: 'Cannot Delete',
        description: 'Only draft problem statements can be deleted.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('problem_statements').delete().eq('id', ps.id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Problem Statement Deleted',
      description: `"${ps.title}" has been removed.`,
    });
    await loadProblemStatements();
  };

  const columns = [
    {
      key: 'title',
      header: 'PS Title',
      render: (ps: ProblemStatement) => (
        <div className="min-w-[150px]">
          <p className="text-xs text-muted-foreground">{ps.psCode}</p>
          <p className="font-medium text-foreground truncate">{ps.title}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category / Theme',
      hideOnMobile: true,
      render: (ps: ProblemStatement) => (
        <div>
          <p className="font-medium text-foreground">{ps.category}</p>
          <p className="text-xs text-muted-foreground">{ps.theme}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (ps: ProblemStatement) => <StatusBadge status={ps.status} />,
    },
    {
      key: 'lastUpdated',
      header: 'Last Updated',
      hideOnMobile: true,
      render: (ps: ProblemStatement) => new Date(ps.lastUpdated).toLocaleDateString(),
    },
    {
      key: 'facultyOwner',
      header: 'Faculty Owner',
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (ps: ProblemStatement) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(ps)}
            className="text-primary"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {(ps.status === 'draft' || ps.status === 'revision_needed') && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {ps.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleDelete(ps)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Problem Statements</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Create and manage problem statements before submission
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New PS
          </Button>
        </div>

        <div className="relative mb-4 sm:mb-6 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading problem statements...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPS}
            keyExtractor={(ps) => ps.id}
          />
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Problem Statement</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new problem statement draft.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => void handleAddPS(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter problem statement title"
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    required
                    value={form.category}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sustainability">Sustainability</SelectItem>
                      <SelectItem value="EdTech">EdTech</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Input
                    id="theme"
                    placeholder="e.g., Green Campus"
                    required
                    value={form.theme}
                    onChange={(e) => setForm((prev) => ({ ...prev, theme: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the problem statement..."
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty Owner</Label>
                <Input
                  id="faculty"
                  placeholder="Faculty name"
                  required
                  value={form.faculty}
                  onChange={(e) => setForm((prev) => ({ ...prev, faculty: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Create Draft'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedPS?.title}</DialogTitle>
              <DialogDescription>{selectedPS?.psCode}</DialogDescription>
            </DialogHeader>
            {selectedPS && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedPS.status} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedPS.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Theme</p>
                    <p className="font-medium">{selectedPS.theme}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Faculty Owner</p>
                    <p className="font-medium">{selectedPS.facultyOwner}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assigned SPOC</p>
                    <p className="font-medium">{selectedPS.assignedSpoc}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Description</p>
                  <p className="text-sm">{selectedPS.description}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(selectedPS.lastUpdated).toLocaleString()}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}


