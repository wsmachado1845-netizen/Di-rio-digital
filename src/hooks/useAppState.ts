import { useLocalStorage } from './useStorage';
import type { 
  Aula, 
  Frequencia, 
  Nota, 
  PlanejamentoBNCC, 
  GradeHorariaItem,
  EventoCalendario
} from '@/types';
import { CALENDARIO_2026 } from '@/types';

// Hook para Aulas
export function useAulas() {
  return useLocalStorage<Aula[]>('aulas', []);
}

// Hook para Frequência
export function useFrequencias() {
  return useLocalStorage<Frequencia[]>('frequencias', []);
}

// Hook para Notas
export function useNotas() {
  return useLocalStorage<Nota[]>('notas', []);
}

// Hook para Planejamentos BNCC
export function usePlanejamentos() {
  return useLocalStorage<PlanejamentoBNCC[]>('planejamentos', []);
}

// Hook para Grade Horária
export function useGradeHoraria() {
  return useLocalStorage<GradeHorariaItem[]>('gradeHoraria', []);
}

// Hook para Calendário (permite adicionar eventos customizados)
export function useCalendario() {
  return useLocalStorage<EventoCalendario[]>('calendario', CALENDARIO_2026);
}

// Hook para Turma selecionada
export function useTurmaSelecionada() {
  return useLocalStorage<string>('turmaSelecionada', '6A');
}

// Hook para Disciplina selecionada
export function useDisciplinaSelecionada() {
  return useLocalStorage<string>('disciplinaSelecionada', 'LI');
}

// Hook para Mês/Ano selecionado na frequência
export function useMesAnoFrequencia() {
  const hoje = new Date();
  return useLocalStorage<{ mes: number; ano: number }>('mesAnoFrequencia', {
    mes: hoje.getMonth(),
    ano: hoje.getFullYear(),
  });
}

// Hook para Bimestre selecionado
export function useBimestreSelecionado() {
  return useLocalStorage<1 | 2 | 3 | 4>('bimestreSelecionado', 1);
}
