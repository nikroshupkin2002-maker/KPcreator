"use client";
import React, { useState } from 'react';
import { Download, Plus, Trash2, LayoutDashboard, Table as TableIcon, Image as ImageIcon } from 'lucide-react';

export default function KPBuilder() {
  const [data, setData] = useState({
    number: "КП-SR-2026-001",
    clientName: "Кафе-ресторан «Венера»",
    clientManager: "Расиму",
    title: "Автоматизация доставки с SR Delivery",
    subtitle: "Экономия на комиссии агрегаторов и рост прибыли",
    kpis: [
      { label: "Уходит агрегаторам", value: "720 000 ₸" },
      { label: "Доп. прибыль", value: "+660 000 ₸" }
    ],
    rows: [{ desc: "Подписка SR Delivery", price: 60000 }],
    images: [] as string[]
  });

  const updateData = (key: string, value: any) => setData({ ...data, [key]: value });

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ (СЛЕВА) */}
      <div className="w-[400px] bg-white border-r h-screen sticky top-0 overflow-y-auto p-6 shadow-xl z-20">
        <div className="flex items-center gap-2 mb-8 text-green-600 font-bold text-xl">
          <LayoutDashboard /> <span>SR Editor</span>
        </div>

        <div className="space-y-6">
          <section>
            <label className="text-xs font-bold uppercase text-gray-400">Основная информация</label>
            <input 
              className="w-full mt-2 p-3 bg-gray-50 border rounded-lg focus:ring-2 ring-green-500 outline-none"
              placeholder="Название клиента"
              value={data.clientName}
              onChange={(e) => updateData('clientName', e.target.value)}
            />
            <input 
              className="w-full mt-2 p-3 bg-gray-50 border rounded-lg focus:ring-2 ring-green-500 outline-none"
              placeholder="Заголовок КП"
              value={data.title}
              onChange={(e) => updateData('title', e.target.value)}
            />
          </section>

          <section>
            <label className="text-xs font-bold uppercase text-gray-400">KPI Карточки</label>
            {data.kpis.map((kpi, i) => (
              <div key={i} className="flex gap-2 mt-2">
                <input 
                  className="w-1/2 p-2 text-sm border rounded" 
                  value={kpi.label} 
                  onChange={(e) => {
                    const newKpis = [...data.kpis];
                    newKpis[i].label = e.target.value;
                    updateData('kpis', newKpis);
                  }}
                />
                <input 
                  className="w-1/2 p-2 text-sm border rounded font-bold" 
                  value={kpi.value}
                  onChange={(e) => {
                    const newKpis = [...data.kpis];
                    newKpis[i].value = e.target.value;
                    updateData('kpis', newKpis);
                  }}
                />
              </div>
            ))}
          </section>

          <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg mt-10">
            <Download size={20} /> СКАЧАТЬ В PDF
          </button>
        </div>
      </div>

      {/* ПРЕДПРОСМОТР (СПРАВА) */}
      <div className="flex-1 p-10 overflow-y-auto flex justify-center">
        <div className="a4-page shadow-2xl scale-90 origin-top">
          {/* HEADER по твоему шаблону */}
          <div className="flex justify-between items-start border-b-[3px] border-[#34A853] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#34A853] rounded-lg flex items-center justify-center text-white text-2xl font-black">SR</div>
              <div>
                <div className="font-bold text-lg leading-tight text-gray-800 uppercase tracking-tighter">Smart Restaurant</div>
                <div className="text-[10px] text-gray-500 uppercase">Решения для автоматизации</div>
              </div>
            </div>
            <div className="text-right text-[10px] text-gray-400 leading-relaxed">
              <strong>Коммерческое предложение</strong><br />
              № {data.number}<br />
              Дата: 13.05.2026
            </div>
          </div>

          {/* TITLE SECTION */}
          <h1 className="text-[26pt] font-black leading-tight text-gray-900 mb-2">{data.title}</h1>
          <p className="text-[#5d5d5d] text-[11pt] mb-8">{data.subtitle}</p>

          <div className="text-[10.5pt] mb-8">
             <strong>Кому:</strong> {data.clientManager}, директору {data.clientName}<br />
             <strong>От:</strong> Smart Restaurant (Freedom Корпорация)
          </div>

          {/* KPI BLOCKS */}
          <div className="flex gap-4 mb-8">
            {data.kpis.map((kpi, i) => (
              <div key={i} className="flex-1 bg-[#E8F5EC] border border-[#C8E6CF] rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-[#1F6F3A]">{kpi.value}</div>
                <div className="text-[8pt] uppercase text-[#5d5d5d] mt-1 font-semibold">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* SUMMARY BLOCK */}
          <div className="bg-[#E8F5EC] border-l-4 border-[#34A853] p-4 rounded-r-lg mb-8 text-[11pt] italic text-gray-700">
            {data.clientManager}, использование системы позволит оптимизировать процессы и увеличить чистую прибыль вашего заведения.
          </div>

          <h2 className="text-[12pt] font-bold text-[#1F6F3A] border-l-4 border-[#34A853] pl-3 mb-4 uppercase tracking-tight">Экономика решения</h2>
          
          <table className="w-full border-collapse mb-8 text-[10pt]">
            <thead>
              <tr className="bg-[#E8F5EC] text-[#1F6F3A]">
                <th className="border p-2 text-left">Наименование услуги</th>
                <th className="border p-2 text-right">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i}>
                  <td className="border p-2 font-medium">{row.desc}</td>
                  <td className="border p-2 text-right font-bold">{row.price.toLocaleString()} ₸</td>
                </tr>
              ))}
              <tr className="bg-gray-900 text-white font-bold">
                <td className="border p-2">ИТОГО К ОПЛАТЕ</td>
                <td className="border p-2 text-right">60 000 ₸</td>
              </tr>
            </tbody>
          </table>

          {/* FOOTER */}
          <div className="mt-auto pt-10 border-t border-gray-100 flex justify-between text-[8pt] text-gray-400">
            <div>Smart Restaurant · Freedom Корпорация</div>
            <div>{data.number}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
