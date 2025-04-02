
import React from 'react';
import { useRaffle } from '@/contexts/RaffleContext';

const RaffleGrid = () => {
  const { 
    raffleNumbers, 
    selectedNumbers, 
    toggleSelectNumber, 
    getSellerName,
    getSellerColor
  } = useRaffle();

  const getNumberClasses = (number: number, status: string) => {
    let classes = "raffle-number";
    
    if (status === 'available') {
      classes += " available";
    } else if (status === 'processing') {
      classes += " processing";
    } else if (status === 'sold') {
      classes += " sold";
    }
    
    if (selectedNumbers.includes(number)) {
      classes += " ring-2 ring-offset-2 ring-primary";
    }
    
    return classes;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-4">Selecciona tus números de la suerte</h2>
      
      <div className="overflow-x-auto">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 min-w-max">
          {raffleNumbers.map((raffle) => (
            <div 
              key={raffle.id} 
              className={getNumberClasses(raffle.number, raffle.status)}
              onClick={() => toggleSelectNumber(raffle.number)}
              style={{
                borderLeft: `4px solid ${getSellerColor(raffle.seller_id)}`
              }}
            >
              <div className="flex flex-col items-center">
                <span>{raffle.number}</span>
                {raffle.status !== 'sold' && (
                  <span className="text-xs mt-1 opacity-75">{getSellerName(raffle.seller_id)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-available rounded-full"></div>
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-processing rounded-full"></div>
            <span className="text-sm">En proceso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sold rounded-full"></div>
            <span className="text-sm">Vendido</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleGrid;
