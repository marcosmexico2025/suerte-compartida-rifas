
import React from 'react';
import RaffleHeader from '@/components/RaffleHeader';
import RaffleDescription from '@/components/RaffleDescription';
import RaffleGrid from '@/components/RaffleGrid';
import RequestForm from '@/components/RequestForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <RaffleHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RaffleDescription />
            <RaffleGrid />
          </div>
          
          <div className="lg:col-span-1">
            <RequestForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
