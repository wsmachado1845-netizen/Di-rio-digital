import { useState } from 'react';
import { BookOpen, Plus, Search, Calendar, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAulas, useTurmaSelecionada, useDisciplinaSelecionada } from '@/hooks/useAppState';
import { TURMAS, DISCIPLINAS } from '@/types';
import type { Aula } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Aulas() {
  const [aulas, setAulas] = useAulas();
  const [turmaSelecionada, setTurmaSelecionada] = useTurmaSelecionada();
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useDisciplinaSelecionada();
  const [busca, setBusca] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [novaAula, setNovaAula] = useState<Partial<Aula>>({
    data: new Date().toISOString().split('T')[0],
    conteudo: '',
    observacoes: '',
  });

  const aulasFiltradas = aulas
    .filter(a => a.turmaId === turmaSelecionada && a.disciplinaId === disciplinaSelecionada)
    .filter(a => 
      busca === '' || 
      a.conteudo.toLowerCase().includes(busca.toLowerCase()) ||
      a.observacoes?.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const handleAdd = () => {
    if (novaAula.data && novaAula.conteudo) {
      const aula: Aula = {
        id: Date.now().toString(),
        data: novaAula.data,
        turmaId: turmaSelecionada,
        disciplinaId: disciplinaSelecionada,
        conteudo: novaAula.conteudo,
        observacoes: novaAula.observacoes,
      };
      setAulas([...aulas, aula]);
      setNovaAula({
        data: new Date().toISOString().split('T')[0],
        conteudo: '',
        observacoes: '',
      });
      setMostrarForm(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta aula?')) {
      setAulas(aulas.filter(a => a.id !== id));
    }
  };

  const handleUpdate = (id: string, updates: Partial<Aula>) => {
    setAulas(aulas.map(a => a.id === id ? { ...a, ...updates } : a));
    setEditando(null);
  };

  const getDisciplinaNome = (id: string) => {
    return DISCIPLINAS.find(d => d.id === id)?.nome || id;
  };

  const getTurmaNome = (id: string) => {
    return TURMAS.find(t => t.id === id)?.nome || id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Registro de Aulas
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
          <Button onClick={() => setMostrarForm(!mostrarForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Aula
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por conteúdo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {mostrarForm && (
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Nova Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={novaAula.data}
                  onChange={(e) => setNovaAula({ ...novaAula, data: e.target.value })}
                />
              </div>
              <div>
                <Label>Turma/Disciplina</Label>
                <div className="p-2 bg-gray-100 rounded text-sm">
                  {getTurmaNome(turmaSelecionada)} - {getDisciplinaNome(disciplinaSelecionada)}
                </div>
              </div>
            </div>
            <div>
              <Label>Conteúdo Ministrado</Label>
              <Textarea
                placeholder="Descreva o conteúdo da aula..."
                value={novaAula.conteudo}
                onChange={(e) => setNovaAula({ ...novaAula, conteudo: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Observações sobre a aula, dificuldades, etc..."
                value={novaAula.observacoes}
                onChange={(e) => setNovaAula({ ...novaAula, observacoes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMostrarForm(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleAdd}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Aula
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {aulasFiltradas.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma aula registrada para esta turma e disciplina.</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "Nova Aula" para adicionar.</p>
          </Card>
        ) : (
          aulasFiltradas.map(aula => (
            <Card key={aula.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {editando === aula.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={aula.data}
                          onChange={(e) => handleUpdate(aula.id, { data: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Conteúdo</Label>
                      <Textarea
                        value={aula.conteudo}
                        onChange={(e) => handleUpdate(aula.id, { conteudo: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        value={aula.observacoes || ''}
                        onChange={(e) => handleUpdate(aula.id, { observacoes: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditando(null)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={() => setEditando(null)}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {format(parseISO(aula.data), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {getDisciplinaNome(aula.disciplinaId)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-2">{aula.conteudo}</h4>
                      {aula.observacoes && (
                        <p className="text-sm text-gray-500 mt-2">
                          <strong>Obs:</strong> {aula.observacoes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditando(aula.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => handleDelete(aula.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
