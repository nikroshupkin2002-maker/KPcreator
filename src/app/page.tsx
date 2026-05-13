"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Download, Image as ImageIcon, FileText } from 'lucide-react';

interface TableItem {
  name: string;
  qty: number;
  price: number;
}

export default function KPGenerator() {
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<TableItem[]>([{ name: '', qty: 1, price: 0 }]);
  const [images, setImages] = useState<string[]>([]);

  // Добавление строки в таблицу
  const addItem = () => setItems([...items, { name: '', qty: 1, price: 0 }]);
  
  // Удаление строки
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Обновление данных в таблице
  const updateItem = (index: number, field: keyof TableItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Итоговая сумма
  const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  // Загрузка фото
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* ЛЕВАЯ ЧАСТЬ: ВВОД ДАННЫХ */}
      <div className="w-full md:w-1/2 p-6 bg-white border-r shadow-inner overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FileText className="text-blue-600" /> Параметры КП
          </h2>

          <div className="space-y-6">
            {/* Название */}
            <div>
              <label className="block text-sm font-semibold mb-1 uppercase text-slate-500">Клиент / Компания</label>
              <input 
                type="text" 
                placeholder="Например: Ресторан 'Freedom'"
                className="w-full border-2 border-slate-100 rounded-lg p-3 focus:border-blue-500 outline-none transition"
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-semibold mb-1 uppercase text-slate-500">Суть предложения</label>
              <textarea 
                placeholder="Опишите основные выгоды..."
                className="w-full border-2 border-slate-100 rounded-lg p-3 h-24 focus:border-blue-500 outline-none transition"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Таблица */}
            <div>
              <label className="block text-sm font-semibold mb-2 uppercase text-slate-500">Позиции и цены</label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg">
                    <input 
                      placeholder="Товар/Услуга"
                      className="flex-1 p-2 bg-transparent outline-none border-b border-slate-200"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                    />
                    <input 
                      type="number" 
                      placeholder="Кол-во"
                      className="w-16 p-2 bg-transparent outline-none border-b border-slate-200 text-center"
                      onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                    />
                    <input 
                      type="number" 
                      placeholder="Цена"
                      className="w-24 p-2 bg-transparent outline-none border-b border-slate-200 text-right"
                      onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                    />
                    <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 flex justify-center items-center gap-2">
                  <Plus size={18} /> Добавить строку
                </button>
              </div>
            </div>

            {/* Загрузка фото */}
            <div>
              <label className="block text-sm font-semibold mb-2 uppercase text-slate-500">Фотоматериалы</label>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <img key={i} src={img} className="w-full h-20 object-cover rounded-md border" />
                ))}
                <label className="h-20 border-2 border-dashed border-blue-200 rounded-md flex items-center justify-center cursor-pointer hover:bg-blue-50">
                  <ImageIcon className="text-blue-400" />
                  <input type="file" hidden multiple onChange={handlePhoto} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: ПРЕДПРОСМОТР (Preview) */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-start overflow-y-auto pt-10">
        <div id="kp-document" className="w-full max-w-[600px] min-h-[840px] bg-white shadow-2xl p-12 relative overflow-hidden">
          {/* Декор */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 -mr-16 -mt-16 rotate-45"></div>
          
          <div className="mb-12">
             <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Commercial Proposal</div>
             <h1 className="text-4xl font-black text-slate-900 leading-tight uppercase">
                {company || "НАЗВАНИЕ КЛИЕНТА"}
             </h1>
          </div>

          <div className="text-slate-600 mb-10 leading-relaxed border-l-4 border-blue-600 pl-4 italic">
            {description || "Здесь будет текст вашего коммерческого предложения, сформированный автоматически из ячеек слева."}
          </div>

          {/* Таблица в предпросмотре */}
          <table className="w-full mb-10">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left text-xs uppercase font-bold text-slate-400">
                <th className="py-2">Наименование</th>
                <th className="py-2 text-center">Кол-во</th>
                <th className="py-2 text-right">Цена</th>
                <th className="py-2 text-right">Итого</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3 font-medium">{item.name || "..."}</td>
                  <td className="py-3 text-center">{item.qty}</td>
                  <td className="py-3 text-right">{item.price.toLocaleString()} ₽</td>
                  <td className="py-3 text-right font-bold">{(item.qty * item.price).toLocaleString()} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-10">
            <div className="bg-slate-900 text-white p-4 rounded-lg text-right min-w-[200px]">
              <div className="text-xs uppercase opacity-60">Итого к оплате</div>
              <div className="text-2xl font-bold">{total.toLocaleString()} ₽</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {images.slice(0, 4).map((img, i) => (
              <img key={i} src={img} className="rounded-lg shadow-sm w-full h-40 object-cover" />
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between uppercase tracking-tighter">
            <span>Сформировано автоматически в системе КП</span>
            <span>2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
