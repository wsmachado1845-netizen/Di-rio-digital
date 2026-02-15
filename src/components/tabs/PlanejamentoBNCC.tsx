import { useState, useRef } from 'react';
import { Brain, Sparkles, Save, Plus, BookOpen, Target, Lightbulb, ClipboardList, CheckCircle, X, FileText, Printer, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePlanejamentos, useTurmaSelecionada, useDisciplinaSelecionada, useBimestreSelecionado } from '@/hooks/useAppState';
import { TURMAS, DISCIPLINAS, ESCOLA, PROFESSOR } from '@/types';
import type { PlanejamentoBNCC } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Base de conhecimento BNCC expandida para sugerir conteúdos
const sugestoesBNCC: Record<string, Array<{ 
  codigo: string; 
  habilidade: string; 
  objetoConhecimento: string;
  ano: string;
  unidadeTematica?: string;
}>> = {
  'LI': [
    { codigo: 'EF06LI01', habilidade: 'Reconhecer o inglês como língua global de comunicação', objetoConhecimento: 'Língua inglesa no mundo; variedades linguísticas; importância do inglês na comunicação internacional', ano: '6º ano', unidadeTematica: 'Práticas de Interação' },
    { codigo: 'EF06LI02', habilidade: 'Compreender e usar vocabulário básico sobre saudações, números e cores', objetoConhecimento: 'Saudações e despedidas; numerais cardinais; cores básicas; pronomes pessoais', ano: '6º ano', unidadeTematica: 'Oralidade' },
    { codigo: 'EF06LI03', habilidade: 'Identificar e reproduzir sons e entonação da língua inglesa', objetoConhecimento: 'Fonemas do inglês; entonação; ritmo e acentuação tônica; alfabeto fonético', ano: '6º ano', unidadeTematica: 'Sistemas Alfabéticos' },
    { codigo: 'EF06LI04', habilidade: 'Compreender textos simples com auxílio de imagens', objetoConhecimento: 'Leitura de imagens; textos multimodais; inferência contextual; estratégias de leitura', ano: '6º ano', unidadeTematica: 'Leitura/escuta' },
    { codigo: 'EF06LI05', habilidade: 'Produzir textos curtos usando estruturas simples', objetoConhecimento: 'Estrutura frasal básica; ordem das palavras; concordância simples; pontuação', ano: '6º ano', unidadeTematica: 'Produção textual' },
    { codigo: 'EF07LI01', habilidade: 'Compreender e usar vocabulário sobre rotina diária e hobbies', objetoConhecimento: 'Verbos de ação cotidiana; expressões de tempo; atividades de lazer; advérbios de frequência', ano: '7º ano', unidadeTematica: 'Oralidade' },
    { codigo: 'EF07LI02', habilidade: 'Identificar tempos verbais simples (presente, passado)', objetoConhecimento: 'Simple Present; Simple Past; formas afirmativa, negativa e interrogativa; verbos regulares e irregulares', ano: '7º ano', unidadeTematica: 'Gramática' },
    { codigo: 'EF07LI03', habilidade: 'Produzir textos curtos sobre temas cotidianos', objetoConhecimento: 'Coesão textual; conectores básicos; organização de parágrafos; revisão textual', ano: '7º ano', unidadeTematica: 'Produção textual' },
    { codigo: 'EF08LI01', habilidade: 'Compreender textos mais complexos com menos auxílio visual', objetoConhecimento: 'Estratégias de leitura; identificação de ideias principais; inferência; vocabulário contextualizado', ano: '8º ano', unidadeTematica: 'Leitura/escuta' },
    { codigo: 'EF08LI02', habilidade: 'Usar estruturas gramaticais para descrever planos futuros', objetoConhecimento: 'Futuro com "going to" e "will"; expressões de intenção; previsões; planos e projetos', ano: '8º ano', unidadeTematica: 'Gramática' },
    { codigo: 'EF08LI03', habilidade: 'Participar de diálogos simples sobre temas familiares', objetoConhecimento: 'Estratégias de conversação; turnos de fala; perguntas e respostas; expressões de opinião', ano: '8º ano', unidadeTematica: 'Oralidade' },
    { codigo: 'EF09LI01', habilidade: 'Compreender textos autênticos adaptados', objetoConhecimento: 'Gêneros textuais diversos; registros formais e informais; variações linguísticas; contexto cultural', ano: '9º ano', unidadeTematica: 'Leitura/escuta' },
    { codigo: 'EF09LI02', habilidade: 'Produzir textos coesos usando conectivos', objetoConhecimento: 'Conectores de adição, oposição, causa e consequência; coesão referencial; progressão temática', ano: '9º ano', unidadeTematica: 'Produção textual' },
    { codigo: 'EF09LI03', habilidade: 'Expressar opiniões e justificar argumentos em inglês', objetoConhecimento: 'Estruturas argumentativas; expressões de opinião; marcadores discursivos; debate e discussão', ano: '9º ano', unidadeTematica: 'Oralidade' },
  ],
  'LP': [
    { codigo: 'EF06LP01', habilidade: 'Ler e compreender textos narrativos, descritivos e argumentativos', objetoConhecimento: 'Estrutura dos gêneros textuais; elementos narrativos; caracterização; argumentação', ano: '6º ano', unidadeTematica: 'Leitura' },
    { codigo: 'EF06LP02', habilidade: 'Produzir textos coerentes e coesos com diferentes finalidades', objetoConhecimento: 'Planejamento textual; coesão e coerência; progressão temática; revisão e reescrita', ano: '6º ano', unidadeTematica: 'Produção' },
    { codigo: 'EF06LP03', habilidade: 'Analisar recursos expressivos e estilísticos em textos literários', objetoConhecimento: 'Figuras de linguagem; recursos sonoros; construção de imagens; efeitos de sentido', ano: '6º ano', unidadeTematica: 'Literatura' },
    { codigo: 'EF06LP04', habilidade: 'Usar normas gramaticais adequadamente na produção textual', objetoConhecimento: 'Morfologia; sintaxe; ortografia; pontuação; registro formal e informal', ano: '6º ano', unidadeTematica: 'Gramática' },
    { codigo: 'EF06LP05', habilidade: 'Identificar e produzir diferentes gêneros do campo da vida cotidiana', objetoConhecimento: 'Convite, bilhete, receita, instrução; características dos gêneros; situações comunicativas', ano: '6º ano', unidadeTematica: 'Gêneros' },
    { codigo: 'EF07LP01', habilidade: 'Compreender a organização estrutural de diferentes gêneros textuais', objetoConhecimento: 'Estrutura macro e micro textual; sequências textuais; esquemas de organização', ano: '7º ano', unidadeTematica: 'Gêneros' },
    { codigo: 'EF07LP02', habilidade: 'Produzir resumos e sínteses de textos lidos', objetoConhecimento: 'Seleção de informações; reformulação; paráfrase; citação; referências', ano: '7º ano', unidadeTematica: 'Produção' },
    { codigo: 'EF07LP03', habilidade: 'Analisar crítica e interpretativamente obras literárias', objetoConhecimento: 'Contexto de produção; movimentos literários; temas e motivos; intertextualidade', ano: '7º ano', unidadeTematica: 'Literatura' },
    { codigo: 'EF08LP01', habilidade: 'Desenvolver argumentação lógica e coerente em textos', objetoConhecimento: 'Tese, argumentos e conclusão; tipos de argumentos; falácias; repertório sociocultural', ano: '8º ano', unidadeTematica: 'Produção' },
    { codigo: 'EF08LP02', habilidade: 'Reconhecer e usar recursos de coesão textual', objetoConhecimento: 'Referenciação; substituição; elipse; conectivos; continuidade temática', ano: '8º ano', unidadeTematica: 'Gramática' },
    { codigo: 'EF08LP03', habilidade: 'Analisar relações entre textos de diferentes épocas', objetoConhecimento: 'Diacronia e sincronia; evolução da língua; variação linguística; memória social', ano: '8º ano', unidadeTematica: 'Literatura' },
    { codigo: 'EF09LP01', habilidade: 'Produzir textos argumentativos com autonomia', objetoConhecimento: 'Projeto textual; planejamento; textualização; revisão; reescrita; publicação', ano: '9º ano', unidadeTematica: 'Produção' },
    { codigo: 'EF09LP02', habilidade: 'Avaliar criticamente fontes de informação', objetoConhecimento: 'Fake news; discurso de ódio; letramento digital; leitura crítica; multimodalidade', ano: '9º ano', unidadeTematica: 'Leitura' },
    { codigo: 'EF09LP03', habilidade: 'Dominar estratégias de leitura e interpretação', objetoConhecimento: 'Inferência; pressuposto; ambiguidade; polissemia; intertextualidade; contexto', ano: '9º ano', unidadeTematica: 'Leitura' },
  ],
  'PT': [
    { codigo: 'EF06PT01', habilidade: 'Planejar e produzir textos narrativos com estrutura completa', objetoConhecimento: 'Narrador, personagens, tempo e espaço; enredo; conflito; clímax; desfecho', ano: '6º ano', unidadeTematica: 'Narração' },
    { codigo: 'EF06PT02', habilidade: 'Desenvolver personagens e enredo de forma criativa', objetoConhecimento: 'Tipos de personagens; caracterização direta e indireta; ações e reações; diálogos', ano: '6º ano', unidadeTematica: 'Narração' },
    { codigo: 'EF06PT03', habilidade: 'Usar recursos descritivos (adjetivos, metáforas) adequadamente', objetoConhecimento: 'Adjetivos; comparações; metáforas; sinestesia; descrição objetiva e subjetiva', ano: '6º ano', unidadeTematica: 'Descrição' },
    { codigo: 'EF07PT01', habilidade: 'Produzir textos descritivos ricos em detalhes sensoriais', objetoConhecimento: 'Cinco sentidos; descrição de espaços, pessoas e objetos; ponto de vista descritivo', ano: '7º ano', unidadeTematica: 'Descrição' },
    { codigo: 'EF07PT02', habilidade: 'Escrever diálogos com pontuação adequada', objetoConhecimento: 'Regras de transcrição do discurso direto; verbos de elocução; alternância de falas', ano: '7º ano', unidadeTematica: 'Diálogo' },
    { codigo: 'EF07PT03', habilidade: 'Criar textos injuntivos (receitas, instruções) claros', objetoConhecimento: 'Verbos no imperativo; sequência lógica; conectivos temporais; clareza e precisão', ano: '7º ano', unidadeTematica: 'Instrução' },
    { codigo: 'EF08PT01', habilidade: 'Produzir textos dissertativos-argumentativos', objetoConhecimento: 'Tese; argumentos; exemplos; conclusão; repertório; organização do pensamento', ano: '8º ano', unidadeTematica: 'Argumentação' },
    { codigo: 'EF08PT02', habilidade: 'Desenvolver tese e argumentos de forma organizada', objetoConhecimento: 'Tipos de argumentos; evidências; autoridade; estatísticas; causalidade', ano: '8º ano', unidadeTematica: 'Argumentação' },
    { codigo: 'EF08PT03', habilidade: 'Usar conectivos e operadores argumentativos', objetoConhecimento: 'Conectivos de adição, oposição, causa, consequência, comparação; operadores argumentativos', ano: '8º ano', unidadeTematica: 'Coesão' },
    { codigo: 'EF09PT01', habilidade: 'Produzir artigos de opinião com autonomia', objetoConhecimento: 'Gênero artigo de opinião; linguagem apreciativa; posicionamento crítico; intervenção social', ano: '9º ano', unidadeTematica: 'Opinião' },
    { codigo: 'EF09PT02', habilidade: 'Revisar e reescrever textos de forma crítica', objetoConhecimento: 'Processo de revisão; coesão e coerência; adequação; correção; reescrita criativa', ano: '9º ano', unidadeTematica: 'Revisão' },
    { codigo: 'EF09PT03', habilidade: 'Criar textos multimodais integrando diferentes recursos', objetoConhecimento: 'Multimodalidade; hipertexto; imagem e verbo; recursos digitais; design textual', ano: '9º ano', unidadeTematica: 'Multimodalidade' },
  ],
};

