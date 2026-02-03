import { useState } from 'react';
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
import { problemStatements, ProblemStatement } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function ProblemStatementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPS, setSelectedPS] = useState<ProblemStatement | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredPS = problemStatements.filter(
    (ps) =>
      ps.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ps.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPS = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Problem Statement Created',
      description: 'Your new problem statement has been saved as a draft.',
    });
    setIsAddDialogOpen(false);
  };

  const handleView = (ps: ProblemStatement) => {
    setSelectedPS(ps);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (ps: ProblemStatement) => {
    if (ps.status !== 'draft') {
      toast({
        title: 'Cannot Delete',
        description: 'Only draft problem statements can be deleted.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Problem Statement Deleted',
      description: `"${ps.title}" has been removed.`,
    });
  };

  const columns = [
    {
      key: 'title',
      header: 'PS Title',
      render: (ps: ProblemStatement) => (
        <div className="min-w-[150px]">
          <p className="text-xs text-muted-foreground">{ps.id}</p>
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
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {ps.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(ps)}
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
        {/* Page Header */}
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

        {/* Search */}
        <div className="relative mb-4 sm:mb-6 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredPS}
          keyExtractor={(ps) => ps.id}
        />

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Problem Statement</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new problem statement draft.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPS} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter problem statement title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sustainability">Sustainability</SelectItem>
                      <SelectItem value="edtech">EdTech</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Input id="theme" placeholder="e.g., Green Campus" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the problem statement..."
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty Owner</Label>
                <Input id="faculty" placeholder="Faculty name" required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Create Draft
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedPS?.title}</DialogTitle>
              <DialogDescription>{selectedPS?.id}</DialogDescription>
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
                  Last updated: {selectedPS.lastUpdated}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
