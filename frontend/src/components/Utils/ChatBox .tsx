import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  type: "sent" | "received";
}

const ChatBox = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Chào bạn! Bạn cần hỗ trợ gì?", type: "received" },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const chatBoxRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: PointerEvent) => {
            if (!open) return;

            const target = e.target as HTMLElement;

            if (
            chatBoxRef.current?.contains(target) ||
            target.closest(".chat-toggle-btn")
            ) {
            return;
            }

            setOpen(false);
        };

        document.addEventListener("pointerdown", handleClickOutside);
        return () =>
            document.removeEventListener("pointerdown", handleClickOutside);
    }, [open]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: input, type: "sent" },
        ]);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
        {/* Nút chat cố định */}
            <button
                className="chat-toggle-btn"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Open chat"
                >
                <img src="../../public/img/linh_vat_logo.png" alt="Chat Icon" className="chat-icon"></img>
            </button>

            {/* Box chat mở lên phía trên icon */}
            {open && (
                <div className="chat-box" ref={chatBoxRef} onPointerDown={(e) => e.stopPropagation()}>
                <div className="chat-header">
                    <img src="../../public/img/linh_vat_logo.png" alt="Logo" className="chat-header-icon"></img>
                    <span className="mx-2">Trợ lý Celeste Books</span>
                </div>

                <div className="chat-messages">
                    {messages.map((msg) => (
                    <div key={msg.id} className={`message-row ${msg.type}`}>
                        
                        {msg.type === "received" && (
                            <img
                                src="../../public/img/linh_vat_logo.png"
                                alt="Avatar"
                                className="message-icon bot"
                            />                        
                        )}

                        <div className={`message ${msg.type}`}>
                        {msg.text}
                        </div>

                        {msg.type === "sent" && (
                            <img
                                src="../../public/img/69ac12ab-e056-47b3-b0f1-e27966d80ce0.jpg"
                                alt="Avatar"
                                className="message-icon user"
                            />
                        )}

                    </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                </div>

                <div className="chat-input-wrapper">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </form>
                    <button type="button" className="send-btn" onClick={handleSend} aria-label="Gửi">
                        <i className="bi bi-send-arrow-up-fill"></i>                    
                    </button>
                </div>
            </div>
            )}
        </>
    );
};

export default ChatBox;
