"use client";
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Clock, ChevronRight, User, Phone, Download } from 'lucide-react';
import Editor from './components/Editor';

export default function Dashboard() {
  const [view, setView] = useState<'dash' | 'editor'>('dash');
  const [savedKPs, setSavedKPs] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('my_kp_list');
    if (data) setSavedKPs(JSON.parse(data));
  }, []);

  if (view === 'editor') return <Editor onBack={() => setView('dash')} />;

  return (
    <div className="min-h-screen bg-[#F7F8F3]">
      {/* Header */}
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#114232] rounded-xl flex items-center justify-center text-white font-bold">SR</div>
          <span className="text-xl font-black tracking-tighter text-[#114232]">SMART PROPOSAL</span>
        </div>
        <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">
          <User size={16}/> Личный кабинет
        </button>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-6">
        {/* Приветствие и кнопка создать */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Ваши КП</h1>
            <p className="text-gray-500 font-medium">Управляйте вашими предложениями и создавайте новые за секунды</p>
          </div>
          <button 
            onClick={() => setView('editor')}
            className="group flex items-center gap-3 bg-[#114232] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-[#1a5d46] transition-all transform hover:-translate-y-1"
          >
            <Plus size={24} /> 
            <span>СОЗДАТЬ НОВОЕ КП</span>
          </button>
        </div>

        {/* Сетка созданных КП */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savedKPs.length > 0 ? savedKPs.map((kp, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group">
              <div className="w-full h-40 bg-gray-50 rounded-2xl mb-4 overflow-hidden relative">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <FileText size={48} />
                 </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{kp.clientName || "Без названия"}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <Clock size={14} /> 13.05.2026
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl border-gray-200">
              <p className="text-gray-400 font-medium">Пока нет созданных КП. Начните с чистого листа!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
