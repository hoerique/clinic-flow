import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

export const ChatWindow = ({ userId, sessionId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, sessionId, message: input }),
            });

            const data = await response.json();
            const aiMsg = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro na conexão.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg h-[600px] flex flex-col shadow-xl border-t-4 border-t-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-primary" />
                    Assistente de Agenda
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-4">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg flex gap-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4 mt-1 flex-shrink-0" /> : <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs">Pensando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t">
                <div className="flex w-full gap-2">
                    <Input
                        placeholder="Digite sua mensagem..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
