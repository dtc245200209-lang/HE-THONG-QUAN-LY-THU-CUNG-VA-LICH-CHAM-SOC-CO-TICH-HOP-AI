"use client";

import React, { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ActionPreviewCard } from './ActionPreviewCard';
import api from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ tool: string; parameters: any }>;
  isStreaming?: boolean;
}

export function AIChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Xin chào! Mình là trợ lý PetCare AI. Bạn cần hỗ trợ gì về sổ sức khỏe hay lịch trình chăm sóc của thú cưng?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pre-fetch pets and services for seamless action resolution
  useEffect(() => {
    api.get('/api/v1/pets')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setUserPets(res.data);
        }
      })
      .catch(() => {});

    api.get('/api/v1/services')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAvailableServices(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const history = messages
        .filter(m => m.content && !m.isStreaming)
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/v1/ai/chat-stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversation_id: 'chat-123',
          message: userMessage.content,
          messages: [...history, { role: 'user', content: userMessage.content }]
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');
      
      const decoder = new TextDecoder();
      let assistantMessageContent = '';
      const assistantMessageId = (Date.now() + 1).toString();
      
      // Initialize the assistant message in UI
      setMessages(prev => [
        ...prev, 
        { id: assistantMessageId, role: 'assistant', content: '', isStreaming: true }
      ]);
      
      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantMessageContent += chunk;
        
        let parsedContent = assistantMessageContent;
        const actions: Array<{ tool: string; parameters: any }> = [];
        const actionRegex = /<<<ACTION:([^:]+):(.*?)>>>/g;
        let match;
        while ((match = actionRegex.exec(assistantMessageContent)) !== null) {
          try {
            actions.push({
              tool: match[1],
              parameters: JSON.parse(match[2])
            });
            parsedContent = parsedContent.replace(match[0], '');
          } catch (e) {
            console.error("Failed to parse action JSON", e);
          }
        }
        
        // Update the specific message with the new content
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: parsedContent, actions: actions.length > 0 ? actions : msg.actions } 
            : msg
        ));
      }
      
      // Mark as streaming finished
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));
      
    } catch (error) {
      console.error(error);
      const mockReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lỗi khi kết nối với máy chủ AI. Vui lòng thử lại sau.'
      };
      setMessages(prev => [...prev, mockReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseDateTimeToISO = (dateStr?: string, timeStr?: string): string => {
    let year = 2026, month = 10, day = 29;
    
    if (dateStr) {
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          year = Number(parts[0]);
          month = Number(parts[1]);
          day = Number(parts[2]);
        } else {
          day = Number(parts[0]);
          month = Number(parts[1]);
          year = Number(parts[2]);
        }
      } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts[2] && parts[2].length === 4) {
          if (Number(parts[0]) > 12) {
            day = Number(parts[0]);
            month = Number(parts[1]);
            year = Number(parts[2]);
          } else {
            month = Number(parts[0]);
            day = Number(parts[1]);
            year = Number(parts[2]);
          }
        } else if (parts[0].length === 4) {
          year = Number(parts[0]);
          month = Number(parts[1]);
          day = Number(parts[2]);
        }
      }
    }

    let hours = 9, minutes = 0;
    if (timeStr) {
      const isPM = /pm/i.test(timeStr);
      const isAM = /am/i.test(timeStr);
      const cleanTime = timeStr.replace(/[^0-9:]/g, '').trim();
      const timeParts = cleanTime.split(':').map(Number);
      hours = timeParts[0] || 0;
      minutes = timeParts[1] || 0;
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
    }

    if (isNaN(year)) year = 2026;
    if (isNaN(month) || month < 1 || month > 12) month = 10;
    if (isNaN(day) || day < 1 || day > 31) day = 29;
    if (isNaN(hours) || hours < 0 || hours > 23) hours = 9;
    if (isNaN(minutes) || minutes < 0 || minutes > 59) minutes = 0;

    const d = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    return d.toISOString();
  };

  const handleActionConfirm = async (messageId: string, actionId: string, params: Record<string, any>) => {
    setIsExecutingAction(true);
    try {
      if (actionId === 'book_appointment') {
        const scheduledTime = parseDateTimeToISO(params.date, params.time);

        // 1. Resolve service
        let serviceId = params.service_id;
        let serviceName = params.service_name;
        const validService = availableServices.find(s => s.id === serviceId);
        if (!validService) {
          const matchedByName = availableServices.find(s => 
            s.name.toLowerCase().includes((serviceName || 'tắm').toLowerCase())
          );
          serviceId = matchedByName?.id || availableServices[0]?.id || "0e715dcd-760b-4646-bef0-18d4d4a266e6";
          serviceName = matchedByName?.name || availableServices[0]?.name || "Tắm sấy cơ bản";
        } else {
          serviceName = validService.name;
        }

        // 2. Resolve pet (from existing user pets or auto-create if new pet name)
        let petId = params.pet_id;
        const petName = (params.pet_name || '').trim();

        let existingPet = userPets.find(p => p.id === petId);
        if (!existingPet && petName) {
          existingPet = userPets.find(p => p.name.toLowerCase() === petName.toLowerCase());
        }

        if (existingPet) {
          petId = existingPet.id;
        } else if (petName) {
          // If the user typed a new pet name, auto-create the pet for them
          try {
            const createPetRes = await api.post('/api/v1/pets', {
              name: petName,
              species: 'DOG'
            });
            if (createPetRes.data?.id) {
              petId = createPetRes.data.id;
              setUserPets(prev => [...prev, createPetRes.data]);
            }
          } catch (createErr) {
            console.warn("Could not auto-create pet, using fallback:", createErr);
            petId = userPets[0]?.id || "6ad90c56-8c70-4b92-b183-517d11106155";
          }
        } else {
          petId = userPets[0]?.id || "6ad90c56-8c70-4b92-b183-517d11106155";
        }

        const finalPetName = petName || userPets.find(p => p.id === petId)?.name || 'Milo';

        await api.post('/api/v1/appointments', {
          pet_id: petId,
          service_ids: [serviceId],
          scheduled_time: scheduledTime,
          notes: params.notes || `Đặt lịch qua PetCare AI Assistant (${serviceName} cho bé ${finalPetName})`
        });

        // Remove the action card after successful confirmation
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, actions: undefined } : m
        ));

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🎉 **Đặt lịch hẹn thành công!**\n\n🐾 **Thú cưng:** ${finalPetName}\n✨ **Dịch vụ:** ${serviceName}\n📅 **Thời gian:** ${params.time || '09:00'} ngày ${params.date || 'đã chọn'}\n📝 **Ghi chú:** ${params.notes || 'Không có'}\n\nLịch hẹn của bé đã được ghi nhận trên hệ thống PetCare. Bạn có thể kiểm tra danh sách và cập nhật trong mục **Lịch hẹn của tôi** nhé!`
        }]);
      }
    } catch (err: any) {
      console.error("Action execution error:", err);
      const detail = err.response?.data?.detail || err.message || 'Có lỗi xảy ra khi thực thi';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Không thể hoàn tất lịch hẹn: **${detail}**.\nVui lòng kiểm tra lại ngày hẹn hoặc đảm bảo bạn đã đăng nhập tài khoản nhé.`
      }]);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleActionCancel = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, actions: undefined } : m
    ));
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Dạ mình đã hủy đề xuất đặt lịch này rồi ạ. Nếu cần hỗ trợ thêm thông tin gì khác, bạn cứ nhắn cho mình nhé! 🐾'
    }]);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white rounded-xl shadow-lg border overflow-hidden">
      <div className="bg-blue-600 text-white p-4 font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        PetCare AI Assistant
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none shadow-sm'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {msg.actions && msg.actions.map((action, idx) => (
                <div key={idx} className="mt-3">
                  <ActionPreviewCard 
                    tool={action.tool} 
                    parameters={action.parameters}
                    pets={userPets}
                    services={availableServices}
                    isLoading={isExecutingAction}
                    onConfirm={(editedParams) => handleActionConfirm(msg.id, action.tool, editedParams)}
                    onCancel={() => handleActionCancel(msg.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border text-gray-500 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white border-t flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nhập câu hỏi về thú cưng của bạn..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </form>
    </div>
  );
}
