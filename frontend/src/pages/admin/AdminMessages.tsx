import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send, Paperclip, MoreVertical, MessageSquarePlus } from 'lucide-react';
import { api } from '@/services/api';
import { API_BASE_URL } from '@/services/config';
import { Conversation, Message, User } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  // Search clients when query changes
  useEffect(() => {
    if (searchQuery.length >= 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        api.clients.search(searchQuery).then(res => {
          if (res.success) {
            setSearchResults(res.data);
          }
          setIsSearching(false);
        });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleStartConversation = async (client: User) => {
    setSearchQuery('');
    setSearchResults([]);
    
    const res = await api.messages.createConversation(client.id);
    if (res.success && res.data) {
      // Check if conversation already exists in list
      const exists = conversations.find(c => c.id === res.data.id);
      if (!exists) {
        setConversations(prev => [res.data, ...prev]);
      }
      setSelectedConversation(res.data.id);
      toast({
        title: 'Conversation Ready',
        description: `You can now message ${client.name}`,
      });
    } else {
      toast({
        title: 'Error',
        description: res.message || 'Failed to start conversation',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadConversationsAndHandleState = async () => {
      const res = await api.messages.getConversations();
      if (!res.success) {
        setLoading(false);
        return;
      }

      setConversations(res.data);

      // Check if we got client info from navigation state
      const state = location.state as { clientId?: string; clientName?: string } | null;
      if (state?.clientId) {
        const clientName = state.clientName || `Client ${state.clientId}`;

        // Find existing conversation with this client
        const existingConversation = res.data.find(conv =>
          conv.participants.some(p => p.id === state.clientId)
        );

        if (existingConversation) {
          setSelectedConversation(existingConversation.id);
          toast({
            title: 'Conversation Selected',
            description: `Showing conversation with ${clientName}`,
          });
        } else {
          // No existing conversation - create one automatically
          toast({
            title: 'Creating Conversation',
            description: `Starting new conversation with ${clientName}...`,
          });

          const createRes = await api.messages.createConversation(state.clientId);
          if (createRes.success && createRes.data) {
            // Add the new conversation to the list and select it
            setConversations(prev => [createRes.data, ...prev]);
            setSelectedConversation(createRes.data.id);
            toast({
              title: 'Conversation Created',
              description: `You can now message ${clientName}`,
            });
          } else {
            toast({
              title: 'Error',
              description: createRes.message || 'Failed to create conversation',
              variant: 'destructive',
            });
            // Select first conversation if available
            if (res.data.length > 0) {
              setSelectedConversation(res.data[0].id);
            }
          }
        }
      } else if (res.data.length > 0) {
        // No client specified, select first conversation
        setSelectedConversation(res.data[0].id);
      }

      setLoading(false);
    };

    loadConversationsAndHandleState();
  }, [location.state]);

  useEffect(() => {
    if (selectedConversation) {
      // 1. Mark as read
      api.messages.markConversationRead(selectedConversation).then(() => {
        // Trigger a refresh of the unread count in the layout if possible via an event or context
        // For now, reliance on Layout polling or navigation state might be needed.
        // Or we dispatch a custom event for the layout to listen to.
        window.dispatchEvent(new Event('messages-read'));
      });

      // 2. Fetch messages
      api.messages.getMessages(selectedConversation).then(res => {
        if (res.success) setMessages(res.data);
      });
    }
  }, [selectedConversation]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const res = await api.messages.sendMessage(selectedConversation, newMessage);
    if (res.success) {
      setMessages([...messages, res.data]);
      setNewMessage('');
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">Communicate with your clients</p>
          </div>
        </div>

        <Card className="h-[calc(100%-4rem)] overflow-hidden">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-80 border-r flex flex-col">
              <div className="p-4 border-b relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients to message..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Client search results dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute left-4 right-4 mt-1 bg-card border rounded-lg shadow-lg z-[100] max-h-48 overflow-y-auto">
                    {searchResults.map((client) => (
                      <div
                        key={client.id}
                        className="p-3 hover:bg-muted cursor-pointer flex items-center gap-3 border-b last:border-b-0"
                        onClick={() => handleStartConversation(client)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={client.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`} />
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{client.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{client.email}</div>
                        </div>
                        <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div className="absolute left-4 right-4 mt-1 bg-card border rounded-lg shadow-lg z-10 p-3 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                )}
              </div>
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : conversations.length > 0 ? (
                  <div className="divide-y">
                    {conversations.map((conv) => {
                      const participant = conv.participants.find(p => p.role === 'client') || conv.participants[0];
                      const name = participant?.name || 'Unknown';
                      const role = participant?.role || 'Client';
                      
                      let avatarUrl = participant?.avatarUrl;
                      if (!avatarUrl) {
                        avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
                      } else if (!avatarUrl.startsWith('http')) {
                        avatarUrl = `${API_BASE_URL}${avatarUrl}`;
                      }

                      return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={cn(
                          "p-4 cursor-pointer transition-colors",
                          selectedConversation === conv.id ? "bg-muted" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={avatarUrl} className="object-cover" />
                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate">{name}</span>
                              {conv.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize mb-0.5">{role}</div>
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conv.lastMessageAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );})}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No conversations</div>
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const participant = selectedConv.participants.find(p => p.role === 'client') || selectedConv.participants[0];
                        const name = participant?.name || 'Unknown';
                        
                        let avatarUrl = participant?.avatarUrl;
                        if (!avatarUrl) {
                          avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
                        } else if (!avatarUrl.startsWith('http')) {
                          avatarUrl = `${API_BASE_URL}${avatarUrl}`;
                        }
                        
                        return (
                          <>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={avatarUrl} className="object-cover" />
                              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-muted-foreground">Re: {selectedConv.caseTitle || 'General Inquiry'}</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.senderRole === 'lawyer';
                        return (
                          <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                            <div className={cn(
                              "max-w-[70%] rounded-lg p-3",
                              isOwn ? "bg-accent text-accent-foreground" : "bg-muted"
                            )}>
                              <p className="text-sm">{message.content}</p>
                              <p className={cn(
                                "text-xs mt-1",
                                isOwn ? "text-accent-foreground/70" : "text-muted-foreground"
                              )}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1"
                      />
                      <Button variant="gold" size="icon" onClick={handleSend}>
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
