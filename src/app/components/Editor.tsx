"use client";
import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { ChevronLeft, Plus, Trash2, Image as ImageIcon, Layout, Type, Table as TableIcon, Download, Save } from 'lucide-react';

export default function Editor({ onBack }: { onBack: () => void }) {
  const [clientName, setClientName] = useState('');
  const [slides, setSlides] = useState([{ id: 1, title: 'Заголовок слайда', info: [], photos: [] }]);
  const [employee, setEmployee] = useState({ name: '', phone: '', photo: '' });

  // Добавление слайда
  const addSlide = () => {
    setSlides([...slides, { id: Date.now(), title: 'Новый слайд', info: [], photos: [] }]);
  };

  return (
    <div className="flex h-screen bg-[#E5E7EB]">
      {/* 1. ЛЕВАЯ ПАНЕЛЬ ВВОДА */}
      <div className="w-[450px] bg-white h-full overflow-y-auto border-r shadow-2xl flex flex-col">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold hover:text-black">
            <ChevronLeft /> Назад
          </button>
          <div className="flex gap-2">
             <button className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"><Save size={20}/></button>
             <button className="p-2 bg-[#114232] text-white rounded-lg hover:opacity-90 transition"><Download size={20}/></button>
          </div>
        </div>

        <div className="p-6 space-y-8 pb-32">
          {/* Титульный лист */}
          <section>
            <h3 className="text-xs font-black text-[#114232] uppercase tracking-widest mb-4">Титульный лист</h3>
            <div className="space-y-4">
              <input 
                placeholder="Название компании" 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 ring-emerald-500 transition"
                onChange={(e) => setClientName(e.target.value)}
              />
              <div className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 transition cursor-pointer">
                <ImageIcon size={32} />
                <span className="text-xs font-bold mt-2 uppercase">Фото титула</span>
              </div>
            </div>
          </section>

          {/* Слайды */}
          {slides.map((slide, index) => (
            <section key={slide.id} className="p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Слайд #{index + 1}</span>
                <button onClick={() => setSlides(slides.filter(s => s.id !== slide.id))} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
              </div>
              <input 
                placeholder="Название слайда" 
                className="w-full p-3 bg-white border-none rounded-xl shadow-sm text-sm"
              />
              <textarea 
                placeholder="Информация на слайде" 
                className="w-full p-3 bg-white border-none rounded-xl shadow-sm text-sm h-24"
              />
              <div className="flex gap-2">
                 <button className="flex-1 py-2 bg-white rounded-lg border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase">+ Инфо</button>
                 <button className="flex-1 py-2 bg-white rounded-lg border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase">+ Фото</button>
              </div>
            </section>
          ))}

          <button 
            onClick={addSlide}
            className="w-full py-4 bg-white border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-600 font-bold hover:bg-emerald-50 transition"
          >
            + ДОБАВИТЬ СЛАЙД
          </button>
        </div>
      </div>

      {/* 2. ПРАВАЯ ПАНЕЛЬ - ВИЗУАЛ А4 */}
      <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center gap-10">
        
        {/* Титульный лист */}
        <div className="a4-canvas shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
          <div className="absolute top-0 left-0 w-full h-full bg-[#114232] flex flex-col items-center justify-center p-20 text-white">
             <div className="w-24 h-1 bg-white mb-10"></div>
             <h1 className="text-5xl font-black text-center uppercase leading-tight mb-4 tracking-tighter">
               {clientName || "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ"}
             </h1>
             <div className="text-emerald-300 font-medium tracking-widest uppercase">Smart Restaurant Solution</div>
          </div>
        </div>

        {/* Слайды контента */}
        {slides.map((slide) => (
          <div key={slide.id} className="a4-canvas p-16">
            <h2 className="text-3xl font-black text-[#114232] border-b-4 border-emerald-500 pb-4 mb-8">
              {slide.title}
            </h2>
            
            {/* Пример перетаскиваемого элемента */}
            <Rnd
              default={{ x: 50, y: 150, width: 320, height: 200 }}
              bounds="parent"
              className="group border border-transparent hover:border-emerald-500"
            >
              <div className="w-full h-full bg-gray-100 rounded-xl flex flex-col items-center justify-center overflow-hidden relative">
                <ImageIcon className="text-gray-300" size={40} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-emerald-500 text-white text-[8px] px-2 py-1 rounded">ТЯНИ ЗА УГОЛ</div>
              </div>
            </Rnd>

            <Rnd
              default={{ x: 400, y: 150, width: 300, height: 100 }}
              bounds="parent"
            >
              <div className="p-4 cursor-move active:cursor-grabbing group">
                <div className="text-gray-700 leading-relaxed font-medium">
                  Здесь будет ваш текст. Вы можете перемещать его мышкой по всей площади страницы А4.
                </div>
              </div>
            </Rnd>
          </div>
        ))}

        {/* Финальный слайд (Таблица и Контакты) */}
        <div className="a4-canvas p-16 flex flex-col">
          <h2 className="text-3xl font-black text-[#114232] mb-10">Расчет стоимости</h2>
          
          <table className="w-full border-collapse rounded-2xl overflow-hidden shadow-sm">
            <thead className="bg-[#114232] text-white uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-4 text-left">Наименование</th>
                <th className="p-4 text-right">Стоимость</th>
              </tr>
            </thead>
            <tbody className="bg-emerald-50/50">
              <tr className="border-b border-emerald-100">
                <td className="p-4 font-bold text-gray-700">SR Delivery System</td>
                <td className="p-4 text-right font-black text-emerald-900">750 000 ₸</td>
              </tr>
              <tr className="bg-[#114232] text-white">
                <td className="p-4 font-bold uppercase">Итого</td>
                <td className="p-4 text-right font-black text-xl">750 000 ₸</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-auto flex justify-between items-end border-t-2 border-gray-100 pt-10">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div>
                <div className="text-lg font-black text-gray-900 italic underline decoration-emerald-500">Арсен Шакуров</div>
                <div className="text-sm text-gray-400 font-bold tracking-tighter">+7 707 555 44 33</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-emerald-600 mb-1 tracking-widest uppercase">Freedom Group</div>
              <div className="text-lg font-black tracking-tighter text-gray-300 italic uppercase">Smart Proposal System</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
