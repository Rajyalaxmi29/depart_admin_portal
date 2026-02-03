import { useState } from 'react';
import { Send, Circle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { messages } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface MessageThread {
  id: string;
  psId: string;
  psTitle: string;
  messages: typeof messages;
  unreadCount: number;
}

export default function MessagesPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(messages[0]?.psId || null);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();

  // Group messages by PS
  const threads: MessageThread[] = messages.reduce((acc, msg) => {
    const existing = acc.find((t) => t.psId === msg.psId);
    if (existing) {
      existing.messages.push(msg);
      if (!msg.isRead) existing.unreadCount++;
    } else {
      acc.push({
        id: msg.id,
        psId: msg.psId,
        psTitle: msg.psTitle,
        messages: [msg],
        unreadCount: msg.isRead ? 0 : 1,
      });
    }
    return acc;
  }, [] as MessageThread[]);

  const selectedMessages = messages.filter((m) => m.psId === selectedThread);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    toast({
      title: 'Reply Sent',
      description: 'Your message has been sent to the Institution Admin.',
    });
    setReplyText('');
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Messages / Alerts</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Communication with Institution Admin regarding problem statements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[400px] lg:h-[calc(100vh-220px)]">
          {/* Thread List */}
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
                        {thread.unreadCount > 0 && (
                          <Circle className="w-2 h-2 fill-accent text-accent" />
                        )}
                        <p className="text-xs text-muted-foreground">{thread.psId}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate mt-0.5">
                        {thread.psTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {thread.messages[thread.messages.length - 1].content}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
            {selectedThread ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-border">
                  <p className="text-xs text-muted-foreground">{selectedThread}</p>
                  <h3 className="text-sm font-semibold text-foreground">
                    {threads.find((t) => t.psId === selectedThread)?.psTitle}
                  </h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'max-w-[80%] rounded-lg p-4',
                        msg.senderRole === 'institution_admin'
                          ? 'bg-secondary/50 mr-auto'
                          : 'bg-primary/10 ml-auto'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-foreground">{msg.sender}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.timestamp), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{msg.content}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
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
                      onClick={handleSendReply}
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
