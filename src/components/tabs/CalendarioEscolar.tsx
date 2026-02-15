import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCalendario } from '@/hooks/useAppState';
import type { EventoCalendario } from '@/types';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const tipoCores: Record<string, string> = {
  FERIADO: 'bg-red-100 text-red-800 border-red-200',
  RECESSO: 'bg-orange-100 text-orange-800 border-orange-200',
  AULA: 'bg-green-100 text-green-800 border-green-200',
  PROVA: 'bg-purple-100 text-purple-800 border-purple-200',
  EVENTO: 'bg-blue-100 text-blue-800 border-blue-200',
  OUTRO: 'bg-gray-100 text-gray-800 border-gray-200',
};

const tipoCoresBadge: Record<string, string> = {
  FERIADO: 'bg-red-500',
  RECESSO: 'bg-orange-500',
  AULA: 'bg-green-500',
  PROVA: 'bg-purple-500',
  EVENTO: 'bg-blue-500',
  OUTRO: 'bg-gray-500',
};

export default function CalendarioEscolar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [eventos] = useCalendario();
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoCalendario | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = getDay(monthStart);

  const getEventosDoDia = (date: Date): EventoCalendario[] => {
    return eventos.filter(evento => isSameDay(new Date(evento.data), date));
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Calendário Escolar 2026
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[150px] text-center">
            {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {diasSemana.map(dia => (
                <div key={dia} className="text-center font-semibold text-sm py-2 bg-gray-100 rounded">
                  {dia}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, index) => (
                <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded" />
              ))}
              {days.map(day => {
                const eventosDia = getEventosDoDia(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={day.toISOString()}
                    className={`h-24 border rounded p-1 cursor-pointer transition-all hover:shadow-md ${
                      isToday ? 'border-blue-500 border-2' : 'border-gray-200'
                    } ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}`}
                    onClick={() => {
                      if (eventosDia.length > 0) {
                        setEventoSelecionado(eventosDia[0]);
                      }
                    }}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {eventosDia.slice(0, 2).map((evento, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-1 py-0.5 rounded truncate ${tipoCores[evento.tipo] || tipoCores.OUTRO}`}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                      {eventosDia.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{eventosDia.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Painel lateral */}
        <div className="space-y-4">
          {/* Legenda */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(tipoCoresBadge).map(([tipo, cor]) => (
                <div key={tipo} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${cor}`} />
                  <span className="text-sm">{tipo}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Eventos do mês */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Eventos de {meses[currentDate.getMonth()]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
              {eventos
                .filter(e => new Date(e.data).getMonth() === currentDate.getMonth())
                .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                .map(evento => (
                  <div
                    key={evento.id}
                    className={`p-2 rounded border cursor-pointer hover:shadow-sm transition-shadow ${
                      tipoCores[evento.tipo] || tipoCores.OUTRO
                    }`}
                    onClick={() => setEventoSelecionado(evento)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{evento.titulo}</span>
                      <span className="text-xs">
                        {format(new Date(evento.data), 'dd/MM')}
                      </span>
                    </div>
                    {evento.descricao && (
                      <p className="text-xs mt-1 opacity-80">{evento.descricao}</p>
                    )}
                  </div>
                ))}
              {eventos.filter(e => new Date(e.data).getMonth() === currentDate.getMonth()).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum evento neste mês
                </p>
              )}
            </CardContent>
          </Card>

          {/* Detalhes do evento selecionado */}
          {eventoSelecionado && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Detalhes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={tipoCoresBadge[eventoSelecionado.tipo] || tipoCoresBadge.OUTRO}>
                  {eventoSelecionado.tipo}
                </Badge>
                <h4 className="font-semibold mt-2">{eventoSelecionado.titulo}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(eventoSelecionado.data), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                </p>
                {eventoSelecionado.descricao && (
                  <p className="text-sm mt-2">{eventoSelecionado.descricao}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
