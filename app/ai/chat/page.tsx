'use client';

import axios from "axios";
import { useState, useRef, useEffect } from "react";
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect( () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim()) return;

        const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: input}];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('/api/ai/chat', {
                messages: updatedMessages
            });
            setMessages([
                ...updatedMessages,
                { role: 'model', content: res.data.response }
            ]);

        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setLoading(false);
        }

    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="h-[500px] overflow-y-scroll border p-4 bg-white rounded">
                {messages.map((msg, i) => (
                    <div key={i} className={`markdown mb-2 ${msg.role === 'user' ? 'flex justify-end': 'p-2 bg-blue-200 rounded-xl'}`}>
                        <span className={`leading-6.5 ${msg.role === 'user' ? 'p-2 max-w-[320px] text-right bg-amber-200 rounded-xl': ''}`}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </span>
                    </div>
                ))}
                {loading && <p>Loading..</p>}
                <div ref={scrollRef} />
            </div>

            <div className="flex gap-2 mt-4">
                  <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                          }
                      }}
                      className="flex-1 border px-3 py-2 rounded resize-none"
                      placeholder="Ask something..."
                      rows={2}
                  />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                    Send
                </button>
            </div>
        </div>
    );
}