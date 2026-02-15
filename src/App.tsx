import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Brain, 
  FileText,
  School,
  User,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ESCOLA, PROFESSOR } from '@/types';

// Importação dos componentes de abas
import CalendarioEscolar from '@/components/tabs/CalendarioEscolar';
import GradeHoraria from '@/components/tabs/GradeHoraria';
import Aulas from '@/components/tabs/Aulas';
import FrequenciaDiaria from '@/components/tabs/FrequenciaDiaria';
import Notas from '@/components/tabs/Notas';
import PlanejamentoBNCC from '@/components/tabs/PlanejamentoBNCC';
import Relatorios from '@/components/tabs/Relatorios';

const abas = [
  { id: 'calendario', nome: 'Calendário', icone: Calendar, componente: CalendarioEscolar },
  { id: 'grade', nome: 'Grade Horária', icone: Clock, componente: GradeHoraria },
  { id: 'aulas', nome: 'Aulas', icone: BookOpen, componente: Aulas },
  { id: 'frequencia', nome: 'Frequência', icone: Users, componente: FrequenciaDiaria },
  { id: 'notas', nome: 'Notas', icone: TrendingUp, componente: Notas },
  { id: 'bncc', nome: 'Planejamento BNCC', icone: Brain, componente: PlanejamentoBNCC },
  { id: 'relatorios', nome: 'Relatórios', icone: FileText, componente: Relatorios },
];

function App() {
  const [abaAtiva, setAbaAtiva] = useState('calendario');
  const [menuAberto, setMenuAberto] = useState(false);

  const ComponenteAtivo = abas.find(a => a.id === abaAtiva)?.componente || CalendarioEscolar;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e título */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  Sistema de Gestão Escolar
                </h1>
                <p className="text-xs text-gray-500">{ESCOLA.nome}</p>
              </div>
            </div>

            {/* Info do professor - desktop */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{PROFESSOR.nome}</p>
                <p className="text-xs text-gray-500">Professor</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-full">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>

            {/* Menu mobile */}
            <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4 border-b">
                    <span className="font-semibold">Menu</span>
                  </div>
                  <nav className="flex-1 py-4">
                    {abas.map(aba => {
                      const Icone = aba.icone;
                      return (
                        <button
                          key={aba.id}
                          onClick={() => {
                            setAbaAtiva(aba.id);
                            setMenuAberto(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            abaAtiva === aba.id 
                              ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icone className="w-5 h-5" />
                          <span className="font-medium">{aba.nome}</span>
                        </button>
                      );
                    })}
                  </nav>
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-3 px-4">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{PROFESSOR.nome}</p>
                        <p className="text-xs text-gray-500">Professor</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Navegação por abas - desktop */}
      <nav className="bg-white border-b hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {abas.map(aba => {
              const Icone = aba.icone;
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    abaAtiva === aba.id 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icone className="w-4 h-4" />
                  {aba.nome}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Navegação mobile - bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around overflow-x-auto">
          {abas.slice(0, 5).map(aba => {
            const Icone = aba.icone;
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`flex flex-col items-center px-3 py-2 text-xs ${
                  abaAtiva === aba.id 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                <Icone className="w-5 h-5 mb-1" />
                <span className="truncate max-w-[60px]">{aba.nome}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <ComponenteAtivo />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>© 2026 - Sistema de Gestão Escolar</p>
            <p>{ESCOLA.nome} - INEP: {ESCOLA.inep}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
