
import React, { useState } from 'react';
import { useRaffle } from '@/contexts/RaffleContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethod } from '@/lib/types';
import { toast } from 'sonner';

const DirectSaleForm = () => {
  const { raffleNumbers, registerDirectSale, settings } = useRaffle();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [notes, setNotes] = useState('');
  const [selectedNums, setSelectedNums] = useState<number[]>([]);
  const [numberInput, setNumberInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedNums.length === 0) {
      toast.error('Por favor, seleccione al menos un número');
      return;
    }
    
    if (!name || !phone) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await registerDirectSale({
        name,
        phone,
        email: email || null,
        payment_method: paymentMethod,
        notes: notes || null
      }, selectedNums);
      
      if (success) {
        setName('');
        setPhone('');
        setEmail('');
        setPaymentMethod('Efectivo');
        setNotes('');
        setSelectedNums([]);
        setNumberInput('');
      }
    } catch (error) {
      console.error('Error registering sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNumber = () => {
    const num = parseInt(numberInput);
    if (isNaN(num)) {
      toast.error('Por favor ingrese un número válido');
      return;
    }

    const raffleNum = raffleNumbers.find(r => r.number === num);
    if (!raffleNum) {
      toast.error('Número no encontrado');
      return;
    }

    if (raffleNum.status === 'sold') {
      toast.error('Este número ya está vendido');
      return;
    }

    if (selectedNums.includes(num)) {
      toast.error('Este número ya está seleccionado');
      return;
    }

    setSelectedNums(prev => [...prev, num]);
    setNumberInput('');
  };

  const removeNumber = (num: number) => {
    setSelectedNums(prev => prev.filter(n => n !== num));
  };

  const getTotal = () => {
    return selectedNums.length * settings.price_per_number;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venta Directa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="number-input">Agregar Números</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="number-input"
              type="text"
              placeholder="Ej: 42"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
            />
            <Button type="button" onClick={addNumber}>
              Agregar
            </Button>
          </div>
        </div>

        {selectedNums.length > 0 && (
          <div className="mb-4">
            <Label>Números Seleccionados</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedNums.map(num => (
                <div key={num} className="bg-primary text-white px-3 py-1 rounded-md flex items-center">
                  <span>{num}</span>
                  <button
                    type="button"
                    className="ml-2 focus:outline-none"
                    onClick={() => removeNumber(num)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 font-medium">
              Total: ${getTotal().toLocaleString()}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingrese el nombre completo"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Celular *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ingrese el número de celular"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese el correo electrónico (opcional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-method">Forma de pago *</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione forma de pago" />
              </SelectTrigger>
              <SelectContent>
                {settings.payment_methods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ingrese cualquier información adicional (opcional)"
              rows={3}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || selectedNums.length === 0}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DirectSaleForm;
