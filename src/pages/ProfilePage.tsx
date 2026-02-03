import { useState } from 'react';
import { User, Mail, Phone, Building, IdCard, Lock, LogOut } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { dashboardMetrics } from '@/data/mockData';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Password Updated',
      description: 'Your password has been changed successfully.',
    });
    setIsPasswordDialogOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent rounded-xl overflow-hidden shadow-card">
          <div className="flex items-center justify-between p-6 md:p-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-lg shadow-md">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">{user?.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-primary flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-sm font-medium text-muted-foreground">Department Admin</span>
                  </span>
                  {user?.department?.location && (
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span>{user.department.location}</span>
                    </span>
                  )}
                  {user?.phone && (
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{user.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Button className="bg-slate-900 text-white px-4 py-2 rounded-md">Edit Profile</Button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{user?.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Faculty ID</Label>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <IdCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{user?.department?.facultyId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Security</h3>
              <div className="space-y-3">
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)} className="w-full justify-start">
                  <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</div>
                </Button>
                <Button variant="destructive" onClick={logout} className="w-full justify-start">
                  <div className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout Session</div>
                </Button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="p-4 bg-secondary/40 rounded-lg">
                <p className="text-xs uppercase tracking-wider text-primary font-semibold">Institution</p>
                <h4 className="text-sm font-semibold text-foreground mt-2">{user?.department?.institution}</h4>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium text-foreground">{user?.department?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Head of Department (HOD)</p>
                  <p className="font-medium text-foreground">{user?.department?.head || 'Dr. Alan Turing'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Innovation Lab</p>
                  <p className="font-medium text-foreground">{user?.department?.innovationLab || 'Room 102-B, CSE Block'}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-secondary/40 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">{dashboardMetrics.totalPrepared}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total PS Submitted</p>
                </div>
                <div className="bg-secondary/40 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">{dashboardMetrics.approved.toString().padStart(2,'0')}</p>
                  <p className="text-xs text-muted-foreground mt-1">Approved This Term</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Dialog (kept) */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and a new password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input id="confirm" type="password" required />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Update Password
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
