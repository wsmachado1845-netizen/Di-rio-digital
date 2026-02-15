import { useState } from 'react';
import { Users, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFrequencias, useTurmaSelecionada, useDisciplinaSelecionada, useMesAnoFrequencia } from '@/hooks/useAppState';
import { TURMAS, DISCIPLINAS } from '@/types';
import type { Frequencia } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, subMonths, addMonths } from 'date-fns';

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function FrequenciaDiaria() {
  const [frequencias, setFrequencias] = useFrequencias();
  const [turmaSelecionada, setTurmaSelecionada] = useTurmaSelecionada();
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useDisciplinaSelecionada();
  const [mesAno, setMesAno] = useMesAnoFrequencia();
  const [mostrarLegenda, setMostrarLegenda] = useState(false);

  const turma = TURMAS.find(t => t.id === turmaSelecionada);
  const disciplina = DISCIPLINAS.find(d => d.id === disciplinaSelecionada);

  const currentDate = new Date(mesAno.ano, mesAno.mes, 1);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const diasUteis = eachDayOfInterval({ start: monthStart, end: monthEnd })
    .filter(d => !isWeekend(d));

  const getFrequencia = (alunoId: string, data: Date): 'P' | 'F' | 'J' | null => {
    const freq = frequencias.find(
      f => f.alunoId === alunoId && 
           f.data === format(data, 'yyyy-MM-dd') &&
           f.turmaId === turmaSelecionada &&
           f.disciplinaId === disciplinaSelecionada
    );
    return freq ? freq.status : null;
  };

  const setFrequencia = (alunoId: string, data: Date, status: 'P' | 'F' | 'J') => {
    const dataStr = format(data, 'yyyy-MM-dd');
    const existente = frequencias.find(
      f => f.alunoId === alunoId && 
           f.data === dataStr &&
           f.turmaId === turmaSelecionada &&
           f.disciplinaId === disciplinaSelecionada
    );

    if (existente) {
      setFrequencias(frequencias.map(f => 
        f.alunoId === alunoId && 
        f.data === dataStr &&
        f.turmaId === turmaSelecionada &&
        f.disciplinaId === disciplinaSelecionada
          ? { ...f, status }
          : f
      ));
    } else {
      const novaFreq: Frequencia = {
        alunoId,
        data: dataStr,
        turmaId: turmaSelecionada,
        disciplinaId: disciplinaSelecionada,
        status,
      };
      setFrequencias([...frequencias, novaFreq]);
    }
  };

  const limparFrequencia = (alunoId: string, data: Date) => {
    const dataStr = format(data, 'yyyy-MM-dd');
    setFrequencias(frequencias.filter(
      f => !(f.alunoId === alunoId && 
             f.data === dataStr &&
             f.turmaId === turmaSelecionada &&
             f.disciplinaId === disciplinaSelecionada)
    ));
  };

  const getTotalPresencas = (alunoId: string): number => {
    return frequencias.filter(
      f => f.alunoId === alunoId && 
           f.turmaId === turmaSelecionada &&
           f.disciplinaId === disciplinaSelecionada &&
           new Date(f.data).getMonth() === mesAno.mes &&
           new Date(f.data).getFullYear() === mesAno.ano &&
           f.status === 'P'
    ).length;
  };

  const getTotalFaltas = (alunoId: string): number => {
    return frequencias.filter(
      f => f.alunoId === alunoId && 
           f.turmaId === turmaSelecionada &&
           f.disciplinaId === disciplinaSelecionada &&
           new Date(f.data).getMonth() === mesAno.mes &&
           new Date(f.data).getFullYear() === mesAno.ano &&
           (f.status === 'F' || f.status === 'J')
    ).length;
  };

  const getPercentualFrequencia = (alunoId: string): number => {
    const totalAulas = diasUteis.length;
    const presencas = getTotalPresencas(alunoId);
    return totalAulas > 0 ? Math.round((presencas / totalAulas) * 100) : 100;
  };

  const prevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setMesAno({ mes: newDate.getMonth(), ano: newDate.getFullYear() });
  };

  const nextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setMesAno({ mes: newDate.getMonth(), ano: newDate.getFullYear() });
  };

  const marcarTodos = (data: Date, status: 'P' | 'F' | 'J') => {
    if (!turma) return;
    turma.alunos.filter(a => a.situacao === 'A').forEach(aluno => {
      setFrequencia(aluno.id, data, status);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Registro de Frequência
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={turmaSelecionada} onValueChange={setTurmaSelecionada}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Turma" />
            </SelectTrigger>
            <SelectContent>
              {TURMAS.map(turma => (
                <SelectItem key={turma.id} value={turma.id}>
                  {turma.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={disciplinaSelecionada} onValueChange={setDisciplinaSelecionada}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Disciplina" />
            </SelectTrigger>
            <SelectContent>
              {DISCIPLINAS.map(disc => (
                <SelectItem key={disc.id} value={disc.id}>
                  {disc.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {meses[mesAno.mes]}/{mesAno.ano}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info da turma */}
      {turma && disciplina && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Turma:</span>
              <span className="font-medium ml-2">{turma.nome} / {turma.turno} / {turma.serie}</span>
            </div>
            <div>
              <span className="text-gray-600">Componente Curricular:</span>
              <span className="font-medium ml-2">{disciplina.nome}</span>
            </div>
            <div>
              <span className="text-gray-600">Docente:</span>
              <span className="font-medium ml-2">FRANCISCO WELITON MACHADO DA SILVA</span>
            </div>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setMostrarLegenda(!mostrarLegenda)}>
          <AlertCircle className="w-4 h-4 mr-2" />
          Legenda
        </Button>
        {mostrarLegenda && (
          <div className="flex items-center gap-4 text-sm bg-gray-100 p-2 rounded">
            <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded text-white text-xs flex items-center justify-center">P</span> Presença</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-500 rounded text-white text-xs flex items-center justify-center">F</span> Falta</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-500 rounded text-white text-xs flex items-center justify-center">J</span> Falta Justificada</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-200 rounded text-xs flex items-center justify-center">-</span> Não lançado</span>
          </div>
        )}
      </div>

      {/* Tabela de Frequência */}
      <Card className="overflow-x-auto">
        <CardContent className="p-0">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left text-xs font-semibold border w-12">#</th>
                <th className="p-2 text-left text-xs font-semibold border min-w-[250px]">ALUNO(A)</th>
                <th className="p-2 text-center text-xs font-semibold border w-10">SIT.</th>
                {diasUteis.slice(0, 15).map(dia => (
                  <th key={dia.toISOString()} className="p-1 text-center text-xs font-semibold border w-8">
                    {format(dia, 'd')}
                  </th>
                ))}
                <th className="p-2 text-center text-xs font-semibold border w-10">P</th>
                <th className="p-2 text-center text-xs font-semibold border w-10">F</th>
                <th className="p-2 text-center text-xs font-semibold border w-12">%</th>
              </tr>
            </thead>
            <tbody>
              {turma?.alunos.map((aluno, index) => (
                <tr key={aluno.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 text-xs border text-center">{aluno.numeroChamada}</td>
                  <td className="p-2 text-xs border">{aluno.nome}</td>
                  <td className="p-2 text-xs border text-center font-medium">
                    {aluno.situacao === 'A' ? 'A' : aluno.situacao === 'T' ? 'T' : 'D'}
                  </td>
                  {diasUteis.slice(0, 15).map(dia => {
                    const freq = getFrequencia(aluno.id, dia);
                    return (
                      <td key={dia.toISOString()} className="p-1 border text-center">
                        <button
                          onClick={() => {
                            if (freq === null) setFrequencia(aluno.id, dia, 'P');
                            else if (freq === 'P') setFrequencia(aluno.id, dia, 'F');
                            else if (freq === 'F') setFrequencia(aluno.id, dia, 'J');
                            else limparFrequencia(aluno.id, dia);
                          }}
                          className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                            freq === 'P' ? 'bg-green-500 text-white' :
                            freq === 'F' ? 'bg-red-500 text-white' :
                            freq === 'J' ? 'bg-yellow-500 text-white' :
                            'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {freq || '-'}
                        </button>
                      </td>
                    );
                  })}
                  <td className="p-2 text-xs border text-center font-medium text-green-600">
                    {getTotalPresencas(aluno.id)}
                  </td>
                  <td className="p-2 text-xs border text-center font-medium text-red-600">
                    {getTotalFaltas(aluno.id)}
                  </td>
                  <td className="p-2 text-xs border text-center font-medium">
                    {getPercentualFrequencia(aluno.id)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Botões de ação rápida */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium">Marcar todos como:</span>
        {diasUteis.slice(0, 5).map(dia => (
          <div key={dia.toISOString()} className="flex items-center gap-1">
            <span className="text-xs text-gray-500">{format(dia, 'dd/MM')}:</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 w-6 p-0 bg-green-100 hover:bg-green-200"
              onClick={() => marcarTodos(dia, 'P')}
            >
              P
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 w-6 p-0 bg-red-100 hover:bg-red-200"
              onClick={() => marcarTodos(dia, 'F')}
            >
              F
            </Button>
          </div>
        ))}
      </div>

      {/* Resumo */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Resumo do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Total de dias letivos: <strong>{diasUteis.length}</strong> | 
            Total de alunos ativos: <strong>{turma?.alunos.filter(a => a.situacao === 'A').length}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
