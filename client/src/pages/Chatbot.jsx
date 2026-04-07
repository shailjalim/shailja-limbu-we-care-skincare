import React, { useState, useEffect } from 'react';
import { sendChatbotMessage, getChatHistory, clearChatHistory } from '../services/api';

const QUICK_QUESTIONS = [
    'Suggest routine for my skin',
    'Recommend products for acne',
    'How to care for sensitive skin?',
];

const MAX_MESSAGE_LENGTH = 500;

const Chatbot = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I can help with personalized skincare advice based on your profile.',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Load chat history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await getChatHistory();
                const chatMessages = response?.messages || [];
                if (chatMessages.length > 0) {
                    setMessages(chatMessages);
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
                // Keep default message if fetch fails
            } finally {
                setLoadingHistory(false);
            }
        };
        loadHistory();
    }, []);

    const sendMessage = async (value) => {
        const message = String(value || '').trim();
        if (!message || loading) return;

        if (message.length > MAX_MESSAGE_LENGTH) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `Please keep your message within ${MAX_MESSAGE_LENGTH} characters.` },
            ]);
            return;
        }

        const nextMessages = [...messages, { role: 'user', content: message }];
        setMessages(nextMessages);
        setInput('');
        setLoading(true);

        try {
            const history = nextMessages
                .slice(-5)
                .map((item) => ({ role: item.role, content: item.content }));

            const response = await sendChatbotMessage(message, history);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: response.reply || 'No response available right now.' },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: err.message || 'Unable to get response right now. Please try again.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await sendMessage(input);
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear your entire chat history? This cannot be undone.')) {
            return;
        }
        
        try {
            await clearChatHistory();
            setMessages([
                {
                    role: 'assistant',
                    content: 'Hello! I can help with personalized skincare advice based on your profile.',
                },
            ]);
        } catch (err) {
            alert('Failed to clear chat history. Please try again.');
        }
    };

    if (loadingHistory) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8 flex items-center justify-center">
                <div className="text-gray-600">Loading chat history...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-5 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-pink-600">Skincare AI Assistant</h1>
                        <p className="mt-1 text-sm text-gray-600">Ask personalized skincare questions and get simple, profile-aware guidance.</p>
                    </div>
                    <button
                        onClick={handleClearHistory}
                        className="text-xs px-3 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition border border-red-200"
                        title="Delete all chat messages"
                    >
                        Clear History
                    </button>
                </div>

                <div className="px-6 py-4">
                    <div className="mb-4 flex flex-wrap gap-2">
                        {QUICK_QUESTIONS.map((question) => (
                            <button
                                key={question}
                                onClick={() => sendMessage(question)}
                                className="rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm text-pink-700 hover:bg-pink-100 transition"
                                disabled={loading}
                            >
                                {question}
                            </button>
                        ))}
                    </div>

                    <div className="h-[420px] overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="space-y-3">
                            {messages.map((msg, index) => (
                                <div
                                    key={`${msg.role}-${index}`}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                                            msg.role === 'user'
                                                ? 'bg-pink-600 text-white'
                                                : 'bg-white text-gray-800 border border-gray-200'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                                        Typing...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your routine, products, or ingredients..."
                            maxLength={MAX_MESSAGE_LENGTH}
                            className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="rounded-full bg-pink-600 px-6 py-3 text-sm font-medium text-white hover:bg-pink-700 transition disabled:opacity-60"
                            disabled={loading || !input.trim()}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
