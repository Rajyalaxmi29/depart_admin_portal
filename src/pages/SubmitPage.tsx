import { useCallback, useEffect, useState } from 'react';
import { Upload, FileText, Send, CheckCircle, File as FileIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ProblemStatement } from '@/types/app';
import { supabase } from '@/lib/supabase';
import { mapProblemStatement } from '@/lib/problemStatements';
import { useAuth } from '@/contexts/AuthContext';

export default function SubmitPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readyToSubmit, setReadyToSubmit] = useState<ProblemStatement[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadReadyStatements = useCallback(async () => {
    const { data, error } = await supabase
      .from('problem_statements')
      .select('*')
      .in('status', ['draft', 'revision_needed'])
      .order('last_updated', { ascending: false, nullsFirst: false });

    if (error) {
      toast({ title: 'Failed to load submissions', description: error.message, variant: 'destructive' });
      setReadyToSubmit([]);
      return;
    }

    setReadyToSubmit((data ?? []).map(mapProblemStatement));
  }, [toast]);

  useEffect(() => {
    void loadReadyStatements();
  }, [loadReadyStatements]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (readyToSubmit.length === 0 || !user?.id) return;
    setIsSubmitting(true);

    const { data: batch, error: batchError } = await supabase
      .from('submission_batches')
      .insert({
        department_id: user.department.id ?? null,
        submitted_by: user.id,
        status: 'submitted',
      })
      .select('id')
      .single();

    if (batchError || !batch) {
      toast({ title: 'Submission failed', description: batchError?.message ?? 'Unable to create submission batch', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const psIds = readyToSubmit.map((ps) => ps.id);
    const nowIso = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('problem_statements')
      .update({
        status: 'submitted',
        submission_batch_id: batch.id,
        submitted_at: nowIso,
        last_updated: nowIso,
      })
      .in('id', psIds);

    if (updateError) {
      toast({ title: 'Submission failed', description: updateError.message, variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const batchItems = psIds.map((id) => ({ batch_id: batch.id, problem_statement_id: id }));
    await supabase.from('submission_batch_items').insert(batchItems);

    if (uploadedFile) {
      await Promise.all(
        readyToSubmit.map(async (ps) => {
          const objectPath = `${user.id}/${ps.id}/${Date.now()}-${uploadedFile.name}`;
          const { error: uploadError } = await supabase.storage.from('ps-documents').upload(objectPath, uploadedFile, {
            cacheControl: '3600',
            upsert: false,
          });

          if (!uploadError) {
            await supabase.from('problem_statement_attachments').insert({
              problem_statement_id: ps.id,
              uploaded_by: user.id,
              file_name: uploadedFile.name,
              object_path: objectPath,
              mime_type: uploadedFile.type,
              file_size: uploadedFile.size,
            });
          }
        })
      );
    }

    toast({
      title: 'Submission Successful',
      description: 'Your problem statements have been submitted to the Institution Admin for review.',
    });

    setIsSubmitted(true);
    setUploadedFile(null);
    setIsSubmitting(false);
    await loadReadyStatements();
  };

  if (isSubmitted) {
    return (
      <DashboardLayout>
        <div className="animate-fade-in">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Submission Complete!</h1>
            <p className="text-muted-foreground mb-6">
              Your problem statements have been successfully submitted to the Institution Admin.
              You will receive notifications when there are updates on your submission.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>Submit Another Batch</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Submit Problem Statements</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Submit your problem statements to the Institution for official review
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Submission Template (Preview)
              </h3>
              <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="mb-2"><strong className="text-foreground">Required Fields:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Problem Statement Title</li>
                  <li>Category and Theme</li>
                  <li>Detailed Description (min 200 words)</li>
                  <li>Expected Outcomes</li>
                  <li>Resource Requirements</li>
                  <li>Timeline and Milestones</li>
                  <li>Budget Estimation</li>
                </ul>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Supporting Documents
              </h3>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                  isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileIcon className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)} className="text-destructive">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop files here, or{' '}
                      <label className="text-primary cursor-pointer hover:underline">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xlsx"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-muted-foreground">Supports: PDF, DOC, DOCX, XLSX (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={() => void handleSubmit()}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base"
              disabled={readyToSubmit.length === 0 || isSubmitting}
            >
              <Send className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit to Institution'}
            </Button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Ready to Submit ({readyToSubmit.length})</h3>
              <div className="space-y-3">
                {readyToSubmit.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No problem statements ready for submission</p>
                ) : (
                  readyToSubmit.map((ps) => (
                    <div key={ps.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{ps.psCode}</p>
                          <p className="text-sm font-medium text-foreground truncate">{ps.title}</p>
                        </div>
                        <StatusBadge status={ps.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


