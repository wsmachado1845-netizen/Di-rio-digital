// Tipos do Sistema de Gestão Escolar - U.I. Deuris De Deus

export interface Escola {
  nome: string;
  inep: string;
  endereco?: string;
}

export interface Professor {
  nome: string;
  matricula?: string;
}

export interface Turma {
  id: string;
  nome: string;
  serie: string;
  turno: 'MANHÃ' | 'TARDE' | 'NOITE';
  alunos: Aluno[];
}

export interface Aluno {
  id: string;
  nome: string;
  numeroChamada: number;
  situacao: 'A' | 'T' | 'D'; // A - Ativo, T - Transferido, D - Desistente
}

export interface Disciplina {
  id: string;
  codigo: string;
  nome: string;
  cargaHoraria: number;
}

export interface Aula {
  id: string;
  data: string;
  turmaId: string;
  disciplinaId: string;
  conteudo: string;
  observacoes?: string;
}

export interface Frequencia {
  alunoId: string;
  data: string;
  turmaId: string;
  disciplinaId: string;
  status: 'P' | 'F' | 'J'; // P - Presença, F - Falta, J - Falta Justificada
}

export interface Nota {
  id: string;
  alunoId: string;
  turmaId: string;
  disciplinaId: string;
  bimestre: 1 | 2 | 3 | 4;
  tipo: 'AVALIAÇÃO' | 'TRABALHO' | 'PARTICIPAÇÃO' | 'RECUPERAÇÃO';
  valor: number;
  peso: number;
  descricao?: string;
}

export interface PlanejamentoBNCC {
  id: string;
  turmaId: string;
  disciplinaId: string;
  bimestre: 1 | 2 | 3 | 4;
  codigoBNCC: string;
  habilidade: string;
  objetoConhecimento: string;
  objetivos: string;
  conteudos: string;
  metodologia: string;
  recursos: string;
  avaliacao: string;
}

export interface EventoCalendario {
  id: string;
  data: string;
  titulo: string;
  tipo: 'FERIADO' | 'RECESSO' | 'AULA' | 'PROVA' | 'EVENTO' | 'OUTRO';
  descricao?: string;
}

export interface GradeHorariaItem {
  id: string;
  turmaId: string;
  disciplinaId: string;
  diaSemana: 1 | 2 | 3 | 4 | 5 | 6; // 1=Segunda, 6=Sábado
  horarioInicio: string;
  horarioFim: string;
}

export interface Relatorio {
  tipo: 'MENSAL' | 'BIMESTRAL' | 'ANUAL';
  turmaId: string;
  disciplinaId: string;
  periodo: string;
  dataGeracao: string;
}

// Dados consolidados da escola
export const ESCOLA: Escola = {
  nome: 'UNIDADE INTEGRADA DEURIS DE DEUS MORENO DIAS',
  inep: '21231001',
};

export const PROFESSOR: Professor = {
  nome: 'FRANCISCO WELITON MACHADO DA SILVA',
  matricula: 'WELITON_SILVA',
};

export const DISCIPLINAS: Disciplina[] = [
  { id: 'LI', codigo: 'LI', nome: 'Língua Inglesa', cargaHoraria: 80 },
  { id: 'LP', codigo: 'LP', nome: 'Língua Portuguesa', cargaHoraria: 200 },
  { id: 'PT', codigo: 'PT', nome: 'Produção de Texto', cargaHoraria: 40 },
];

