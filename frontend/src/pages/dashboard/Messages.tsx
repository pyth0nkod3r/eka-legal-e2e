import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Paperclip, Check, CheckCheck } from 'lucide-react';
import { api } from '@/services/api';
import { API_BASE_URL } from '@/services/config';
import { Message, Conversation } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initConversation = async () => {
      const res = await api.messages.getConversations();
      if (res.success) {
        setConversations(res.data);
        
        // Logic to handle auto-selection of admin conversation
        if (!conversationId) {
          // Check if there is an existing conversation with admin/lawyer
          const adminConv = res.data.find(c => 
            c.participants.some(p => p.role === 'admin' || p.role === 'lawyer')
          );

          if (adminConv) {
            navigate(`/dashboard/messages/${adminConv.id}`, { replace: true });
          } else {
            // No admin conversation exists - create one
            const createRes = await api.messages.startConversationWithAdmin();
            if (createRes.success && createRes.data?.id) {
              setConversations(prev => {
                // Check uniqueness just in case
                if (prev.some(c => c.id === createRes.data.id)) return prev;
                return [createRes.data, ...prev];
              });
              navigate(`/dashboard/messages/${createRes.data.id}`, { replace: true });
            } else if (res.data.length > 0) {
               // Fallback to first available if admin creation fails for some reason
               navigate(`/dashboard/messages/${res.data[0].id}`, { replace: true });
            }
          }
        }
      }
      setLoading(false);
    };

    initConversation();
  }, [conversationId, navigate]);

  useEffect(() => {
    if (conversationId) {
      // Mark conversation as read and update local list
      api.messages.markConversationRead(conversationId).then(() => {
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ));
        // Dispatch event for layout to update notification count
        window.dispatchEvent(new Event('messages-read'));
      });

      // Fetch messages
      api.messages.getMessages(conversationId).then(res => {
        if (res.success) setMessages(res.data);
      });
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId) return;
    setSending(true);
    const response = await api.messages.sendMessage(conversationId, newMessage);
    if (response.success) {
      setMessages([...messages, response.data]);
      setNewMessage('');
    }
    setSending(false);
  };

  const activeConversation = conversations.find(c => c.id === conversationId);

  // Helper to get participant info
  const getParticipantInfo = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(p => p.role === 'admin' || p.role === 'lawyer');
    const name = otherParticipant?.name || 'Admin';
    const role = otherParticipant?.role || 'admin';
    
    let avatarUrl = otherParticipant?.avatarUrl;
    if (!avatarUrl) {
      avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    } else if (!avatarUrl.startsWith('http')) {
      avatarUrl = `${API_BASE_URL}${avatarUrl}`;
    }
    
    return { name, role, avatarUrl };
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-4">



        {/* Conversations List */}
        <Card className={cn("w-80 shrink-0 flex flex-col", conversationId && "hidden lg:flex")}>
          <CardHeader className="border-b py-4">
            <CardTitle className="text-lg">Messages</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
              </div>
            ) : conversations.length > 0 ? (
              conversations.map(conv => {
                const { name, role, avatarUrl } = getParticipantInfo(conv);
                return (
                  <Link key={conv.id} to={`/dashboard/messages/${conv.id}`} className={cn(
                    "flex items-start gap-3 p-4 border-b hover:bg-muted/50 transition-colors",
                    conversationId === conv.id && "bg-muted"
                  )}>
                    <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-medium text-sm truncate">{name}</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded capitalize font-medium shrink-0">
                            {role}
                          </span>
                        </div>
                        {conv.unreadCount > 0 && <span className="w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center shrink-0">{conv.unreadCount}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || conv.caseTitle}</p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">No conversations yet</div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {conversationId && activeConversation ? (
            <>
              <CardHeader className="border-b py-4 flex flex-row items-center gap-3">
                <Link to="/dashboard/messages" className="lg:hidden">
                  <Button variant="ghost" size="icon"><ChevronLeft className="h-5 w-5" /></Button>
                </Link>
                {(() => {
                   const { name, role, avatarUrl } = getParticipantInfo(activeConversation);
                   return (
                     <>
                       <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
                       <div>
                         <div className="flex items-center gap-2">
                           <CardTitle className="text-base">{name}</CardTitle>
                           <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded capitalize font-medium">
                             {role}
                           </span>
                         </div>
                         <p className="text-xs text-muted-foreground">{activeConversation.caseTitle}</p>
                       </div>
                     </>
                   );
                })()}
              </CardHeader>
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => {
                  const isOwn = msg.senderRole === 'client';
                  return (
                    <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[70%] px-4 py-2 rounded-2xl", isOwn ? "chat-bubble-sent" : "chat-bubble-received")}>
                        <p className="text-sm">{msg.content}</p>
                        <div className={cn("flex items-center gap-1 mt-1 text-xs", isOwn ? "text-primary-foreground/60 justify-end" : "text-muted-foreground")}>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOwn && (msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                  <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1" />
                  <Button variant="gold" size="icon" onClick={handleSend} disabled={!newMessage.trim() || sending}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p>Select a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
