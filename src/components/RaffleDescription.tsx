
import React from 'react';
import { useRaffle } from '@/contexts/RaffleContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const RaffleDescription = () => {
  const { settings } = useRaffle();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <h2 className="text-2xl font-bold">Sobre la Rifa</h2>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <p>{settings.description}</p>
          
          {settings.winning_number && (
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <h3 className="text-xl font-semibold text-green-700">¡Número Ganador!</h3>
              <div className="mt-2 flex justify-center">
                <span className="text-3xl font-bold bg-green-600 text-white px-6 py-2 rounded-md">
                  {settings.winning_number}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RaffleDescription;