export const TURMAS: Turma[] = [
  {
    id: '6A',
    nome: '6º ANO A',
    serie: '6º ANO (9 ANOS)',
    turno: 'MANHÃ',
    alunos: [
      { id: '6A01', nome: 'BRAHIMOVIK COSTA SILVA', numeroChamada: 1, situacao: 'A' },
      { id: '6A02', nome: 'ELIEZER DA SILVA PEREIRA', numeroChamada: 2, situacao: 'A' },
      { id: '6A03', nome: 'EMILLY VITORIA RODRIGUES DOS SANTOS LIMA', numeroChamada: 3, situacao: 'A' },
      { id: '6A04', nome: 'ENZO KAUA DE JESUS SILVA', numeroChamada: 4, situacao: 'A' },
      { id: '6A05', nome: 'GUILHERME SILVA DE PAULA', numeroChamada: 5, situacao: 'A' },
      { id: '6A06', nome: 'INGRID DA CONCEICAO MORAIS', numeroChamada: 6, situacao: 'A' },
      { id: '6A07', nome: 'JHENIFER SILVA CONCEICAO', numeroChamada: 7, situacao: 'A' },
      { id: '6A08', nome: 'JHONN RIQUELME DE SOUSA BATISTA', numeroChamada: 8, situacao: 'A' },
      { id: '6A09', nome: 'JOAO VICTOR DA CRUZ CONCEICAO MOURAO', numeroChamada: 9, situacao: 'A' },
      { id: '6A10', nome: 'KALEBE WEITON AMORIM DE OLIVEIRA', numeroChamada: 10, situacao: 'A' },
      { id: '6A11', nome: 'KAYANE SOUSA TEIXEIRA', numeroChamada: 11, situacao: 'A' },
      { id: '6A12', nome: 'MARIA SAMIRY LIMA SILVA', numeroChamada: 12, situacao: 'A' },
      { id: '6A13', nome: 'PAULO SILVA SANTOS', numeroChamada: 13, situacao: 'A' },
      { id: '6A14', nome: 'PEDRO HENRIQUE SERRA COSTA', numeroChamada: 14, situacao: 'A' },
      { id: '6A15', nome: 'PEDRO SILVA SANTOS', numeroChamada: 15, situacao: 'A' },
      { id: '6A16', nome: 'SOPHIA CONCEICAO TORRES', numeroChamada: 16, situacao: 'A' },
      { id: '6A17', nome: 'TALITA NERES SILVA E SILVA', numeroChamada: 17, situacao: 'A' },
      { id: '6A18', nome: 'LUIS FERNANDO ROMAO DOS SANTOS', numeroChamada: 18, situacao: 'A' },
    ],
  },
  {
    id: '6B',
    nome: '6º ANO B',
    serie: '6º ANO (9 ANOS)',
    turno: 'MANHÃ',
    alunos: [
      { id: '6B01', nome: 'ALUNO EXEMPLO 1', numeroChamada: 1, situacao: 'A' },
      { id: '6B02', nome: 'ALUNO EXEMPLO 2', numeroChamada: 2, situacao: 'A' },
      { id: '6B03', nome: 'ALUNO EXEMPLO 3', numeroChamada: 3, situacao: 'A' },
      { id: '6B04', nome: 'ALUNO EXEMPLO 4', numeroChamada: 4, situacao: 'A' },
      { id: '6B05', nome: 'ALUNO EXEMPLO 5', numeroChamada: 5, situacao: 'A' },
    ],
  },
  {
    id: '7U',
    nome: '7º ANO U',
    serie: '7º ANO (9 ANOS)',
    turno: 'MANHÃ',
    alunos: [
      { id: '7U01', nome: 'ALUNO EXEMPLO 1', numeroChamada: 1, situacao: 'A' },
      { id: '7U02', nome: 'ALUNO EXEMPLO 2', numeroChamada: 2, situacao: 'A' },
      { id: '7U03', nome: 'ALUNO EXEMPLO 3', numeroChamada: 3, situacao: 'A' },
      { id: '7U04', nome: 'ALUNO EXEMPLO 4', numeroChamada: 4, situacao: 'A' },
      { id: '7U05', nome: 'ALUNO EXEMPLO 5', numeroChamada: 5, situacao: 'A' },
    ],
  },
  {
    id: '8U',
    nome: '8º ANO U',
    serie: '8º ANO (9 ANOS)',
    turno: 'MANHÃ',
    alunos: [
      { id: '8U01', nome: 'ALUNO EXEMPLO 1', numeroChamada: 1, situacao: 'A' },
      { id: '8U02', nome: 'ALUNO EXEMPLO 2', numeroChamada: 2, situacao: 'A' },
      { id: '8U03', nome: 'ALUNO EXEMPLO 3', numeroChamada: 3, situacao: 'A' },
      { id: '8U04', nome: 'ALUNO EXEMPLO 4', numeroChamada: 4, situacao: 'A' },
      { id: '8U05', nome: 'ALUNO EXEMPLO 5', numeroChamada: 5, situacao: 'A' },
    ],
  },
  {
    id: '9U',
    nome: '9º ANO U',
    serie: '9º ANO (9 ANOS)',
    turno: 'MANHÃ',
    alunos: [
      { id: '9U01', nome: 'ALUNO EXEMPLO 1', numeroChamada: 1, situacao: 'A' },
      { id: '9U02', nome: 'ALUNO EXEMPLO 2', numeroChamada: 2, situacao: 'A' },
      { id: '9U03', nome: 'ALUNO EXEMPLO 3', numeroChamada: 3, situacao: 'A' },
      { id: '9U04', nome: 'ALUNO EXEMPLO 4', numeroChamada: 4, situacao: 'A' },
      { id: '9U05', nome: 'ALUNO EXEMPLO 5', numeroChamada: 5, situacao: 'A' },
    ],
  },
];

