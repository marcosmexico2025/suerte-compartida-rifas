
import React, { useState } from 'react';
import { useRaffle } from '@/contexts/RaffleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethod } from '@/lib/types';
import { toast } from 'sonner';

const RequestForm = () => {
  const { selectedNumbers, createRequest, settings, clearSelectedNumbers } = useRaffle();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedNumbers.length === 0) {
      toast.error('Por favor seleccione al menos un número');
      return;
    }
    
    if (!name || !phone) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await createRequest({
        name,
        phone,
        email: email || null,
        payment_method: paymentMethod,
        notes: notes || null
      });
      
      if (success) {
        setName('');
        setPhone('');
        setEmail('');
        setPaymentMethod('Efectivo');
        setNotes('');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    clearSelectedNumbers();
    toast.info('Selección cancelada');
  };

  const getTotal = () => {
    return selectedNumbers.length * settings.price_per_number;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Solicitar Números</h2>
      
      {selectedNumbers.length > 0 ? (
        <div className="mb-4">
          <div className="bg-secondary p-3 rounded-md">
            <h3 className="font-medium">Números seleccionados:</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedNumbers.map((num) => (
                <span key={num} className="bg-primary text-white px-2 py-1 rounded-md text-sm">
                  {num}
                </span>
              ))}
            </div>
            <p className="mt-2 font-medium">
              Total: ${getTotal().toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground mb-4">
          Selecciona los números que deseas comprar en la tabla
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingrese su nombre completo"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Celular *</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ingrese su número de celular"
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
            placeholder="Ingrese su correo electrónico (opcional)"
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
        
        <div className="flex gap-3">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || selectedNumbers.length === 0}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
          
          {selectedNumbers.length > 0 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
