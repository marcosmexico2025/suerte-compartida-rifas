
export interface User {
  id: string;
  email: string;
  name: string;
  color: string;
  role: 'admin' | 'operator';
}

export interface RaffleNumber {
  id: string;
  number: number;
  status: 'available' | 'processing' | 'sold';
  seller_id: string | null;
  buyer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  payment_method: string;
  payment_proof: string | null;
  notes: string | null;
  created_at: string;
}

export interface RaffleSettings {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_per_number: number;
  winning_number: number | null;
  payment_methods: string[];
  created_at: string;
  updated_at: string;
}

export interface RaffleRequest {
  id: string;
  buyer_id: string;
  numbers: number[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  buyer: Buyer;
}

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'PSE' | 'Paypal';
