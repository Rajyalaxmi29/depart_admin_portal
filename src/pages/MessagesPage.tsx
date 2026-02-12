import { useCallback, useEffect, useMemo, useState } from 'react';
import { Send, Circle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface MessageRow {
  id: string;
  problem_statement_id: string;
  sender_id: string | null;
  sender_role: string | null;
  recipient_role: string | null;
  content: string;
  created_at: string;
  is_read: boolean;
  problem_statements?: { title?: string; problem_statement_id?: string } | { title?: string; problem_statement_id?: string }[];
}

interface MessageThread {
  id: string;
  psId: string;
  psTitle: string;
  messages: MessageRow[];
  unreadCount: number;
}

export default function MessagesPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [rows, setRows] = useState<MessageRow[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('problem_statement_messages')
      .select('id,problem_statement_id,sender_id,sender_role,recipient_role,content,created_at,is_read,problem_statements(title,problem_statement_id)')
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: 'Failed to load messages', description: error.message, variant: 'destructive' });
      setRows([]);
      return;
    }

    const safeRows = (data ?? []) as unknown as MessageRow[];
    setRows(safeRows);
    if (!selectedThread && safeRows.length > 0) {
      setSelectedThread(safeRows[0].problem_statement_id);
    }
  }, [selectedThread, toast]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const threads: MessageThread[] = useMemo(
    () =>
      rows.reduce((acc, msg) => {
        const existing = acc.find((t) => t.psId === msg.problem_statement_id);
        const relation = Array.isArray(msg.problem_statements) ? msg.problem_statements[0] : msg.problem_statements;
        const psTitle = relation?.title ?? 'Problem Statement';

        if (existing) {
          existing.messages.push(msg);
          if (!msg.is_read && msg.recipient_role === user?.role) existing.unreadCount++;
        } else {
          acc.push({
            id: msg.id,
            psId: msg.problem_statement_id,
            psTitle,
            messages: [msg],
            unreadCount: !msg.is_read && msg.recipient_role === user?.role ? 1 : 0,
          });
        }
        return acc;
      }, [] as MessageThread[]),
    [rows, user?.role]
  );

  const selectedMessages = useMemo(() => rows.filter((m) => m.problem_statement_id === selectedThread), [rows, selectedThread]);

  useEffect(() => {
    const markRead = async () => {
      if (!selectedThread || !user?.role) return;
      await supabase
        .from('problem_statement_messages')
        .update({ is_read: true })
        .eq('problem_statement_id', selectedThread)
        .eq('recipient_role', user.role)
        .eq('is_read', false);
      setRows((prev) =>
        prev.map((m) =>
          m.problem_statement_id === selectedThread && m.recipient_role === user.role ? { ...m, is_read: true } : m
        )
      );
    };

    void markRead();
  }, [selectedThread, user?.role]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedThread) return;

    const recipientRole = user?.role === 'department_admin' ? 'institution_admin' : 'department_admin';

    const { error } = await supabase.from('problem_statement_messages').insert({
      problem_statement_id: selectedThread,
      sender_id: user?.id,
      sender_role: user?.role,
      recipient_role: recipientRole,
      content: replyText.trim(),
      is_read: false,
    });

    if (error) {
      toast({ title: 'Failed to send message', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Reply Sent',
      description: 'Your message has been sent to the Institution Admin.',
    });
    setReplyText('');
    await loadMessages();
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Messages / Alerts</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Communication with Institution Admin regarding problem statements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[400px] lg:h-[calc(100vh-220px)]">
          <div className="lg:col-span-1 bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Conversations</h3>
            </div>
            <div className="divide-y divide-border overflow-y-auto max-h-[calc(100vh-300px)]">
              {threads.map((thread) => (
                <button
                  key={thread.psId}
                  onClick={() => setSelectedThread(thread.psId)}
                  className={cn(
                    'w-full p-4 text-left hover:bg-secondary/50 transition-colors',
                    selectedThread === thread.psId && 'bg-secondary'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {thread.unreadCount > 0 && <Circle className="w-2 h-2 fill-accent text-accent" />}
                        <p className="text-xs text-muted-foreground">{thread.psId}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate mt-0.5">{thread.psTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {thread.messages[thread.messages.length - 1]?.content}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
            {selectedThread ? (
              <>
                <div className="p-4 border-b border-border">
                  <p className="text-xs text-muted-foreground">{selectedThread}</p>
                  <h3 className="text-sm font-semibold text-foreground">
                    {threads.find((t) => t.psId === selectedThread)?.psTitle}
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'max-w-[80%] rounded-lg p-4',
                        msg.sender_role === 'institution_admin' ? 'bg-secondary/50 mr-auto' : 'bg-primary/10 ml-auto'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-foreground">
                          {msg.sender_role === 'institution_admin' ? 'Institution Admin' : 'Department Admin'}
                        </p>
                        <span className="text-xs text-muted-foreground">{format(new Date(msg.created_at), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-foreground">{msg.content}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                      className="flex-1 resize-none"
                    />
                    <Button
                      onClick={() => void handleSendReply()}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground self-end"
                      disabled={!replyText.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


