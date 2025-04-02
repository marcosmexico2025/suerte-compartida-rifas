import React, { createContext, useContext, useState, useEffect } from 'react';
import { RaffleNumber, Buyer, RaffleSettings, RaffleRequest, PaymentMethod } from '@/lib/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('raffle_settings')
          .select('*')
          .limit(1)
          .single();

        if (settingsError) {
          console.error('Error fetching settings:', settingsError);
        } else if (settingsData) {
          setSettings(settingsData as RaffleSettings);
        }

        const { data: numbersData, error: numbersError } = await supabase
          .from('raffle_numbers')
          .select('*')
          .order('number', { ascending: true });

        if (numbersError) {
          console.error('Error fetching numbers:', numbersError);
        } else {
          setRaffleNumbers(numbersData as RaffleNumber[]);
        }

        const { data: buyersData, error: buyersError } = await supabase
          .from('buyers')
          .select('*');

        if (buyersError) {
          console.error('Error fetching buyers:', buyersError);
        } else {
          setBuyers(buyersData as Buyer[]);
        }

        const { data: requestsData, error: requestsError } = await supabase
          .from('raffle_requests')
          .select(`
            *,
            buyer:buyer_id (*)
          `);

        if (requestsError) {
          console.error('Error fetching requests:', requestsError);
        } else if (requestsData) {
          const requestsWithNumbers = await Promise.all(
            requestsData.map(async (request) => {
              const { data: numberRelations } = await supabase
                .from('raffle_request_numbers')
                .select('number_id')
                .eq('request_id', request.id);

              if (numberRelations) {
                const numbers: number[] = [];
                for (const relation of numberRelations) {
                  const { data: numberData } = await supabase
                    .from('raffle_numbers')
                    .select('number')
                    .eq('id', relation.number_id)
                    .single();

                  if (numberData) {
                    numbers.push(numberData.number);
                  }
                }

                const status = request.status as "pending" | "approved" | "rejected";
                
                return {
                  ...request,
                  numbers,
                  status
                };
              }
              return { 
                ...request, 
                numbers: [],
                status: request.status as "pending" | "approved" | "rejected" 
              };
            })
          );

          setRequests(requestsWithNumbers as RaffleRequest[]);
        }

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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
      const { data: newBuyerData, error: buyerError } = await supabase
        .from('buyers')
        .insert({
          name: buyerData.name || '',
          phone: buyerData.phone || '',
          email: buyerData.email || null,
          payment_method: buyerData.payment_method || 'Efectivo',
          payment_proof: buyerData.payment_proof || null,
          notes: buyerData.notes || null
        })
        .select()
        .single();

      if (buyerError) {
        throw new Error(`Error creating buyer: ${buyerError.message}`);
      }

      const { data: requestData, error: requestError } = await supabase
        .from('raffle_requests')
        .insert({
          buyer_id: newBuyerData.id,
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) {
        throw new Error(`Error creating request: ${requestError.message}`);
      }

      for (const number of selectedNumbers) {
        const { data: numberData } = await supabase
          .from('raffle_numbers')
          .select('id')
          .eq('number', number)
          .single();

        if (numberData) {
          await supabase
            .from('raffle_numbers')
            .update({ status: 'processing' })
            .eq('id', numberData.id);

          await supabase
            .from('raffle_request_numbers')
            .insert({
              request_id: requestData.id,
              number_id: numberData.id
            });
        }
      }

      const newBuyer: Buyer = newBuyerData;
      setBuyers(prev => [...prev, newBuyer]);

      const newRequest: RaffleRequest = {
        ...requestData,
        numbers: [...selectedNumbers],
        buyer: newBuyer,
        status: requestData.status as "pending" | "approved" | "rejected"
      };

      setRequests(prev => [...prev, newRequest]);

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
      const { data, error } = await supabase.rpc('approve_raffle_request', {
        request_id: requestId
      });

      if (error) {
        throw new Error(`Error approving request: ${error.message}`);
      }

      const request = requests.find(r => r.id === requestId);
      if (request) {
        setRequests(prev =>
          prev.map(r =>
            r.id === requestId ? { ...r, status: 'approved' } : r
          )
        );

        setRaffleNumbers(prev =>
          prev.map(num =>
            request.numbers.includes(num.number) ? { ...num, status: 'sold', buyer_id: request.buyer_id } : num
          )
        );
      }

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
      const { data, error } = await supabase.rpc('reject_raffle_request', {
        request_id: requestId
      });

      if (error) {
        throw new Error(`Error rejecting request: ${error.message}`);
      }

      const request = requests.find(r => r.id === requestId);
      if (request) {
        setRequests(prev =>
          prev.map(r =>
            r.id === requestId ? { ...r, status: 'rejected' } : r
          )
        );

        setRaffleNumbers(prev =>
          prev.map(num =>
            request.numbers.includes(num.number) ? { ...num, status: 'available', buyer_id: null } : num
          )
        );
      }

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
      const { data: newBuyerData, error: buyerError } = await supabase
        .from('buyers')
        .insert({
          name: buyerData.name || '',
          phone: buyerData.phone || '',
          email: buyerData.email || null,
          payment_method: buyerData.payment_method || 'Efectivo',
          payment_proof: buyerData.payment_proof || null,
          notes: buyerData.notes || null
        })
        .select()
        .single();

      if (buyerError) {
        throw new Error(`Error creating buyer: ${buyerError.message}`);
      }

      for (const number of numbers) {
        const { data: numberData } = await supabase
          .from('raffle_numbers')
          .select('id')
          .eq('number', number)
          .single();

        if (numberData) {
          await supabase
            .from('raffle_numbers')
            .update({
              status: 'sold',
              buyer_id: newBuyerData.id,
              seller_id: currentUser.id
            })
            .eq('id', numberData.id);
        }
      }

      const newBuyer: Buyer = newBuyerData;
      setBuyers(prev => [...prev, newBuyer]);

      setRaffleNumbers(prev =>
        prev.map(num =>
          numbers.includes(num.number)
            ? { ...num, status: 'sold', buyer_id: newBuyer.id, seller_id: currentUser.id }
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
      const { error } = await supabase
        .from('raffle_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) {
        throw new Error(`Error updating settings: ${error.message}`);
      }

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
      for (const number of numbers) {
        const { data: numberData } = await supabase
          .from('raffle_numbers')
          .select('id')
          .eq('number', number)
          .single();

        if (numberData) {
          await supabase
            .from('raffle_numbers')
            .update({
              seller_id: sellerId,
              updated_at: new Date().toISOString()
            })
            .eq('id', numberData.id);
        }
      }

      setRaffleNumbers(prev =>
        prev.map(num =>
          numbers.includes(num.number)
            ? { ...num, seller_id: sellerId, updated_at: new Date().toISOString() }
            : num
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
