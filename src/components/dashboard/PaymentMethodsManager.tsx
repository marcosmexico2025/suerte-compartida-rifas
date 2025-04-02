
import React, { useState } from 'react';
import { useRaffle } from '@/contexts/RaffleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const PaymentMethodsManager = () => {
  const { settings, updateSettings } = useRaffle();
  const [newMethod, setNewMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMethod = async () => {
    if (!newMethod.trim()) {
      toast.error('Por favor ingrese un método de pago válido');
      return;
    }
    
    if (settings.payment_methods.includes(newMethod)) {
      toast.error('Este método de pago ya existe');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedMethods = [...settings.payment_methods, newMethod];
      await updateSettings({ payment_methods: updatedMethods });
      setNewMethod('');
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMethod = async (method: string) => {
    setIsSubmitting(true);
    try {
      const updatedMethods = settings.payment_methods.filter(m => m !== method);
      await updateSettings({ payment_methods: updatedMethods });
    } catch (error) {
      console.error('Error removing payment method:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="payment-method" className="sr-only">
                Nuevo método de pago
              </Label>
              <Input
                id="payment-method"
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                placeholder="Añadir nuevo método de pago"
                disabled={isSubmitting}
              />
            </div>
            <Button type="button" onClick={addMethod} disabled={isSubmitting}>
              Añadir
            </Button>
          </div>
          
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.payment_methods.map((method) => (
                  <TableRow key={method}>
                    <TableCell>{method}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMethod(method)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsManager;
