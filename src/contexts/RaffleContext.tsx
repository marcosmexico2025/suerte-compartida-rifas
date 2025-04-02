
import React, { createContext, useContext, useState, useEffect } from 'react';
import { RaffleNumber, Buyer, RaffleSettings, RaffleRequest, PaymentMethod } from '@/lib/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface RaffleContextType {
  raffleNumbers: RaffleNumber[];
  buyers: Buyer[];
  requests: RaffleRequest[];
  settings: RaffleSettings;
  selectedNumbers: number[];
  isLoading: boolean;
  
  // Actions
  toggleSelectNumber: (number: number) => void;
  clearSelectedNumbers: () => void;
  createRequest: (buyerData: Partial<Buyer>) => Promise<boolean>;
  approveRequest: (requestId: string) => Promise<boolean>;
  rejectRequest: (requestId: string) => Promise<boolean>;
  registerDirectSale: (buyerData: Partial<Buyer>, numbers: number[]) => Promise<boolean>;
  updateSettings: (newSettings: Partial<RaffleSettings>) => Promise<boolean>;
  assignNumbersToSeller: (numbers: number[], sellerId: string) => Promise<boolean>;
  getSellerName: (sellerId: string | null) => string;
  getSellerColor: (sellerId: string | null) => string;
}

const defaultSettings: RaffleSettings = {
  id: '1',
  title: 'Gran Rifa de la Suerte',
  description: 'Participa en nuestra gran rifa y gana fabulosos premios',
  image_url: '/placeholder.svg',
  price_per_number: 5000,
  winning_number: null,
  payment_methods: ['Efectivo', 'Transferencia', 'PSE', 'Paypal'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Generate sample numbers
const generateInitialNumbers = (): RaffleNumber[] => {
  return Array.from({ length: 100 }, (_, i) => ({
    id: `number-${i + 1}`,
    number: i + 1,
    status: Math.random() > 0.8 ? 'sold' : (Math.random() > 0.7 ? 'processing' : 'available'),
    seller_id: Math.random() > 0.5 ? (Math.random() > 0.7 ? '1' : '2') : '3',
    buyer_id: Math.random() > 0.8 ? 'some-buyer-id' : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

const RaffleContext = createContext<RaffleContextType | null>(null);

export const useRaffle = () => {
  const context = useContext(RaffleContext);
  if (!context) {
    throw new Error('useRaffle must be used within an RaffleProvider');
  }
  return context;
};

export const RaffleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, currentUser } = useAuth();
  const [raffleNumbers, setRaffleNumbers] = useState<RaffleNumber[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [requests, setRequests] = useState<RaffleRequest[]>([]);
  const [settings, setSettings] = useState<RaffleSettings>(defaultSettings);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with sample data
  useEffect(() => {
    const initialNumbers = generateInitialNumbers();
    setRaffleNumbers(initialNumbers);
    
    // Sample buyers
    const sampleBuyers: Buyer[] = [
      {
        id: 'some-buyer-id',
        name: 'Juan Pérez',
        phone: '3001234567',
        email: 'juan@example.com',
        payment_method: 'Efectivo',
        payment_proof: null,
        notes: 'Cliente frecuente',
        created_at: new Date().toISOString()
      }
    ];
    
    setBuyers(sampleBuyers);
    
    // Sample requests
    const sampleRequests: RaffleRequest[] = [
      {
        id: 'request-1',
        buyer_id: 'some-buyer-id',
        numbers: [5, 10, 15],
        status: 'pending',
        created_at: new Date().toISOString(),
        buyer: sampleBuyers[0]
      }
    ];
    
    setRequests(sampleRequests);
    setIsLoading(false);
  }, []);

  const toggleSelectNumber = (number: number) => {
    const numObj = raffleNumbers.find(n => n.number === number);
    
    if (!numObj || numObj.status === 'sold') {
      return; // Cannot select sold numbers
    }
    
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  const clearSelectedNumbers = () => {
    setSelectedNumbers([]);
  };

  const createRequest = async (buyerData: Partial<Buyer>): Promise<boolean> => {
    if (selectedNumbers.length === 0) {
      toast.error('Por favor seleccione al menos un número');
      return false;
    }

    try {
      // In a real app, this would be an API call
      const newBuyer: Buyer = {
        id: `buyer-${Date.now()}`,
        name: buyerData.name || '',
        phone: buyerData.phone || '',
        email: buyerData.email || null,
        payment_method: buyerData.payment_method || 'Efectivo',
        payment_proof: buyerData.payment_proof || null,
        notes: buyerData.notes || null,
        created_at: new Date().toISOString()
      };

      // Add the buyer
      setBuyers(prev => [...prev, newBuyer]);

      // Create the request
      const newRequest: RaffleRequest = {
        id: `request-${Date.now()}`,
        buyer_id: newBuyer.id,
        numbers: [...selectedNumbers],
        status: 'pending',
        created_at: new Date().toISOString(),
        buyer: newBuyer
      };

      setRequests(prev => [...prev, newRequest]);

      // Update numbers status to processing
      setRaffleNumbers(prev =>
        prev.map(num =>
          selectedNumbers.includes(num.number) ? { ...num, status: 'processing' } : num
        )
      );

      toast.success('Solicitud enviada con éxito');
      clearSelectedNumbers();
      return true;
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error('Error al crear la solicitud');
      return false;
    }
  };

  const approveRequest = async (requestId: string): Promise<boolean> => {
    try {
      // Find the request
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        toast.error('Solicitud no encontrada');
        return false;
      }

      // Update the request status
      setRequests(prev =>
        prev.map(r =>
          r.id === requestId ? { ...r, status: 'approved' } : r
        )
      );

      // Update the numbers status to sold
      setRaffleNumbers(prev =>
        prev.map(num =>
          request.numbers.includes(num.number) ? { ...num, status: 'sold', buyer_id: request.buyer_id } : num
        )
      );

      toast.success('Solicitud aprobada con éxito');
      return true;
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error('Error al aprobar la solicitud');
      return false;
    }
  };

  const rejectRequest = async (requestId: string): Promise<boolean> => {
    try {
      // Find the request
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        toast.error('Solicitud no encontrada');
        return false;
      }

      // Update the request status
      setRequests(prev =>
        prev.map(r =>
          r.id === requestId ? { ...r, status: 'rejected' } : r
        )
      );

      // Update the numbers status back to available
      setRaffleNumbers(prev =>
        prev.map(num =>
          request.numbers.includes(num.number) ? { ...num, status: 'available', buyer_id: null } : num
        )
      );

      toast.success('Solicitud rechazada con éxito');
      return true;
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error('Error al rechazar la solicitud');
      return false;
    }
  };

  const registerDirectSale = async (buyerData: Partial<Buyer>, numbers: number[]): Promise<boolean> => {
    if (!currentUser) {
      toast.error('Debe iniciar sesión para registrar una venta');
      return false;
    }

    try {
      // Create a new buyer
      const newBuyer: Buyer = {
        id: `buyer-${Date.now()}`,
        name: buyerData.name || '',
        phone: buyerData.phone || '',
        email: buyerData.email || null,
        payment_method: buyerData.payment_method || 'Efectivo',
        payment_proof: buyerData.payment_proof || null,
        notes: buyerData.notes || null,
        created_at: new Date().toISOString()
      };

      setBuyers(prev => [...prev, newBuyer]);

      // Update numbers status to sold
      setRaffleNumbers(prev =>
        prev.map(num =>
          numbers.includes(num.number) ? 
            { ...num, status: 'sold', buyer_id: newBuyer.id, seller_id: currentUser.id } 
            : num
        )
      );

      toast.success('Venta registrada con éxito');
      return true;
    } catch (error) {
      console.error("Error registering sale:", error);
      toast.error('Error al registrar la venta');
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<RaffleSettings>): Promise<boolean> => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings, updated_at: new Date().toISOString() }));
      toast.success('Configuración actualizada con éxito');
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error('Error al actualizar la configuración');
      return false;
    }
  };

  const assignNumbersToSeller = async (numbers: number[], sellerId: string): Promise<boolean> => {
    try {
      setRaffleNumbers(prev =>
        prev.map(num =>
          numbers.includes(num.number) ? { ...num, seller_id: sellerId } : num
        )
      );
      toast.success('Números asignados con éxito');
      return true;
    } catch (error) {
      console.error("Error assigning numbers:", error);
      toast.error('Error al asignar números');
      return false;
    }
  };

  const getSellerName = (sellerId: string | null): string => {
    if (!sellerId) return 'No asignado';
    const seller = users.find(u => u.id === sellerId);
    return seller ? seller.name : 'Desconocido';
  };

  const getSellerColor = (sellerId: string | null): string => {
    if (!sellerId) return '#6B7280'; // Default gray
    const seller = users.find(u => u.id === sellerId);
    return seller ? seller.color : '#6B7280';
  };

  return (
    <RaffleContext.Provider
      value={{
        raffleNumbers,
        buyers,
        requests,
        settings,
        selectedNumbers,
        isLoading,
        toggleSelectNumber,
        clearSelectedNumbers,
        createRequest,
        approveRequest,
        rejectRequest,
        registerDirectSale,
        updateSettings,
        assignNumbersToSeller,
        getSellerName,
        getSellerColor
      }}
    >
      {children}
    </RaffleContext.Provider>
  );
};
