import React, { useState, useRef, useEffect } from "react";
import InformationForm from "./InformationForm";
import "../../assets/css/conversation.css";
import axios from "axios";

// --- 1. IMPORT DỮ LIỆU TỪ FILE LOCAL ---
// Đảm bảo file Product.js có dòng: export const products = [...]
import { products } from "./Product";

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
    { id: 1, text: "Chào bạn! Celeste Books có thể giúp gì cho bạn?", type: "received" },
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
  const [userLogged, setUserLogged] = useState<User | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // === TỰ ĐỘNG TÌM MODEL CHUẨN ===
  useEffect(() => {
    if (API_KEY) {
      fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`)
        .then((res) => res.json())
        .then((data: GeminiListResponse) => {
          if (data.models) {
            const bestModel =
              data.models.find((m) => m.name.includes("flash") && m.supportedGenerationMethods?.includes("generateContent")) ||
              data.models.find((m) => m.name.includes("gemini") && m.supportedGenerationMethods?.includes("generateContent"));

            if (bestModel) {
              setActiveModel(bestModel.name.replace("models/", ""));
            }
          }
        })
        .catch((err) => console.error("❌ Lỗi check model:", err));
    }
  }, []);

  // === LẤY THÔNG TIN USER NẾU ĐÃ ĐĂNG NHẬP ===
  useEffect(() => {
    const token = localStorage.getItem('access_token'); 
    if (token) {
      axios.get<User>('http://localhost:8000/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      })
      .then(response => {
        setUserLogged(response.data);
      })
      .catch(error => {
        console.error("Lỗi xác thực:", error);
      });
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

  // === 2. HÀM GỌI API GEMINI (ĐÃ TÍCH HỢP DỮ LIỆU SẢN PHẨM) ===
  const generateBotResponse = async (currentMessages: Message[]) => {
    if (!API_KEY) return;
    setIsThinking(true);
    
    // Lấy câu hỏi mới nhất của người dùng
    const lastUserMessage = currentMessages[currentMessages.length - 1].text;

    try {
      // --- BƯỚC A: BIẾN DỮ LIỆU FILE PRODUCT.JS THÀNH VĂN BẢN ---
      // (Giả sử file Product.js export mảng products có các trường: name, sale_price, author...)
      const productsContext = Array.isArray(products) && products.length > 0 
        ? products.map((p: any) => {
            return `- Tên sách: "${p.name}"
              Giá bán: ${p.sale_price ? Number(p.sale_price).toLocaleString('vi-VN') + 'đ' : "Liên hệ"}
              Tác giả: ${p.author || "Đang cập nhật"}
              Mô tả ngắn: ${p.description ? p.description.substring(0, 100) + "..." : "..."}`;
          }).join("\n---\n")
        : "Hiện chưa có dữ liệu sản phẩm.";

      // --- BƯỚC B: TẠO PROMPT KÈM DỮ LIỆU ---
      const finalPrompt = `
Bạn là nhân viên tư vấn ảo của nhà sách Celeste Books.
Dưới đây là danh sách các cuốn sách hiện có trong kho dữ liệu của chúng ta:

${productsContext}

HƯỚNG DẪN TRẢ LỜI:
1. Chỉ trả lời dựa trên danh sách sách ở trên.
2. Nếu khách hỏi sách không có trong danh sách, hãy trả lời lịch sự rằng "Hiện nhà sách chưa có cuốn này".
3. Cung cấp thông tin giá và tác giả nếu có.
4. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.

KHÁCH HÀNG HỎI: "${lastUserMessage}"
TRẢ LỜI:`;

      // --- BƯỚC C: GỬI LÊN GOOGLE ---
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }]
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
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

  return (
    <>
      <button className="chat-toggle-btn" onClick={() => setOpen((prev) => !prev)}>
        <img src="/img/linh_vat_logo.png" alt="Chat Icon" className="chat-icon" />
      </button>

      {open && (
        <div className="chat-box flex flex-col" ref={chatBoxRef} onPointerDown={(e) => e.stopPropagation()}>
          <div className="chat-header">
            <img src="/img/linh_vat_logo.png" alt="Logo" className="chat-header-icon" />
            <span className="mx-2">Trợ lý Celeste Books</span>
          </div>

          <div className="chat-content-scroller" style={{ flex: 1, overflowY: "auto" }}>
            {userLogged ? (
              // Giao diện khi ĐÃ đăng nhập
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
              // Giao diện khi CHƯA đăng nhập
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

          {(isSubmitted || userLogged) && (
            <div className="chat-input-wrapper p-3 bg-white border-t border-gray-200 shrink-0 z-10">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
              <input 
                className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-black"
                type="text" 
                placeholder="Hỏi về sách..."
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                disabled={isThinking} 
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors disabled:bg-gray-300"
                disabled={isThinking}
              >
                <i className="bi bi-send-fill text-sm"></i>
              </button>
            </form>
          </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox;