
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsSummary from '@/components/dashboard/StatsSummary';
import RequestsTable from '@/components/dashboard/RequestsTable';
import DirectSaleForm from '@/components/dashboard/DirectSaleForm';
import AdminSettings from '@/components/dashboard/AdminSettings';
import UserManagement from '@/components/dashboard/UserManagement';
import NumberAssignment from '@/components/dashboard/NumberAssignment';
import PaymentMethodsManager from '@/components/dashboard/PaymentMethodsManager';

const Dashboard = () => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  const isAdmin = currentUser.role === 'admin';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8">
        <StatsSummary />
        
        <RequestsTable />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DirectSaleForm />
          
          {isAdmin && (
            <AdminSettings />
          )}
        </div>
        
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <UserManagement />
            <div className="flex flex-col gap-6">
              <NumberAssignment />
              <PaymentMethodsManager />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
