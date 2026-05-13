"use client";
import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, ArrowUp, ArrowDown, Save, FolderOpen, Bold, Type, Image as ImageIcon, LayoutTemplate } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
// import { MyPDFModel } from './PDFDocument'; // Раскомментируем на следующем шаге

// Типы для наших динамических блоков
type BlockType = 'header' | 'text' | 'kpi' | 'image';

interface Block {
  id: string;
  type: BlockType;
  content: any;
  style?: { bold?: boolean; fontSize?: number; width?: string };
}

export default function KPBuilderPRO() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Загрузка шаблона при старте
  useEffect(() => {
    const saved = localStorage.getItem('kp_template');
    if (saved) setBlocks(JSON.parse(saved));
    else addBlock('header'); // Стартовый блок по умолчанию
    setIsLoaded(true);
  }, []);

  // Сохранение шаблона
  const saveTemplate = () => {
    localStorage.setItem('kp_template', JSON.stringify(blocks));
    alert('Шаблон успешно сохранен в браузере!');
  };

  // Генератор ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Добавление нового блока
  const addBlock = (type: BlockType) => {
    const newBlock: Block = { id: generateId(), type, content: {}, style: { fontSize: 14, bold: false } };
    
    if (type === 'header') newBlock.content = { title: 'Новое предложение', subtitle: 'Описание' };
    if (type === 'text') newBlock.content = { text: 'Введите ваш текст здесь...' };
    if (type === 'kpi') newBlock.content = { value: '100%', label: 'Показатель' };
    if (type === 'image') newBlock.content = { url: '' };

    setBlocks([...blocks, newBlock]);
  };

  // Обновление контента блока
  const updateBlock = (id: string, field: string, value: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, [field]: value } } : b));
  };

  // Обновление стиля блока
  const updateStyle = (id: string, field: string, value: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, style: { ...b.style, [field]: value } } : b));
  };

  // Удаление и перемещение
  const removeBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));
  const moveBlock = (index: number, direction: number) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    setBlocks(newBlocks);
  };

  // Обработчик загрузки фото
  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => updateBlock(id, 'url', event.target?.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (!isLoaded) return null; // Ждем загрузки из localStorage

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans text-gray-800 overflow-hidden">
      
      {/* ЛЕВАЯ ПАНЕЛЬ: ВВОД ДАННЫХ И НАСТРОЙКИ */}
      <div className="w-[450px] bg-white border-r border-emerald-100 flex flex-col h-full shadow-2xl z-10">
        <div className="p-6 border-b border-emerald-50 bg-emerald-800 text-white flex justify-between items-center">
          <div className="font-bold text-lg flex items-center gap-2">
            <LayoutTemplate size={24} /> PRO Редактор
          </div>
          <button onClick={saveTemplate} className="text-emerald-200 hover:text-white" title="Сохранить шаблон">
            <Save size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {blocks.map((block, index) => (
            <div key={block.id} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 relative group">
              <div className="text-xs font-bold text-emerald-600 uppercase mb-3 flex justify-between items-center">
                <span>{block.type === 'header' ? 'Заголовок' : block.type === 'text' ? 'Текст' : block.type === 'kpi' ? 'KPI Карточка' : 'Фотография'}</span>
                
                {/* Инструменты стилизации (только для текста) */}
                {(block.type === 'header' || block.type === 'text') && (
                  <div className="flex gap-2 bg-white px-2 py-1 rounded shadow-sm border">
                    <button onClick={() => updateStyle(block.id, 'bold', !block.style?.bold)} className={`p-1 rounded ${block.style?.bold ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-emerald-600'}`}>
                      <Bold size={14} />
                    </button>
                    <input 
                      type="range" min="10" max="48" value={block.style?.fontSize || 14} 
                      onChange={(e) => updateStyle(block.id, 'fontSize', Number(e.target.value))}
                      className="w-16 accent-emerald-500" title="Размер шрифта"
                    />
                  </div>
                )}
              </div>

              {/* Поля ввода в зависимости от типа блока */}
              {block.type === 'header' && (
                <div className="space-y-2">
                  <input className="w-full p-2 border rounded focus:ring-2 ring-emerald-500 outline-none font-bold" placeholder="Заголовок" value={block.content.title} onChange={(e) => updateBlock(block.id, 'title', e.target.value)} />
                  <input className="w-full p-2 border rounded focus:ring-2 ring-emerald-500 outline-none text-sm" placeholder="Подзаголовок" value={block.content.subtitle} onChange={(e) => updateBlock(block.id, 'subtitle', e.target.value)} />
                </div>
              )}

              {block.type === 'text' && (
                <textarea className="w-full p-2 border rounded focus:ring-2 ring-emerald-500 outline-none min-h-[100px]" placeholder="Введите текст..." value={block.content.text} onChange={(e) => updateBlock(block.id, 'text', e.target.value)} />
              )}

              {block.type === 'kpi' && (
                <div className="flex gap-2">
                  <input className="w-1/3 p-2 border rounded font-bold text-emerald-700" placeholder="Значение" value={block.content.value} onChange={(e) => updateBlock(block.id, 'value', e.target.value)} />
                  <input className="w-2/3 p-2 border rounded" placeholder="Описание" value={block.content.label} onChange={(e) => updateBlock(block.id, 'label', e.target.value)} />
                </div>
              )}

              {block.type === 'image' && (
                <div>
                  <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer hover:bg-emerald-50 text-emerald-600 transition">
                    <ImageIcon className="mr-2" /> Загрузить фото
                    <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">Размер фото можно менять мышкой на макете справа</p>
                </div>
              )}
            </div>
          ))}

          {/* Панель добавления новых блоков */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-emerald-100">
            <button onClick={() => addBlock('header')} className="p-2 bg-white border border-emerald-200 rounded text-sm font-medium text-emerald-700 hover:bg-emerald-50">Название</button>
            <button onClick={() => addBlock('text')} className="p-2 bg-white border border-emerald-200 rounded text-sm font-medium text-emerald-700 hover:bg-emerald-50">Текст</button>
            <button onClick={() => addBlock('kpi')} className="p-2 bg-white border border-emerald-200 rounded text-sm font-medium text-emerald-700 hover:bg-emerald-50">Цифра (KPI)</button>
            <button onClick={() => addBlock('image')} className="p-2 bg-white border border-emerald-200 rounded text-sm font-medium text-emerald-700 hover:bg-emerald-50">Фото</button>
          </div>
        </div>

        <div className="p-6 bg-white border-t">
          <button className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg">
             <Download size={20} /> Скачать PDF (Скоро)
          </button>
        </div>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: ИНТЕРАКТИВНЫЙ ПРЕДПРОСМОТР */}
      <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-gray-200/50 relative">
        <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl p-[15mm] relative pb-20">
          
          {/* Декоративная шапка */}
          <div className="border-b-[3px] border-emerald-500 pb-4 mb-8 flex justify-between">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-emerald-600 rounded flex items-center justify-center text-white font-black text-xl">PRO</div>
               <div><div className="font-bold text-gray-800 uppercase">Твоя Компания</div><div className="text-[10px] text-gray-400">Коммерческое предложение</div></div>
            </div>
          </div>

          {/* Рендер блоков с контроллерами */}
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="relative group rounded-lg hover:ring-2 ring-emerald-200 transition-all p-2 -mx-2">
                
                {/* Всплывающие кнопки управления на самом листе (Появляются при наведении) */}
                <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-white shadow-md rounded p-1 border">
                  <button onClick={() => moveBlock(index, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ArrowUp size={14}/></button>
                  <button onClick={() => moveBlock(index, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ArrowDown size={14}/></button>
                  <button onClick={() => removeBlock(block.id)} className="p-1 hover:bg-red-100 rounded text-red-500"><Trash2 size={14}/></button>
                </div>

                {/* Сам контент */}
                {block.type === 'header' && (
                  <div>
                    <h1 style={{ fontSize: `${block.style?.fontSize}px`, fontWeight: block.style?.bold ? 'bold' : 'normal', color: '#064e3b' }} className="leading-tight mb-2">
                      {block.content.title || 'Заголовок'}
                    </h1>
                    <p className="text-gray-500 text-lg">{block.content.subtitle}</p>
                  </div>
                )}

                {block.type === 'text' && (
                  <div style={{ fontSize: `${block.style?.fontSize}px`, fontWeight: block.style?.bold ? 'bold' : 'normal', whiteSpace: 'pre-wrap' }} className="text-gray-700">
                    {block.content.text}
                  </div>
                )}

                {block.type === 'kpi' && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 inline-block min-w-[200px] text-center">
                    <div className="text-3xl font-black text-emerald-700">{block.content.value || '0'}</div>
                    <div className="text-xs uppercase text-emerald-600/70 mt-1 font-bold">{block.content.label || 'Описание'}</div>
                  </div>
                )}

                {block.type === 'image' && block.content.url && (
                  <div className="inline-block relative">
                     {/* Хитрый CSS ресайз: overflow-hidden и resize-both позволяют тянуть за угол */}
                     <img 
                       src={block.content.url} 
                       alt="uploaded" 
                       style={{ resize: 'both', overflow: 'hidden', minWidth: '150px', maxWidth: '100%', maxHeight: '800px', objectFit: 'cover' }}
                       className="rounded-lg shadow-md border border-gray-200"
                     />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
