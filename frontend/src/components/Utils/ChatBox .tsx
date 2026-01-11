import React, { useState, useRef, useEffect } from "react";
import InformationForm from "./InformationForm";
import "../../assets/css/conversation.css";
import axios from "axios";

interface Message {
  id: number;
  text: string;
  type: "sent" | "received"
}
interface GeminiModel {
  name: string;
  supportedGenerationMethods?: string[];
}

interface GeminiListResponse {
  models: GeminiModel[];
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  [key: string]: unknown; 
}


const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Chào bạn! Bạn cần hỗ trợ gì?", type: "received" },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  
  // State lưu tên Model chuẩn tìm được từ Google
  const [activeModel, setActiveModel] = useState("gemini-1.5-flash"); 
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [input, setInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // === 1. TỰ ĐỘNG TÌM MODEL CHUẨN TRONG DANH SÁCH ===
 // === 1. TỰ ĐỘNG TÌM MODEL CHUẨN TRONG DANH SÁCH ===
useEffect(() => {
  if (API_KEY) {
    console.log("🔍 Đang tìm model phù hợp...");
    fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`)
      .then((res) => res.json())
      // 👇 SỬA Ở ĐÂY: Gán kiểu GeminiListResponse cho data
      .then((data: GeminiListResponse) => {
        if (data.models) {
          // 👇 SỬA Ở ĐÂY: Xóa bỏ ": any".
          // TypeScript sẽ tự hiểu "m" là GeminiModel nhờ vào interface bên trên.
          const bestModel =
            data.models.find(
              (m) =>
                m.name.includes("flash") &&
                m.supportedGenerationMethods?.includes("generateContent")
            ) ||
            data.models.find(
              (m) =>
                m.name.includes("gemini") &&
                m.supportedGenerationMethods?.includes("generateContent")
            );

          if (bestModel) {
            const cleanName = bestModel.name.replace("models/", "");
            console.log("✅ Đã chọn được model chuẩn:", cleanName);
            setActiveModel(cleanName);
          }
        }
      })
      .catch((err) => console.error("❌ Lỗi check model:", err));
  }
}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, isSubmitted, isThinking]);

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (!open) return;
      const target = e.target as HTMLElement;
      if (chatBoxRef.current?.contains(target) || target.closest(".chat-toggle-btn")) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [open]);

  // === 2. HÀM GỌI API DÙNG MODEL ĐÃ TÌM ĐƯỢC ===
  const generateBotResponse = async (currentMessages: Message[]) => {
    if (!API_KEY) return;
    setIsThinking(true);
    const lastUserMessage = currentMessages[currentMessages.length - 1].text;

    try {
      console.log(`🚀 Đang gọi API với model: ${activeModel}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: lastUserMessage }] }]
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Lỗi chi tiết:", JSON.stringify(data, null, 2));
        throw new Error(data.error?.message || "Lỗi API");
      }

      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không hiểu ý bạn.";
      setMessages((prev) => [...prev, { id: Date.now(), text: botText, type: "received" }]);

    } catch (error) {
      console.error("Lỗi fetch:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: "Hệ thống đang bận, vui lòng thử lại sau.", type: "received" },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) return alert("Vui lòng nhập tên và SĐT");
    setIsSubmitted(true);
    if (formData.message) {
      const newMsg: Message = { id: Date.now(), text: formData.message, type: "sent" };
      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      generateBotResponse(updatedMessages);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = { id: Date.now(), text: input, type: "sent" };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput("");
    generateBotResponse(updatedMessages);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
const [userLogged, setUserLogged] = useState<User | null>(null);
  useEffect(() => {
    // 1. Lấy token đã lưu khi đăng nhập (ví dụ lưu trong localStorage)
    const token = localStorage.getItem('access_token'); 

    if (token) {
      // 2. Gọi API lấy user
      axios.get<User>('http://localhost:8000/api/user', {
        headers: {
          // Quan trọng: Phải gửi kèm Token dạng Bearer
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      })
      .then(response => {
        // 3. API trả về thông tin user, lưu vào state
        console.log("User đang đăng nhập:", response.data);
        setUserLogged(response.data);
      })
      .catch(error => {
        console.error("Lỗi xác thực hoặc token hết hạn:", error);
      });
    }
  }, []);
  return (
    <>
      <button className="chat-toggle-btn" onClick={() => setOpen((prev) => !prev)}>
        <img src="/img/linh_vat_logo.png" alt="Chat Icon" className="chat-icon" />
      </button>

      {open && (
        <div className="chat-box" ref={chatBoxRef} onPointerDown={(e) => e.stopPropagation()}>
          <div className="chat-header">
            <img src="/img/linh_vat_logo.png" alt="Logo" className="chat-header-icon" />
            <span className="mx-2">Trợ lý Celeste Books</span>
          </div>

          <div className="chat-content-scroller" style={{ flex: 1, overflowY: "auto" }}>
            {userLogged ? (
              /* TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP */
              <div className="chat-messages p-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message-row ${msg.type}`}>
                    {msg.type === "received" && <img src="/img/linh_vat_logo.png" className="message-icon bot" />}
                    <div className={`message ${msg.type}`}>{msg.text}</div>
                    {msg.type === "sent" && <img src="/img/69ac12ab-e056-47b3-b0f1-e27966d80ce0.jpg" className="message-icon user" />}
                  </div>
                ))}
                {isThinking && (
                  <div className="message-row received">
                    <img src="/img/linh_vat_logo.png" className="message-icon bot" />
                    <div className="message received italic text-gray-400 text-sm">Đang suy nghĩ...</div>
                  </div>
                )}
                <div ref={messagesEndRef}></div>
              </div>
            ) : (
              !isSubmitted ? (
                <div className="chat-form-container p-3">
                  <InformationForm type="text" namelabel="Nhập tên" name="name" value={formData.name} onChange={handleChange} />
                  <InformationForm type="text" namelabel="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} />
                  <InformationForm type="text" namelabel="Email" name="email" value={formData.email} onChange={handleChange} />
                  <InformationForm type="select" namelabel="Dịch vụ" name="service" value={formData.service} onChange={handleChange} />
                  <InformationForm type="text" namelabel="Tin nhắn" name="message" value={formData.message} onChange={handleChange} />

                  <div className="w-full mt-2">
                    <button type="button" onClick={handleSubmit} className="w-full bg-red-100 text-red-500 font-bold py-2 px-4 rounded mt-2 flex items-center justify-center gap-2 hover:bg-red-200">
                      <span>Bắt đầu trò chuyện</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="chat-messages p-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`message-row ${msg.type}`}>
                      {msg.type === "received" && <img src="/img/linh_vat_logo.png" className="message-icon bot" />}
                      <div className={`message ${msg.type}`}>{msg.text}</div>
                      {msg.type === "sent" && <img src="/img/69ac12ab-e056-47b3-b0f1-e27966d80ce0.jpg" className="message-icon user" />}
                    </div>
                  ))}
                  {isThinking && (
                    <div className="message-row received">
                      <img src="/img/linh_vat_logo.png" className="message-icon bot" />
                      <div className="message received italic text-gray-400 text-sm">Đang suy nghĩ...</div>
                    </div>
                  )}
                  <div ref={messagesEndRef}></div>
                </div>
              )
            )}
          </div>

          {/* Ô NHẬP LIỆU (Chỉ hiện khi đã submit form) */}
          {isSubmitted && (
            <div className="chat-input-wrapper">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full">
                <input className="text-black" type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={isThinking} />
                <button type="submit" className="send-btn" disabled={isThinking}><i className="bi bi-send-arrow-up-fill">Gửi</i></button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
    
  
};

export default ChatBox;