import { useState, useRef } from 'react';
import { FileText, Calendar, TrendingUp, Users, BookOpen, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useFrequencias, useNotas, useAulas, useTurmaSelecionada, useDisciplinaSelecionada, useBimestreSelecionado } from '@/hooks/useAppState';
import { TURMAS, DISCIPLINAS, ESCOLA, PROFESSOR } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const tiposRelatorio = [
  { id: 'MENSAL', nome: 'Relatório Mensal', descricao: 'Frequência e atividades do mês' },
  { id: 'BIMESTRAL', nome: 'Relatório Bimestral', descricao: 'Notas e desempenho do bimestre' },
  { id: 'ANUAL', nome: 'Relatório Anual', descricao: 'Consolidado do ano letivo' },
];

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState<'MENSAL' | 'BIMESTRAL' | 'ANUAL'>('MENSAL');
  const [turmaSelecionada, setTurmaSelecionada] = useTurmaSelecionada();
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useDisciplinaSelecionada();
  const [bimestre, setBimestre] = useBimestreSelecionado();
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(2026);
  const relatorioRef = useRef<HTMLDivElement>(null);

  const [frequencias] = useFrequencias();
  const [notas] = useNotas();
  const [aulas] = useAulas();

  const turma = TURMAS.find(t => t.id === turmaSelecionada);
  const disciplina = DISCIPLINAS.find(d => d.id === disciplinaSelecionada);

  // Dados para relatório
  const getFrequenciaAluno = (alunoId: string) => {
    const freqAluno = frequencias.filter(
      f => f.alunoId === alunoId && 
           f.turmaId === turmaSelecionada &&
           f.disciplinaId === disciplinaSelecionada
    );
    
    if (tipoRelatorio === 'MENSAL') {
      return freqAluno.filter(f => {
        const data = new Date(f.data);
        return data.getMonth() === mesSelecionado && data.getFullYear() === anoSelecionado;
      });
    }
    
    return freqAluno;
  };

  const getNotasAluno = (alunoId: string) => {
    return notas.filter(
      n => n.alunoId === alunoId && 
           n.turmaId === turmaSelecionada &&
           n.disciplinaId === disciplinaSelecionada &&
           n.bimestre === bimestre
    );
  };

  const calcularMedia = (alunoId: string): number => {
    const notasAluno = getNotasAluno(alunoId);
    if (notasAluno.length === 0) return 0;
    const soma = notasAluno.reduce((acc, n) => acc + n.valor, 0);
    return Math.round((soma / notasAluno.length) * 10) / 10;
  };

  const getAulasDadas = () => {
    return aulas.filter(
      a => a.turmaId === turmaSelecionada && 
           a.disciplinaId === disciplinaSelecionada
    ).length;
  };

  const dadosGraficoFrequencia = turma?.alunos.filter(a => a.situacao === 'A').map(aluno => {
    const freq = getFrequenciaAluno(aluno.id);
    const presencas = freq.filter(f => f.status === 'P').length;
    const faltas = freq.filter(f => f.status === 'F' || f.status === 'J').length;
    const total = presencas + faltas;
    const percentual = total > 0 ? Math.round((presencas / total) * 100) : 100;
    
    return {
      nome: aluno.nome.split(' ')[0],
      presencas,
      faltas,
      percentual,
    };
  }) || [];

  const dadosGraficoNotas = turma?.alunos.filter(a => a.situacao === 'A').map(aluno => ({
    nome: aluno.nome.split(' ')[0],
    media: calcularMedia(aluno.id),
  })) || [];

  const exportarPDF = () => {
    const conteudo = relatorioRef.current;
    if (!conteudo) return;

    // Criar uma nova janela para impressão
    const janelaImpressao = window.open('', '_blank');
    if (!janelaImpressao) {
      alert('Por favor, permita popups para exportar o relatório.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório ${tipoRelatorio} - ${turma?.nome}</title>
        <style>
          @page { size: A4 landscape; margin: 1cm; }
          body { font-family: Arial, sans-serif; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { font-size: 18px; margin: 0; }
          .header p { font-size: 12px; margin: 5px 0; color: #666; }
          .info { margin: 15px 0; padding: 10px; background: #f5f5f5; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #333; padding: 6px; text-align: left; font-size: 10px; }
          th { background: #e0e0e0; font-weight: bold; }
          .text-center { text-align: center; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
          .assinatura { margin-top: 50px; display: flex; justify-content: space-between; }
          .assinatura-line { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PREFEITURA MUNICIPAL DE SANTA LUZIA</h1>
          <h2>SECRETARIA MUNICIPAL DE EDUCAÇÃO</h2>
          <p>${ESCOLA.nome}</p>
          <p>INEP: ${ESCOLA.inep}</p>
        </div>
        
        <div class="info">
          <strong>Relatório ${tipoRelatorio}</strong> | 
          Turma: ${turma?.nome} | 
          Disciplina: ${disciplina?.nome} | 
          Professor: ${PROFESSOR.nome}
          ${tipoRelatorio === 'MENSAL' ? `| Mês: ${meses[mesSelecionado]}/${anoSelecionado}` : ''}
          ${tipoRelatorio === 'BIMESTRAL' ? `| Bimestre: ${bimestre}º` : ''}
        </div>

        ${conteudo.innerHTML}

        <div class="assinatura">
          <div class="assinatura-line">
            ${PROFESSOR.nome}<br>
            Professor
          </div>
          <div class="assinatura-line">
            _________________________<br>
            Coordenação
          </div>
          <div class="assinatura-line">
            _________________________<br>
            Direção
          </div>
        </div>

        <div class="footer">
          Documento gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">
            Imprimir / Salvar como PDF
          </button>
        </div>
      </body>
      </html>
    `;

    janelaImpressao.document.write(html);
    janelaImpressao.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Relatórios
        </h2>
      </div>

      {/* Configurações do relatório */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Configurar Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={(v) => setTipoRelatorio(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposRelatorio.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Turma</Label>
              <Select value={turmaSelecionada} onValueChange={setTurmaSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TURMAS.map(turma => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Disciplina</Label>
              <Select value={disciplinaSelecionada} onValueChange={setDisciplinaSelecionada}>
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
              {tipoRelatorio === 'MENSAL' ? (
                <>
                  <Label>Mês/Ano</Label>
                  <div className="flex gap-2">
                    <Select value={mesSelecionado.toString()} onValueChange={(v) => setMesSelecionado(parseInt(v))}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {meses.map((m, i) => (
                          <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={anoSelecionado.toString()} onValueChange={(v) => setAnoSelecionado(parseInt(v))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <Label>Bimestre</Label>
                  <Select value={bimestre.toString()} onValueChange={(v) => setBimestre(parseInt(v) as 1 | 2 | 3 | 4)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1º Bimestre</SelectItem>
                      <SelectItem value="2">2º Bimestre</SelectItem>
                      <SelectItem value="3">3º Bimestre</SelectItem>
                      <SelectItem value="4">4º Bimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={exportarPDF} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 mr-2" />
              Visualizar para Impressão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview do relatório */}
      <div ref={relatorioRef} className="space-y-6">
        {/* Cabeçalho do relatório */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center border-b pb-4">
              <h3 className="text-xl font-bold">RELATÓRIO {tipoRelatorio}</h3>
              <p className="text-gray-600 mt-2">
                Turma: {turma?.nome} | Disciplina: {disciplina?.nome}
                {tipoRelatorio === 'MENSAL' && ` | ${meses[mesSelecionado]}/${anoSelecionado}`}
                {tipoRelatorio === 'BIMESTRAL' && ` | ${bimestre}º Bimestre`}
              </p>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{turma?.alunos.filter(a => a.situacao === 'A').length}</div>
                <div className="text-sm text-gray-600">Alunos Ativos</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{getAulasDadas()}</div>
                <div className="text-sm text-gray-600">Aulas Dadas</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {turma ? Math.round(turma.alunos.filter(a => a.situacao === 'A').reduce((acc, a) => acc + calcularMedia(a.id), 0) / turma.alunos.filter(a => a.situacao === 'A').length * 10) / 10 : 0}
                </div>
                <div className="text-sm text-gray-600">Média da Turma</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {tipoRelatorio === 'MENSAL' ? meses[mesSelecionado] : `${bimestre}º Bim`}
                </div>
                <div className="text-sm text-gray-600">Período</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de alunos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desempenho dos Alunos</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-xs font-semibold border">#</th>
                  <th className="p-3 text-left text-xs font-semibold border">ALUNO(A)</th>
                  <th className="p-3 text-center text-xs font-semibold border">PRESENÇAS</th>
                  <th className="p-3 text-center text-xs font-semibold border">FALTAS</th>
                  <th className="p-3 text-center text-xs font-semibold border">FREQ. %</th>
                  <th className="p-3 text-center text-xs font-semibold border">MÉDIA</th>
                  <th className="p-3 text-center text-xs font-semibold border">SITUAÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {turma?.alunos.filter(a => a.situacao === 'A').map((aluno, index) => {
                  const freq = getFrequenciaAluno(aluno.id);
                  const presencas = freq.filter(f => f.status === 'P').length;
                  const faltas = freq.filter(f => f.status === 'F' || f.status === 'J').length;
                  const total = presencas + faltas;
                  const freqPercent = total > 0 ? Math.round((presencas / total) * 100) : 100;
                  const media = calcularMedia(aluno.id);
                  
                  return (
                    <tr key={aluno.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-sm border">{aluno.numeroChamada}</td>
                      <td className="p-3 text-sm border font-medium">{aluno.nome}</td>
                      <td className="p-3 text-sm border text-center text-green-600">{presencas}</td>
                      <td className="p-3 text-sm border text-center text-red-600">{faltas}</td>
                      <td className="p-3 text-sm border text-center">{freqPercent}%</td>
                      <td className="p-3 text-sm border text-center font-bold">{media > 0 ? media.toFixed(1) : '-'}</td>
                      <td className={`p-3 text-sm border text-center font-medium ${
                        media >= 7 ? 'text-green-600' : media >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {media > 0 ? (media >= 7 ? 'Aprovado' : media >= 5 ? 'Recuperação' : 'Reprovado') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frequência por Aluno</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosGraficoFrequencia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="presencas" fill="#10B981" name="Presenças" />
                  <Bar dataKey="faltas" fill="#EF4444" name="Faltas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Média por Aluno</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosGraficoNotas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={60} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="media" fill="#3B82F6" name="Média" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Relatório gerado automaticamente pelo sistema de gestão escolar. 
              Os dados apresentados refletem o período selecionado e podem ser 
              verificados nos registros individuais de cada aluno.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
              <strong>Professor:</strong> {PROFESSOR.nome}<br />
              <strong>Data:</strong> {format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}<br />
              <strong>Escola:</strong> {ESCOLA.nome}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
