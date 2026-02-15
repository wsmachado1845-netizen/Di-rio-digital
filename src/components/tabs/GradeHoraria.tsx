import { useState } from 'react';
import { Clock, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGradeHoraria, useTurmaSelecionada } from '@/hooks/useAppState';
import { TURMAS, DISCIPLINAS } from '@/types';
import type { GradeHorariaItem } from '@/types';

const diasSemana = [
  { id: 1, nome: 'Segunda-feira' },
  { id: 2, nome: 'Terça-feira' },
  { id: 3, nome: 'Quarta-feira' },
  { id: 4, nome: 'Quinta-feira' },
  { id: 5, nome: 'Sexta-feira' },
  { id: 6, nome: 'Sábado' },
];

const horariosPadrao = [
  '07:00', '07:50', '08:40', '09:30', '10:00', '10:50', '11:40', '12:30',
  '13:30', '14:20', '15:10', '16:00', '16:50', '17:40', '18:30'
];

export default function GradeHoraria() {
  const [gradeHoraria, setGradeHoraria] = useGradeHoraria();
  const [turmaSelecionada, setTurmaSelecionada] = useTurmaSelecionada();
  const [editando, setEditando] = useState<string | null>(null);
  const [novoItem, setNovoItem] = useState<Partial<GradeHorariaItem>>({
    diaSemana: 1,
    horarioInicio: '07:00',
    horarioFim: '07:50',
  });
  const [mostrarForm, setMostrarForm] = useState(false);

  const turma = TURMAS.find(t => t.id === turmaSelecionada);

  const gradeFiltrada = gradeHoraria.filter(g => g.turmaId === turmaSelecionada);

  const getDisciplinaNome = (id: string) => {
    return DISCIPLINAS.find(d => d.id === id)?.nome || id;
  };

  const handleAdd = () => {
    if (novoItem.disciplinaId && novoItem.diaSemana && novoItem.horarioInicio && novoItem.horarioFim) {
      const item: GradeHorariaItem = {
        id: Date.now().toString(),
        turmaId: turmaSelecionada,
        disciplinaId: novoItem.disciplinaId,
        diaSemana: novoItem.diaSemana as 1 | 2 | 3 | 4 | 5 | 6,
        horarioInicio: novoItem.horarioInicio,
        horarioFim: novoItem.horarioFim,
      };
      setGradeHoraria([...gradeHoraria, item]);
      setNovoItem({
        diaSemana: 1,
        horarioInicio: '07:00',
        horarioFim: '07:50',
      });
      setMostrarForm(false);
    }
  };

  const handleDelete = (id: string) => {
    setGradeHoraria(gradeHoraria.filter(g => g.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<GradeHorariaItem>) => {
    setGradeHoraria(gradeHoraria.map(g => g.id === id ? { ...g, ...updates } : g));
    setEditando(null);
  };

  const getGradePorDia = (dia: number) => {
    return gradeFiltrada
      .filter(g => g.diaSemana === dia)
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Grade Horária
        </h2>
        <div className="flex items-center gap-4">
          <Select value={turmaSelecionada} onValueChange={setTurmaSelecionada}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione a turma" />
            </SelectTrigger>
            <SelectContent>
              {TURMAS.map(turma => (
                <SelectItem key={turma.id} value={turma.id}>
                  {turma.nome} - {turma.turno}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setMostrarForm(!mostrarForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Aula
          </Button>
        </div>
      </div>

      {turma && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Turma:</strong> {turma.nome} | <strong>Turno:</strong> {turma.turno} | <strong>Série:</strong> {turma.serie}
          </p>
        </div>
      )}

      {mostrarForm && (
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Nova Aula</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Dia da Semana</Label>
                <Select 
                  value={novoItem.diaSemana?.toString()} 
                  onValueChange={(v) => setNovoItem({ ...novoItem, diaSemana: parseInt(v) as 1 | 2 | 3 | 4 | 5 | 6 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {diasSemana.map(dia => (
                      <SelectItem key={dia.id} value={dia.id.toString()}>
                        {dia.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Disciplina</Label>
                <Select 
                  value={novoItem.disciplinaId} 
                  onValueChange={(v) => setNovoItem({ ...novoItem, disciplinaId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCIPLINAS.map(disc => (
                      <SelectItem key={disc.id} value={disc.id}>
                        {disc.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Início</Label>
                <Select 
                  value={novoItem.horarioInicio} 
                  onValueChange={(v) => setNovoItem({ ...novoItem, horarioInicio: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horariosPadrao.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fim</Label>
                <Select 
                  value={novoItem.horarioFim} 
                  onValueChange={(v) => setNovoItem({ ...novoItem, horarioFim: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horariosPadrao.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setMostrarForm(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleAdd}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {diasSemana.map(dia => {
          const aulas = getGradePorDia(dia.id);
          return (
            <Card key={dia.id} className={aulas.length === 0 ? 'opacity-70' : ''}>
              <CardHeader className="pb-2 bg-gray-50">
                <CardTitle className="text-sm font-semibold">{dia.nome}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {aulas.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sem aulas</p>
                ) : (
                  <div className="space-y-2">
                    {aulas.map(aula => (
                      <div 
                        key={aula.id} 
                        className="flex items-center justify-between p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                      >
                        {editando === aula.id ? (
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Select 
                              value={aula.disciplinaId} 
                              onValueChange={(v) => handleUpdate(aula.id, { disciplinaId: v })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DISCIPLINAS.map(disc => (
                                  <SelectItem key={disc.id} value={disc.id}>
                                    {disc.codigo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input 
                              type="time" 
                              value={aula.horarioInicio}
                              onChange={(e) => handleUpdate(aula.id, { horarioInicio: e.target.value })}
                              className="h-8 text-xs"
                            />
                            <Input 
                              type="time" 
                              value={aula.horarioFim}
                              onChange={(e) => handleUpdate(aula.id, { horarioFim: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <span className="font-medium text-sm">{getDisciplinaNome(aula.disciplinaId)}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {aula.horarioInicio} - {aula.horarioFim}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => setEditando(editando === aula.id ? null : aula.id)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 text-red-500"
                                onClick={() => handleDelete(aula.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