export default function PlanejamentoBNCC() {
  const [planejamentos, setPlanejamentos] = usePlanejamentos();
  const [turmaSelecionada, setTurmaSelecionada] = useTurmaSelecionada();
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useDisciplinaSelecionada();
  const [bimestre, setBimestre] = useBimestreSelecionado();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [gerandoIA, setGerandoIA] = useState(false);
  const [modoEdicao, setModoEdicao] = useState<string | null>(null);
  const relatorioRef = useRef<HTMLDivElement>(null);
  
  const [novoPlanejamento, setNovoPlanejamento] = useState<Partial<PlanejamentoBNCC>>({
    codigoBNCC: '',
    habilidade: '',
    objetoConhecimento: '',
    objetivos: '',
    conteudos: '',
    metodologia: '',
    recursos: '',
    avaliacao: '',
  });

  const turma = TURMAS.find(t => t.id === turmaSelecionada);
  const disciplina = DISCIPLINAS.find(d => d.id === disciplinaSelecionada);
  const anoTurma = turma?.serie?.match(/\d+/)?.[0] || '6';

  const sugestoesFiltradas = sugestoesBNCC[disciplinaSelecionada]?.filter(
    h => h.ano.includes(anoTurma)
  ) || [];

  const planejamentosFiltrados = planejamentos.filter(
    p => p.turmaId === turmaSelecionada && 
         p.disciplinaId === disciplinaSelecionada &&
         p.bimestre === bimestre
  );

  // Buscar sugestão baseada no texto digitado
  const buscarSugestao = (texto: string) => {
    const todasSugestoes = sugestoesBNCC[disciplinaSelecionada] || [];
    return todasSugestoes.find(s => 
      s.habilidade.toLowerCase().includes(texto.toLowerCase()) ||
      s.codigo.toLowerCase().includes(texto.toLowerCase())
    );
  };

  const gerarPlanejamentoIA = async () => {
    if (!novoPlanejamento.habilidade) return;
    
    setGerandoIA(true);
    
    // Buscar sugestão baseada na habilidade digitada
    const sugestao = buscarSugestao(novoPlanejamento.habilidade);
    
    // Simulação de processamento de IA
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const conteudosPorDisciplina: Record<string, string> = {
      'LI': 'Vocabulário temático, estruturas gramaticais básicas, prática de listening e speaking, leitura de textos simples, atividades de produção oral e escrita.',
      'LP': 'Gêneros textuais, gramática normativa, literatura, análise linguística, produção textual, leitura crítica, revisão e reescrita.',
      'PT': 'Planejamento textual, coesão e coerência, revisão e reescrita, diferentes gêneros de produção, processo de textualização.',
    };

    const metodologiasPorDisciplina: Record<string, string> = {
      'LI': 'Aula expositiva dialogada, atividades em grupo, jogos pedagógicos, uso de recursos audiovisuais, prática de conversação, atividades lúdicas.',
      'LP': 'Leitura orientada, análise textual coletiva, produção textual orientada, debates, oficinas de escrita, revisão em pares.',
      'PT': 'Oficina de escrita, brainstorming, roda de leitura, produção colaborativa, portfólio de textos, revisão sistemática.',
    };

    setNovoPlanejamento(prev => ({
      ...prev,
      codigoBNCC: sugestao?.codigo || '',
      objetoConhecimento: sugestao?.objetoConhecimento || 'Objeto de conhecimento relacionado à habilidade selecionada.',
      objetivos: `Desenvolver nos estudantes a capacidade de ${prev.habilidade?.toLowerCase() || 'desenvolver a habilidade'}, promovendo a autonomia, o pensamento crítico e a aplicação prática dos conhecimentos.`,
      conteudos: conteudosPorDisciplina[disciplinaSelecionada] || 'Conteúdos diversos da disciplina.',
      metodologia: metodologiasPorDisciplina[disciplinaSelecionada] || 'Metodologia ativa e participativa.',
      recursos: 'Livro didático, material de apoio, recursos digitais, quadro, projetor multimídia, materiais concretos.',
      avaliacao: 'Avaliação diagnóstica, formativa e somativa. Observação participativa, análise de produções, autoavaliação e heteroavaliação.',
    }));
    
    setGerandoIA(false);
  };

  const handleSave = () => {
    if (novoPlanejamento.habilidade && novoPlanejamento.objetoConhecimento) {
      const planejamento: PlanejamentoBNCC = {
        id: modoEdicao || Date.now().toString(),
        turmaId: turmaSelecionada,
        disciplinaId: disciplinaSelecionada,
        bimestre: bimestre,
        codigoBNCC: novoPlanejamento.codigoBNCC || '',
        habilidade: novoPlanejamento.habilidade,
        objetoConhecimento: novoPlanejamento.objetoConhecimento,
        objetivos: novoPlanejamento.objetivos || '',
        conteudos: novoPlanejamento.conteudos || '',
        metodologia: novoPlanejamento.metodologia || '',
        recursos: novoPlanejamento.recursos || '',
        avaliacao: novoPlanejamento.avaliacao || '',
      };
      
      if (modoEdicao) {
        setPlanejamentos(planejamentos.map(p => p.id === modoEdicao ? planejamento : p));
        setModoEdicao(null);
      } else {
        setPlanejamentos([...planejamentos, planejamento]);
      }
      
      setNovoPlanejamento({
        codigoBNCC: '',
        habilidade: '',
        objetoConhecimento: '',
        objetivos: '',
        conteudos: '',
        metodologia: '',
        recursos: '',
        avaliacao: '',
      });
      setMostrarForm(false);
    }
  };

  const handleEdit = (planejamento: PlanejamentoBNCC) => {
    setNovoPlanejamento(planejamento);
    setModoEdicao(planejamento.id);
    setMostrarForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este planejamento?')) {
      setPlanejamentos(planejamentos.filter(p => p.id !== id));
    }
  };

  const exportarPDF = () => {
    const conteudo = relatorioRef.current;
    if (!conteudo) return;

    const janelaImpressao = window.open('', '_blank');
    if (!janelaImpressao) {
      alert('Por favor, permita popups para exportar o planejamento.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Planejamento BNCC - ${turma?.nome}</title>
        <style>
          @page { size: A4; margin: 1.5cm; }
          body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { font-size: 14px; margin: 0; }
          .header h2 { font-size: 12px; margin: 5px 0; color: #666; }
          .info { margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .info-row { display: flex; margin: 3px 0; }
          .info-label { font-weight: bold; width: 120px; }
          .section { margin: 15px 0; }
          .section-title { font-weight: bold; font-size: 12px; background: #e0e0e0; padding: 5px; margin-bottom: 5px; }
          .section-content { padding: 5px; text-align: justify; }
          .habilidade-box { background: #f0f0f0; padding: 10px; border-left: 4px solid #7c3aed; margin: 10px 0; }
          .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #666; }
          .assinatura { margin-top: 40px; display: flex; justify-content: space-between; }
          .assinatura-line { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; font-size: 10px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PREFEITURA MUNICIPAL DE SANTA LUZIA</h1>
          <h2>SECRETARIA MUNICIPAL DE EDUCAÇÃO</h2>
          <p style="font-size: 10px; color: #666;">${ESCOLA.nome}</p>
          <p style="font-size: 9px; color: #999;">INEP: ${ESCOLA.inep}</p>
        </div>
        
        <div style="text-align: center; margin: 15px 0;">
          <h2 style="font-size: 16px; margin: 0;">PLANEJAMENTO DIDÁTICO - BNCC</h2>
        </div>

        ${conteudo.innerHTML}

        <div class="assinatura">
          <div class="assinatura-line">
            ${PROFESSOR.nome}<br>
            Professor
          </div>
          <div class="assinatura-line">
            _________________________<br>
            Coordenação Pedagógica
          </div>
        </div>

        <div class="footer">
          Documento gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #7c3aed; color: white; border: none; border-radius: 5px;">
            Imprimir / Salvar como PDF
          </button>
        </div>
      </body>
      </html>
    `;

    janelaImpressao.document.write(html);
    janelaImpressao.document.close();
  };

  const exportarTodosPDF = () => {
    if (planejamentosFiltrados.length === 0) {
      alert('Não há planejamentos para exportar.');
      return;
    }

    const janelaImpressao = window.open('', '_blank');
    if (!janelaImpressao) {
      alert('Por favor, permita popups para exportar os planejamentos.');
      return;
    }

    let planejamentosHTML = '';
    planejamentosFiltrados.forEach((p, index) => {
      planejamentosHTML += `
        <div style="page-break-after: always; ${index === planejamentosFiltrados.length - 1 ? 'page-break-after: auto;' : ''}">
          <div style="text-align: center; margin: 15px 0;">
            <h2 style="font-size: 16px; margin: 0;">PLANEJAMENTO DIDÁTICO - BNCC</h2>
          </div>
          
          <div class="info">
            <div class="info-row"><span class="info-label">Turma:</span> ${turma?.nome}</div>
            <div class="info-row"><span class="info-label">Disciplina:</span> ${disciplina?.nome}</div>
            <div class="info-row"><span class="info-label">Bimestre:</span> ${p.bimestre}º</div>
            <div class="info-row"><span class="info-label">Professor:</span> ${PROFESSOR.nome}</div>
          </div>

          <div class="habilidade-box">
            <strong>Código BNCC:</strong> ${p.codigoBNCC || 'Não informado'}<br>
            <strong>Habilidade:</strong> ${p.habilidade}
          </div>

          <div class="section">
            <div class="section-title">OBJETO DE CONHECIMENTO</div>
            <div class="section-content">${p.objetoConhecimento}</div>
          </div>

          <div class="section">
            <div class="section-title">OBJETIVOS</div>
            <div class="section-content">${p.objetivos}</div>
          </div>

          <div class="section">
            <div class="section-title">CONTEÚDOS</div>
            <div class="section-content">${p.conteudos}</div>
          </div>

          <div class="section">
            <div class="section-title">METODOLOGIA</div>
            <div class="section-content">${p.metodologia}</div>
          </div>

          <div class="section">
            <div class="section-title">RECURSOS</div>
            <div class="section-content">${p.recursos}</div>
          </div>

          <div class="section">
            <div class="section-title">AVALIAÇÃO</div>
            <div class="section-content">${p.avaliacao}</div>
          </div>
        </div>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Planejamentos BNCC - ${turma?.nome}</title>
        <style>
          @page { size: A4; margin: 1.5cm; }
          body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { font-size: 14px; margin: 0; }
          .header h2 { font-size: 12px; margin: 5px 0; color: #666; }
          .info { margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .info-row { display: flex; margin: 3px 0; }
          .info-label { font-weight: bold; width: 120px; }
          .section { margin: 15px 0; }
          .section-title { font-weight: bold; font-size: 12px; background: #e0e0e0; padding: 5px; margin-bottom: 5px; }
          .section-content { padding: 5px; text-align: justify; }
          .habilidade-box { background: #f0f0f0; padding: 10px; border-left: 4px solid #7c3aed; margin: 10px 0; }
          .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #666; }
          .assinatura { margin-top: 40px; display: flex; justify-content: space-between; }
          .assinatura-line { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; font-size: 10px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PREFEITURA MUNICIPAL DE SANTA LUZIA</h1>
          <h2>SECRETARIA MUNICIPAL DE EDUCAÇÃO</h2>
          <p style="font-size: 10px; color: #666;">${ESCOLA.nome}</p>
          <p style="font-size: 9px; color: #999;">INEP: ${ESCOLA.inep}</p>
        </div>

        ${planejamentosHTML}

        <div class="assinatura">
          <div class="assinatura-line">
            ${PROFESSOR.nome}<br>
            Professor
          </div>
          <div class="assinatura-line">
            _________________________<br>
            Coordenação Pedagógica
          </div>
        </div>

        <div class="footer">
          Documento gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #7c3aed; color: white; border: none; border-radius: 5px;">
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
          <Brain className="w-6 h-6 text-purple-600" />
          Planejamento BNCC
          <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Com IA
          </Badge>
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
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Turma:</strong> {turma.nome} | <strong>Disciplina:</strong> {disciplina.nome} | <strong>Bimestre:</strong> {bimestre}º
          </p>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Button onClick={() => {
          setMostrarForm(!mostrarForm);
          setModoEdicao(null);
          setNovoPlanejamento({
            codigoBNCC: '',
            habilidade: '',
            objetoConhecimento: '',
            objetivos: '',
            conteudos: '',
            metodologia: '',
            recursos: '',
            avaliacao: '',
          });
        }} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          {mostrarForm ? 'Fechar Formulário' : 'Novo Planejamento'}
        </Button>
        
        {planejamentosFiltrados.length > 0 && (
          <Button variant="outline" onClick={exportarTodosPDF}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Todos ({planejamentosFiltrados.length})
          </Button>
        )}
      </div>

      {/* Formulário com IA */}
      {mostrarForm && (
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {modoEdicao ? 'Editar Planejamento' : 'Gerar Planejamento com IA'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo de habilidade livre */}
            <div className="bg-white p-4 rounded-lg border">
              <Label className="flex items-center gap-2 mb-2">
                <Edit3 className="w-4 h-4" />
                Digite a Habilidade da BNCC
              </Label>
              <Textarea
                placeholder="Ex: Compreender e usar vocabulário básico sobre saudações, números e cores..."
                value={novoPlanejamento.habilidade}
                onChange={(e) => setNovoPlanejamento({ ...novoPlanejamento, habilidade: e.target.value })}
                rows={3}
                className="mb-2"
              />
              
              {/* Sugestões */}
              {sugestoesFiltradas.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">Sugestões de habilidades para {anoTurma}º ano:</p>
                  <div className="flex flex-wrap gap-2">
                    {sugestoesFiltradas.slice(0, 5).map(s => (
                      <button
                        key={s.codigo}
                        onClick={() => setNovoPlanejamento({ 
                          ...novoPlanejamento, 
                          habilidade: s.habilidade,
                          codigoBNCC: s.codigo 
                        })}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      >
                        {s.codigo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={gerarPlanejamentoIA} 
                disabled={!novoPlanejamento.habilidade || gerandoIA}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                {gerandoIA ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Gerando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Conteúdo Automático
                  </>
                )}
              </Button>
            </div>

            {/* Campos preenchidos pela IA */}
            {novoPlanejamento.habilidade && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      Código BNCC (opcional)
                    </Label>
                    <Input 
                      placeholder="Ex: EF06LI01"
                      value={novoPlanejamento.codigoBNCC} 
                      onChange={(e) => setNovoPlanejamento({...novoPlanejamento, codigoBNCC: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    Objeto de Conhecimento *
                  </Label>
                  <Textarea 
                    placeholder="Descreva o objeto de conhecimento..."
                    value={novoPlanejamento.objetoConhecimento} 
                    onChange={(e) => setNovoPlanejamento({...novoPlanejamento, objetoConhecimento: e.target.value})}
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Objetivos
                  </Label>
                  <Textarea 
                    value={novoPlanejamento.objetivos} 
                    onChange={(e) => setNovoPlanejamento({...novoPlanejamento, objetivos: e.target.value})}
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    Conteúdos
                  </Label>
                  <Textarea 
                    value={novoPlanejamento.conteudos} 
                    onChange={(e) => setNovoPlanejamento({...novoPlanejamento, conteudos: e.target.value})}
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-orange-500" />
                    Metodologia
                  </Label>
                  <Textarea 
                    value={novoPlanejamento.metodologia} 
                    onChange={(e) => setNovoPlanejamento({...novoPlanejamento, metodologia: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      Recursos
                    </Label>
                    <Textarea 
                      value={novoPlanejamento.recursos} 
                      onChange={(e) => setNovoPlanejamento({...novoPlanejamento, recursos: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500" />
                      Avaliação
                    </Label>
                    <Textarea 
                      value={novoPlanejamento.avaliacao} 
                      onChange={(e) => setNovoPlanejamento({...novoPlanejamento, avaliacao: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setMostrarForm(false);
                    setModoEdicao(null);
                    setNovoPlanejamento({
                      codigoBNCC: '',
                      habilidade: '',
                      objetoConhecimento: '',
                      objetivos: '',
                      conteudos: '',
                      metodologia: '',
                      recursos: '',
                      avaliacao: '',
                    });
                  }}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!novoPlanejamento.habilidade || !novoPlanejamento.objetoConhecimento}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {modoEdicao ? 'Salvar Alterações' : 'Salvar Planejamento'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de planejamentos */}
      <div className="space-y-4">
        {planejamentosFiltrados.length === 0 ? (
          <Card className="p-8 text-center">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum planejamento registrado para este período.</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "Novo Planejamento" para criar com auxílio da IA.</p>
          </Card>
        ) : (
          planejamentosFiltrados.map(planejamento => (
            <Card key={planejamento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Versão para visualização */}
                <div ref={relatorioRef} className="hidden">
                  <div className="info">
                    <div className="info-row"><span className="info-label">Turma:</span> {turma?.nome}</div>
                    <div className="info-row"><span className="info-label">Disciplina:</span> {disciplina?.nome}</div>
                    <div className="info-row"><span className="info-label">Bimestre:</span> {planejamento.bimestre}º</div>
                    <div className="info-row"><span className="info-label">Professor:</span> {PROFESSOR.nome}</div>
                  </div>

                  <div className="habilidade-box">
                    <strong>Código BNCC:</strong> {planejamento.codigoBNCC || 'Não informado'}<br/>
                    <strong>Habilidade:</strong> {planejamento.habilidade}
                  </div>

                  <div className="section">
                    <div className="section-title">OBJETO DE CONHECIMENTO</div>
                    <div className="section-content">{planejamento.objetoConhecimento}</div>
                  </div>

                  <div className="section">
                    <div className="section-title">OBJETIVOS</div>
                    <div className="section-content">{planejamento.objetivos}</div>
                  </div>

                  <div className="section">
                    <div className="section-title">CONTEÚDOS</div>
                    <div className="section-content">{planejamento.conteudos}</div>
                  </div>

                  <div className="section">
                    <div className="section-title">METODOLOGIA</div>
                    <div className="section-content">{planejamento.metodologia}</div>
                  </div>

                  <div className="section">
                    <div className="section-title">RECURSOS</div>
                    <div className="section-content">{planejamento.recursos}</div>
                  </div>

                  <div className="section">
                    <div className="section-title">AVALIAÇÃO</div>
                    <div className="section-content">{planejamento.avaliacao}</div>
                  </div>
                </div>

                {/* Versão para tela */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {planejamento.codigoBNCC && (
                        <Badge className="bg-purple-100 text-purple-700">
                          {planejamento.codigoBNCC}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">{bimestre}º Bimestre</span>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-3">{planejamento.habilidade}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-green-50 p-3 rounded">
                        <span className="font-medium text-green-700">Objeto de Conhecimento:</span>
                        <p className="text-gray-700 mt-1">{planejamento.objetoConhecimento}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Objetivos:</span>
                        <p className="text-gray-700 mt-1">{planejamento.objetivos}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Conteúdos:</span>
                        <p className="text-gray-700 mt-1">{planejamento.conteudos}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Metodologia:</span>
                        <p className="text-gray-700 mt-1">{planejamento.metodologia}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportarPDF()}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(planejamento)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500"
                      onClick={() => handleDelete(planejamento.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
