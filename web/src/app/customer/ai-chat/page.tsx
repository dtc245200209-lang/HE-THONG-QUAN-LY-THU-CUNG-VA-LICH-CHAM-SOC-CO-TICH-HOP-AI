import React from 'react';
import { AIChatWidget } from '@/components/ai/AIChatWidget';

export default function AIChatPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">PetCare AI Assistant</h1>
        <p className="text-gray-500 mt-2">Hỏi đáp, tư vấn sức khỏe và quản lý lịch trình của thú cưng với trợ lý ảo AI.</p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <AIChatWidget />
        </div>
      </div>
    </div>
  );
}