// Calendário Escolar 2026 - SEMED Santa Luzia
export const CALENDARIO_2026: EventoCalendario[] = [
  // Janeiro
  { id: '1', data: '2026-01-01', titulo: 'Confraternização Universal', tipo: 'FERIADO' },
  { id: '2', data: '2026-01-20', titulo: 'Início do Ano Letivo', tipo: 'AULA' },
  
  // Fevereiro
  { id: '3', data: '2026-02-16', titulo: 'Carnaval', tipo: 'FERIADO' },
  { id: '4', data: '2026-02-17', titulo: 'Carnaval', tipo: 'FERIADO' },
  { id: '5', data: '2026-02-18', titulo: 'Quarta-feira de Cinzas', tipo: 'FERIADO' },
  
  // Março
  { id: '6', data: '2026-03-08', titulo: 'Dia Internacional da Mulher', tipo: 'FERIADO' },
  { id: '7', data: '2026-03-27', titulo: 'Paixão de Cristo', tipo: 'FERIADO' },
  
  // Abril
  { id: '8', data: '2026-04-21', titulo: 'Tiradentes', tipo: 'FERIADO' },
  { id: '9', data: '2026-04-22', titulo: 'Descobrimento do Brasil', tipo: 'FERIADO' },
  { id: '10', data: '2026-04-23', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '11', data: '2026-04-24', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '12', data: '2026-04-25', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  
  // Maio
  { id: '13', data: '2026-05-01', titulo: 'Dia do Trabalho', tipo: 'FERIADO' },
  { id: '14', data: '2026-05-14', titulo: 'Dia das Mães', tipo: 'EVENTO' },
  { id: '15', data: '2026-05-15', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '16', data: '2026-05-16', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  
  // Junho
  { id: '17', data: '2026-06-04', titulo: 'Corpus Christi', tipo: 'FERIADO' },
  { id: '18', data: '2026-06-12', titulo: 'Dia dos Namorados', tipo: 'EVENTO' },
  { id: '19', data: '2026-06-19', titulo: 'Dia do Orgulho LGBTQIA+', tipo: 'EVENTO' },
  { id: '20', data: '2026-06-24', titulo: 'São João', tipo: 'FERIADO' },
  { id: '21', data: '2026-06-29', titulo: 'São Pedro', tipo: 'FERIADO' },
  
  // Julho
  { id: '22', data: '2026-07-13', titulo: 'Início do 2º Semestre', tipo: 'AULA' },
  { id: '23', data: '2026-07-20', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '24', data: '2026-07-21', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '25', data: '2026-07-22', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '26', data: '2026-07-23', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '27', data: '2026-07-24', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  
  // Agosto
  { id: '28', data: '2026-08-11', titulo: 'Dia do Estudante', tipo: 'EVENTO' },
  { id: '29', data: '2026-08-15', titulo: 'Dia dos Pais', tipo: 'EVENTO' },
  
  // Setembro
  { id: '30', data: '2026-09-07', titulo: 'Independência do Brasil', tipo: 'FERIADO' },
  { id: '31', data: '2026-09-08', titulo: 'Dia da Alfabetização', tipo: 'EVENTO' },
  
  // Outubro
  { id: '32', data: '2026-10-03', titulo: 'Dia da Amazônia', tipo: 'EVENTO' },
  { id: '33', data: '2026-10-12', titulo: 'Nossa Senhora Aparecida', tipo: 'FERIADO' },
  { id: '34', data: '2026-10-15', titulo: 'Dia do Professor', tipo: 'EVENTO' },
  { id: '35', data: '2026-10-16', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '36', data: '2026-10-17', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '37', data: '2026-10-28', titulo: 'Dia do Servidor Público', tipo: 'FERIADO' },
  
  // Novembro
  { id: '38', data: '2026-11-02', titulo: 'Finados', tipo: 'FERIADO' },
  { id: '39', data: '2026-11-15', titulo: 'Proclamação da República', tipo: 'FERIADO' },
  { id: '40', data: '2026-11-20', titulo: 'Consciência Negra', tipo: 'FERIADO' },
  { id: '41', data: '2026-11-27', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  { id: '42', data: '2026-11-28', titulo: 'Recesso Escolar', tipo: 'RECESSO' },
  
  // Dezembro
  { id: '43', data: '2026-12-18', titulo: 'Encerramento do Ano Letivo', tipo: 'EVENTO' },
  { id: '44', data: '2026-12-25', titulo: 'Natal', tipo: 'FERIADO' },
];
