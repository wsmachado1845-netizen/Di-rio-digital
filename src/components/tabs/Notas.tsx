import { useState, useMemo } from 'react';
import { TrendingUp, Plus, Save, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotas, useTurmaSelecionada, useDisciplinaSelecionada, useBimestreSelecionado } from '@/hooks/useAppState';
import { TURMAS, DISCIPLINAS } from '@/types';
import type { Nota } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const tiposNota = [
  { id: 'AVALIAÇÃO', nome: 'Avaliação' },
  { id: 'TRABALHO', nome: 'Trabalho' },
  { id: 'PARTICIPAÇÃO', nome: 'Participação' },
  { id: 'RECUPERAÇÃO', nome: 'Recuperação' },
];

export default function Notas() {
  const [notas, setNotas] = useNotas();
  const [turmaSelecionada, setTurmaSelecionada] = useTurmaSelecionada();
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useDisciplinaSelecionada();
  const [bimestre, setBimestre] = useBimestreSelecionado();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'notas' | 'estatisticas'>('notas');
  const [novaNota, setNovaNota] = useState<Partial<Nota>>({
    tipo: 'AVALIAÇÃO',
    valor: 0,
    peso: 1,
    descricao: '',
  });

  const turma = TURMAS.find(t => t.id === turmaSelecionada);
  const disciplina = DISCIPLINAS.find(d => d.id === disciplinaSelecionada);

  const notasFiltradas = notas.filter(
    n => n.turmaId === turmaSelecionada && 
         n.disciplinaId === disciplinaSelecionada &&
         n.bimestre === bimestre
  );

  const getNotasAluno = (alunoId: string) => {
    return notasFiltradas.filter(n => n.alunoId === alunoId);
  };

  const calcularMedia = (alunoId: string): number => {
    const notasAluno = getNotasAluno(alunoId);
    if (notasAluno.length === 0) return 0;
    
    const somaPonderada = notasAluno.reduce((acc, n) => acc + (n.valor * n.peso), 0);
    const somaPesos = notasAluno.reduce((acc, n) => acc + n.peso, 0);
    
    return somaPesos > 0 ? Math.round((somaPonderada / somaPesos) * 10) / 10 : 0;
  };

  const getSituacao = (media: number): string => {
    if (media >= 7) return 'Aprovado';
    if (media >= 5) return 'Recuperação';
    return 'Reprovado';
  };

  const getCorSituacao = (media: number): string => {
    if (media >= 7) return 'text-green-600';
    if (media >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAdd = () => {
    if (novaNota.alunoId && novaNota.valor !== undefined) {
      const nota: Nota = {
        id: Date.now().toString(),
        alunoId: novaNota.alunoId,
        turmaId: turmaSelecionada,
        disciplinaId: disciplinaSelecionada,
        bimestre: bimestre,
        tipo: novaNota.tipo as 'AVALIAÇÃO' | 'TRABALHO' | 'PARTICIPAÇÃO' | 'RECUPERAÇÃO',
        valor: novaNota.valor,
        peso: novaNota.peso || 1,
        descricao: novaNota.descricao,
      };
      setNotas([...notas, nota]);
      setNovaNota({
        tipo: 'AVALIAÇÃO',
        valor: 0,
        peso: 1,
        descricao: '',
      });
      setMostrarForm(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
      setNotas(notas.filter(n => n.id !== id));
    }
  };

  // Dados para gráficos
  const dadosMediaTurma = useMemo(() => {
    if (!turma) return [];
    return turma.alunos.filter(a => a.situacao === 'A').map(aluno => ({
      nome: aluno.nome.split(' ')[0],
      media: calcularMedia(aluno.id),
    }));
  }, [turma, notasFiltradas]);

  const dadosDistribuicao = useMemo(() => {
    if (!turma) return [];
    const faixas = { excelente: 0, bom: 0, regular: 0, insuficiente: 0 };
    turma.alunos.filter(a => a.situacao === 'A').forEach(aluno => {
      const media = calcularMedia(aluno.id);
      if (media >= 9) faixas.excelente++;
      else if (media >= 7) faixas.bom++;
      else if (media >= 5) faixas.regular++;
      else faixas.insuficiente++;
    });
    return [
      { nome: 'Excelente (9-10)', valor: faixas.excelente, cor: '#10B981' },
      { nome: 'Bom (7-8.9)', valor: faixas.bom, cor: '#3B82F6' },
      { nome: 'Regular (5-6.9)', valor: faixas.regular, cor: '#F59E0B' },
      { nome: 'Insuficiente (<5)', valor: faixas.insuficiente, cor: '#EF4444' },
    ];
  }, [turma, notasFiltradas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Notas por Componente
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
          <Select value={bimestre.toString()} onValueChange={(v) => setBimestre(parseInt(v) as 1 | 2 | 3 | 4)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Bimestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1º Bimestre</SelectItem>
              <SelectItem value="2">2º Bimestre</SelectItem>
              <SelectItem value="3">3º Bimestre</SelectItem>
              <SelectItem value="4">4º Bimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info */}
      {turma && disciplina && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Turma:</strong> {turma.nome} | <strong>Disciplina:</strong> {disciplina.nome} | <strong>Bimestre:</strong> {bimestre}º
          </p>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setAbaAtiva('notas')}
          className={`px-4 py-2 font-medium text-sm ${
            abaAtiva === 'notas' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Lançamento de Notas
        </button>
        <button
          onClick={() => setAbaAtiva('estatisticas')}
          className={`px-4 py-2 font-medium text-sm ${
            abaAtiva === 'estatisticas' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Estatísticas
        </button>
      </div>

      {abaAtiva === 'notas' ? (
        <>
          {/* Formulário de nova nota */}
          <div className="flex justify-end">
            <Button onClick={() => setMostrarForm(!mostrarForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Lançar Nota
            </Button>
          </div>

          {mostrarForm && (
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Nova Nota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <Label>Aluno</Label>
                    <Select 
                      value={novaNota.alunoId} 
                      onValueChange={(v) => setNovaNota({ ...novaNota, alunoId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {turma?.alunos.filter(a => a.situacao === 'A').map(aluno => (
                          <SelectItem key={aluno.id} value={aluno.id}>
                            {aluno.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select 
                      value={novaNota.tipo} 
                      onValueChange={(v) => setNovaNota({ ...novaNota, tipo: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposNota.map(tipo => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor (0-10)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={novaNota.valor}
                      onChange={(e) => setNovaNota({ ...novaNota, valor: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Peso</Label>
                    <Input
                      type="number"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={novaNota.peso}
                      onChange={(e) => setNovaNota({ ...novaNota, peso: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    placeholder="Ex: Prova de recuperação, Trabalho em grupo..."
                    value={novaNota.descricao}
                    onChange={(e) => setNovaNota({ ...novaNota, descricao: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setMostrarForm(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleAdd}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Nota
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabela de notas */}
          <Card className="overflow-x-auto">
            <CardContent className="p-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left text-xs font-semibold border">#</th>
                    <th className="p-3 text-left text-xs font-semibold border">ALUNO(A)</th>
                    <th className="p-3 text-center text-xs font-semibold border">NOTAS</th>
                    <th className="p-3 text-center text-xs font-semibold border">MÉDIA</th>
                    <th className="p-3 text-center text-xs font-semibold border">SITUAÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {turma?.alunos.filter(a => a.situacao === 'A').map((aluno, index) => {
                    const notasAluno = getNotasAluno(aluno.id);
                    const media = calcularMedia(aluno.id);
                    return (
                      <tr key={aluno.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 text-sm border">{aluno.numeroChamada}</td>
                        <td className="p-3 text-sm border font-medium">{aluno.nome}</td>
                        <td className="p-3 text-sm border">
                          <div className="flex flex-wrap gap-1">
                            {notasAluno.map(nota => (
                              <span 
                                key={nota.id}
                                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                              >
                                {nota.tipo.substring(0, 3)}: {nota.valor}
                                <button 
                                  onClick={() => handleDelete(nota.id)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {notasAluno.length === 0 && (
                              <span className="text-gray-400 text-xs">Sem notas</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm border text-center font-bold">
                          {media > 0 ? media.toFixed(1) : '-'}
                        </td>
                        <td className={`p-3 text-sm border text-center font-medium ${getCorSituacao(media)}`}>
                          {media > 0 ? getSituacao(media) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Estatísticas */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Média por Aluno</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosMediaTurma}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="media" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição de Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosDistribuicao}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="valor"
                  >
                    {dadosDistribuicao.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Resumo da Turma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dadosDistribuicao.map((item, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div 
                      className="text-3xl font-bold"
                      style={{ color: item.cor }}
                    >
                      {item.valor}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{item.nome}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
