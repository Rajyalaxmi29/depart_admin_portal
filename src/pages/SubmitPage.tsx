import { useState } from 'react';
import { Upload, FileText, Send, CheckCircle, File } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { problemStatements } from '@/data/mockData';
import { StatusBadge } from '@/components/common/StatusBadge';

export default function SubmitPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const readyToSubmit = problemStatements.filter(
    (ps) => ps.status === 'draft' || ps.status === 'revision_needed'
  );

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

  const handleSubmit = () => {
    toast({
      title: 'Submission Successful',
      description: 'Your problem statements have been submitted to the Institution Admin for review.',
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <DashboardLayout>
        <div className="animate-fade-in">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Submission Complete!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your problem statements have been successfully submitted to the Institution Admin.
              You will receive notifications when there are updates on your submission.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
            >
              Submit Another Batch
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Submit Problem Statements</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Submit your problem statements to the Institution for official review
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Template & Upload */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Template Preview */}
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Submission Template (Preview)
              </h3>
              <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong className="text-foreground">Required Fields:</strong>
                </p>
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

            {/* Upload Area */}
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
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <File className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      className="text-destructive"
                    >
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
                    <p className="text-xs text-muted-foreground">
                      Supports: PDF, DOC, DOCX, XLSX (Max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-base"
              disabled={readyToSubmit.length === 0}
            >
              <Send className="w-5 h-5 mr-2" />
              Submit to Institution
            </Button>
          </div>

          {/* Right Column - Ready to Submit */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Ready to Submit ({readyToSubmit.length})
              </h3>
              <div className="space-y-3">
                {readyToSubmit.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No problem statements ready for submission
                  </p>
                ) : (
                  readyToSubmit.map((ps) => (
                    <div
                      key={ps.id}
                      className="p-3 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{ps.id}</p>
                          <p className="text-sm font-medium text-foreground truncate">
                            {ps.title}
                          </p>
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
