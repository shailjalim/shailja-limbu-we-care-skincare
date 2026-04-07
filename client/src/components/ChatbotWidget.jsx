import React, { useMemo, useState } from 'react';
import { isAuthenticated, sendChatbotMessage } from '../services/api';

const QUICK_QUESTIONS = [
    'Suggest routine for my skin',
    'Recommend products for acne',
    'How to care for sensitive skin?',
];

const MAX_MESSAGE_LENGTH = 500;

const ChatbotWidget = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi, I can help with skincare guidance tailored to your profile.' },
    ]);

    const loggedIn = useMemo(() => isAuthenticated(), []);

    if (!loggedIn) return null;

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
                { role: 'assistant', content: response.reply || 'I could not respond right now.' },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: err.message || 'Unable to respond right now. Please try again.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-[60]">
            {open && (
                <div className="mb-3 w-[340px] rounded-3xl border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-900">Skincare AI Assistant</h3>
                        <button
                            onClick={() => setOpen(false)}
                            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                            aria-label="Close chatbot"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="max-h-[330px] overflow-y-auto bg-gray-50 px-3 py-3">
                        <div className="mb-2 flex flex-wrap gap-2">
                            {QUICK_QUESTIONS.map((question) => (
                                <button
                                    key={question}
                                    onClick={() => sendMessage(question)}
                                    className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs text-pink-700 hover:bg-pink-100"
                                    disabled={loading}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {messages.map((msg, index) => (
                                <div key={`${msg.role}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
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
                                    <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                                        Typing...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            await sendMessage(input);
                        }}
                        className="flex items-center gap-2 border-t border-gray-200 px-3 py-3"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            maxLength={MAX_MESSAGE_LENGTH}
                            placeholder="Ask a skincare question..."
                            className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="rounded-full bg-pink-600 px-3 py-2 text-xs font-medium text-white hover:bg-pink-700 disabled:opacity-60"
                            disabled={loading || !input.trim()}
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setOpen((prev) => !prev)}
                className="rounded-full bg-pink-600 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-pink-700"
            >
                {open ? 'Close Chat' : 'AI Chat'}
            </button>
        </div>
    );
};

export default ChatbotWidget;
