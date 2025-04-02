
import React, { useMemo } from 'react';
import { useRaffle } from '@/contexts/RaffleContext';
import { Card, CardContent } from '@/components/ui/card';

const StatsSummary = () => {
  const { raffleNumbers, settings } = useRaffle();
  
  const stats = useMemo(() => {
    const total = raffleNumbers.length;
    const sold = raffleNumbers.filter(n => n.status === 'sold').length;
    const processing = raffleNumbers.filter(n => n.status === 'processing').length;
    const available = raffleNumbers.filter(n => n.status === 'available').length;
    
    // Calculate total sales
    const totalSales = sold * settings.price_per_number;
    
    // Group by payment method
    const paymentMethods: Record<string, number> = {};
    raffleNumbers.forEach(num => {
      if (num.status === 'sold' && num.buyer_id) {
        // In a real app, you'd query the buyer's payment method
        const method = 'Efectivo'; // Placeholder
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
      }
    });
    
    return {
      total,
      sold,
      processing,
      available,
      totalSales,
      paymentMethods
    };
  }, [raffleNumbers, settings]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Números Vendidos</p>
            <p className="text-3xl font-bold">{stats.sold}</p>
            <p className="text-xs text-muted-foreground mt-1">
              de {stats.total} ({Math.round((stats.sold / stats.total) * 100)}%)
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">En Proceso</p>
            <p className="text-3xl font-bold">{stats.processing}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ({Math.round((stats.processing / stats.total) * 100)}%)
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Disponibles</p>
            <p className="text-3xl font-bold">{stats.available}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ({Math.round((stats.available / stats.total) * 100)}%)
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Ventas Totales</p>
            <p className="text-3xl font-bold">${stats.totalSales.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.sold} números a ${settings.price_per_number.toLocaleString()} c/u
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummary;
