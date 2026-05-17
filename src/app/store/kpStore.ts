import { useState, useEffect, useCallback } from 'react';
import type { KPData } from '../types/kp';

const STORAGE_KEY = 'kp_proposals';

function loadFromStorage(): KPData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return parsed.map((kp: KPData) => ({
      ...kp,
      elementStyles: kp.elementStyles ?? {},
    }));
  } catch {
    return [];
  }
}

function saveToStorage(kps: KPData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kps));
  } catch (e) {
    console.error('localStorage quota exceeded', e);
  }
}

export function useKPStore() {
  const [proposals, setProposals] = useState<KPData[]>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(proposals);
  }, [proposals]);

  const saveProposal = useCallback((kp: KPData) => {
    setProposals(prev => {
      const existing = prev.findIndex(p => p.id === kp.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...kp, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [...prev, { ...kp, updatedAt: new Date().toISOString() }];
    });
  }, []);

  const deleteProposal = useCallback((id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
  }, []);

  const getProposal = useCallback((id: string) => {
    return proposals.find(p => p.id === id);
  }, [proposals]);

  return { proposals, saveProposal, deleteProposal, getProposal };
}

export function createNewKP(name?: string): KPData {
  return {
    id: `kp_${Date.now()}`,
    name: name || 'Новое КП',
    companyName: '',
    titlePhotoDataUrl: null,
    slides: [
      {
        id: `slide_${Date.now()}`,
        title: '',
        items: [],
        photos: [],
      },
    ],
    calculationTable: {
      title: 'Расчёт стоимости',
      numColumns: 4,
      numRows: 3,
      headers: ['Наименование', 'Кол-во', 'Цена', 'Сумма'],
      cells: Array.from({ length: 3 }, () => Array(4).fill('')),
      info: '',
    },
    employee: {
      name: '',
      phone: '',
      photoDataUrl: null,
    },
    freedomPhotoDataUrl: null,
    elementStyles: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
