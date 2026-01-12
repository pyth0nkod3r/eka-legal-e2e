import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Paperclip, Check, CheckCheck, X } from 'lucide-react';
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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if ((!newMessage.trim() && !selectedFile) || !conversationId) return;
    setSending(true);
    
    const attachments = selectedFile ? [selectedFile] : undefined;
    const response = await api.messages.sendMessage(conversationId, newMessage, attachments);
    
    if (response.success) {
      setMessages([...messages, response.data]);
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setSending(false);
  };

  const handleDelete = async (msgId: string) => {
    if (!conversationId || !window.confirm("Delete this message?")) return;
    const res = await api.messages.deleteMessage(conversationId, msgId);
    if (res.success) {
        setMessages(prev => prev.map(m => m.id === msgId ? res.data : m));
    }
  };

  const handleEdit = async (msgId: string) => {
      if (!conversationId) return;
      const res = await api.messages.editMessage(conversationId, msgId, editContent);
      if (res.success) {
          setMessages(prev => prev.map(m => m.id === msgId ? res.data : m));
          setEditingMessageId(null);
          setEditContent('');
      }
  };

  const startEditing = (msg: Message) => {
      setEditingMessageId(msg.id);
      setEditContent(msg.content);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
                  const timestamp = new Date(msg.timestamp);
                  const canRecall = isOwn && !msg.deletedAt && (new Date().getTime() - timestamp.getTime()) < 3 * 60 * 1000;
                  const isEditing = editingMessageId === msg.id;

                  return (
                    <div key={msg.id} className={cn("flex group items-end gap-2", isOwn ? "justify-end" : "justify-start")}>
                         {/* Action Buttons for Own Messages (Left side for sent messages) */}
                         {canRecall && !isEditing && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mb-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => startEditing(msg)}>
                                    <span className="sr-only">Edit</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/80" onClick={() => handleDelete(msg.id)}>
                                    <span className="sr-only">Delete</span>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                         )}

                      <div className={cn("max-w-[70%] px-4 py-2 rounded-2xl relative", isOwn ? "chat-bubble-sent" : "chat-bubble-received", msg.deletedAt && "opacity-60 italic border border-dashed bg-transparent text-muted-foreground")}>
                        {msg.attachments && msg.attachments.length > 0 && !msg.deletedAt && (
                          <div className="mb-2 space-y-1">
                            {msg.attachments.map((att) => (
                              <div key={att.id} className="relative group/att">
                                {att.fileType.startsWith('image/') ? (
                                    <a href={`${API_BASE_URL}${att.url}`} target="_blank" rel="noopener noreferrer" className="block">
                                        <img src={`${API_BASE_URL}${att.url}`} alt={att.filename} className="max-w-full rounded-md max-h-48 object-cover hover:opacity-90 transition-opacity" />
                                    </a>
                                ) : (
                                    <a
                                        href={`${API_BASE_URL}${att.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                        "flex items-center gap-2 p-2 rounded text-sm hover:underline",
                                        isOwn ? "bg-black/10 text-white" : "bg-white/50 text-foreground"
                                        )}
                                    >
                                        <Paperclip className="h-3 w-3" />
                                        <span className="truncate max-w-[200px]">{att.filename}</span>
                                    </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <Input 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="bg-background text-foreground text-sm h-8"
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                                    <Button size="sm" variant="default" className="h-6 px-2 text-xs" onClick={() => handleEdit(msg.id)}>Save</Button>
                                </div>
                            </div>
                        ) : (
                             <>
                                <p className="text-sm">{msg.content}</p>
                                {msg.editedAt && !msg.deletedAt && <span className="text-[10px] opacity-70 block text-right mt-1">(edited)</span>}
                             </>
                        )}

                        <div className={cn("flex items-center gap-1 mt-1 text-xs", isOwn ? "text-primary-foreground/60 justify-end" : "text-muted-foreground")}>
                          <span>{timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOwn && !msg.deletedAt && (msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                {selectedFile && selectedFile.type.startsWith('image/') && (
                    <div className="mb-4 relative w-fit">
                        <img 
                            src={URL.createObjectURL(selectedFile)} 
                            alt="Preview" 
                            className="h-32 rounded-lg border shadow-sm object-cover" 
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
                            onClick={() => {
                                setSelectedFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className={selectedFile ? "text-primary bg-primary/10" : ""}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 flex flex-col gap-2">
                    {selectedFile && !selectedFile.type.startsWith('image/') && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md w-fit">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground max-w-[200px] truncate">{selectedFile.name}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 hover:bg-background/80 rounded-full"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <Input 
                      placeholder="Type a message..." 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                    />
                  </div>
                  <Button variant="gold" size="icon" onClick={handleSend} disabled={(!newMessage.trim() && !selectedFile) || sending}>
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
