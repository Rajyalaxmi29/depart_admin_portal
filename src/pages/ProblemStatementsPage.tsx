import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Eye, Edit, Trash2, Search, Send } from 'lucide-react';
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
  detailedDescription: '',
  faculty: '',
};

const CATEGORY_OPTIONS = ['Software', 'Hardware', 'Hardware/Software'] as const;
const THEME_OPTIONS = ['Academic', 'Non-Academic', 'Community Innovation'] as const;

export default function ProblemStatementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPS, setSelectedPS] = useState<ProblemStatement | null>(null);
  const [editingPS, setEditingPS] = useState<ProblemStatement | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadProblemStatements = useCallback(async () => {
    setIsLoading(true);
    if (!user?.department?.id) {
      setProblemStatements([]);
      setIsLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from('problem_statements')
      .select('*')
      .eq('department_id', user.department.id)
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
  }, [toast, user?.department?.id]);

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
    if (!user?.id || !user?.department?.id) {
      toast({
        title: 'Department not configured',
        description: 'Your account must be linked to a department before creating problem statements.',
        variant: 'destructive',
      });
      return;
    }

    const { data: departmentRow, error: departmentError } = await supabase
      .from('departments')
      .select('id, name')
      .eq('id', user.department.id)
      .single();

    if (departmentError || !departmentRow) {
      toast({
        title: 'Department lookup failed',
        description: departmentError?.message ?? 'Unable to resolve your department details.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const payload = {
      problem_statement_id: generateProblemStatementCode(),
      title: form.title,
      description: form.description,
      category: form.category,
      theme: form.theme,
      detailed_description: form.detailedDescription,
      department: departmentRow.name,
      status: 'pending_review',
      created_by: user.id,
      department_id: departmentRow.id,
      faculty_owner: form.faculty,
      assigned_spoc: null,
      submitted_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };

    const { error } = await supabase.from('problem_statements').insert(payload);

    if (error) {
      toast({ title: 'Failed to create problem statement', description: error.message, variant: 'destructive' });
      setIsSaving(false);
      return;
    }

    toast({
      title: 'Problem Statement Submitted',
      description: 'Your problem statement has been submitted for approval.',
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

  const handleEditOpen = (ps: ProblemStatement) => {
    if (!user?.id || ps.createdBy !== user.id) {
      toast({
        title: 'Not allowed',
        description: 'You can only edit problem statements submitted by you.',
        variant: 'destructive',
      });
      return;
    }

    setEditingPS(ps);
    setEditForm({
      title: ps.title ?? '',
      category: ps.category ?? '',
      theme: ps.theme ?? '',
      description: ps.description ?? '',
      detailedDescription: ps.detailedDescription ?? '',
      faculty: ps.facultyOwner === 'Unassigned' ? '' : ps.facultyOwner,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPS || !user?.department?.id || !user?.id || editingPS.createdBy !== user.id) {
      toast({
        title: 'Not allowed',
        description: 'You can only edit problem statements submitted by you.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from('problem_statements')
      .update({
        title: editForm.title,
        category: editForm.category,
        theme: editForm.theme,
        description: editForm.description,
        detailed_description: editForm.detailedDescription,
        faculty_owner: editForm.faculty,
        last_updated: new Date().toISOString(),
      })
      .eq('id', editingPS.id)
      .eq('department_id', user.department.id);

    if (error) {
      toast({ title: 'Failed to update problem statement', description: error.message, variant: 'destructive' });
      setIsSaving(false);
      return;
    }

    toast({
      title: 'Problem Statement Updated',
      description: 'Your changes have been saved successfully.',
    });
    setIsEditDialogOpen(false);
    setEditingPS(null);
    setIsSaving(false);
    await loadProblemStatements();
  };

  const handleDelete = async (ps: ProblemStatement) => {
    if (!user?.id || ps.createdBy !== user.id) {
      toast({
        title: 'Not allowed',
        description: 'You can only delete problem statements submitted by you.',
        variant: 'destructive',
      });
      return;
    }

    if (ps.status !== 'revision_needed' || !user?.department?.id) {
      toast({
        title: 'Cannot Delete',
        description: 'Only revision needed problem statements can be deleted.',
        variant: 'destructive',
      });
      return;
    }

    const dependentDeletes = await Promise.all([
      supabase.from('problem_statement_attachments').delete().eq('problem_statement_id', ps.id),
      supabase.from('problem_statement_messages').delete().eq('problem_statement_id', ps.id),
      supabase.from('problem_statement_reviews').delete().eq('problem_statement_id', ps.id),
      supabase.from('problem_statement_alerts').delete().eq('problem_statement_id', ps.id),
      supabase.from('submission_batch_items').delete().eq('problem_statement_id', ps.id),
    ]);

    const dependentError = dependentDeletes.find((result) => result.error)?.error;
    if (dependentError) {
      toast({
        title: 'Delete failed',
        description: dependentError.message,
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('problem_statements')
      .delete()
      .eq('id', ps.id)
      .eq('department_id', user.department.id);
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

  const handleResubmit = async (ps: ProblemStatement) => {
    if (!user?.id || ps.createdBy !== user.id) {
      toast({
        title: 'Not allowed',
        description: 'You can only re-submit problem statements submitted by you.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.department?.id || ps.status !== 'revision_needed') return;

    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from('problem_statements')
      .update({
        status: 'pending_review',
        submitted_at: nowIso,
        last_updated: nowIso,
      })
      .eq('id', ps.id)
      .eq('department_id', user.department.id);

    if (error) {
      toast({ title: 'Re-submit failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Problem Statement Re-submitted',
      description: `"${ps.title}" has been sent again for approval.`,
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
          {ps.createdBy === user?.id && (ps.status === 'draft' || ps.status === 'revision_needed' || ps.status === 'pending_review' || ps.status === 'submitted') && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => handleEditOpen(ps)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {ps.createdBy === user?.id && ps.status === 'revision_needed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleResubmit(ps)}
              className="text-primary hover:text-primary/80"
              title="Re-submit"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
          {ps.createdBy === user?.id && ps.status === 'revision_needed' && (
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
              Create and submit problem statements for approval
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
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Problem Statement</DialogTitle>
              <DialogDescription>
                Fill in the details to submit a new problem statement for approval.
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
                      {CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    required
                    value={form.theme}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {THEME_OPTIONS.map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Brief)</Label>
                <Textarea
                  id="description"
                  placeholder="Short summary of the problem statement..."
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detailedDescription">Detailed Description</Label>
                <Textarea
                  id="detailedDescription"
                  placeholder="Enter detailed problem context, constraints, and expected impact..."
                  rows={5}
                  required
                  value={form.detailedDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, detailedDescription: e.target.value }))}
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
                  {isSaving ? 'Submitting...' : 'Submit Problem Statement'}
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
                {selectedPS.detailedDescription && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Detailed Description</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedPS.detailedDescription}</p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(selectedPS.lastUpdated).toLocaleString()}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Problem Statement</DialogTitle>
              <DialogDescription>
                Update and save your problem statement details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => void handleUpdatePS(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter problem statement title"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    required
                    value={editForm.category}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-theme">Theme</Label>
                  <Select
                    required
                    value={editForm.theme}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger id="edit-theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {THEME_OPTIONS.map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Brief)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Short summary of the problem statement..."
                  rows={3}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-detailedDescription">Detailed Description</Label>
                <Textarea
                  id="edit-detailedDescription"
                  placeholder="Enter detailed problem context, constraints, and expected impact..."
                  rows={5}
                  required
                  value={editForm.detailedDescription}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, detailedDescription: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-faculty">Faculty Owner</Label>
                <Input
                  id="edit-faculty"
                  placeholder="Faculty name"
                  required
                  value={editForm.faculty}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, faculty: e.target.value }))}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}


