
import React, { useState } from 'react';
import { useRaffle } from '@/contexts/RaffleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const NumberAssignment = () => {
  const { assignNumbersToSeller } = useRaffle();
  const { users } = useAuth();
  const [range, setRange] = useState({ start: '', end: '' });
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(range.start);
    const end = parseInt(range.end);
    
    if (isNaN(start) || isNaN(end)) {
      toast.error('Por favor ingrese números válidos');
      return;
    }
    
    if (start > end) {
      toast.error('El número inicial no puede ser mayor que el final');
      return;
    }
    
    if (!selectedSellerId) {
      toast.error('Por favor seleccione un vendedor');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Generate number array from range
      const numbers = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
      
      await assignNumbersToSeller(numbers, selectedSellerId);
      setRange({ start: '', end: '' });
    } catch (error) {
      console.error('Error assigning numbers:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignación de Números</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-number">Número Inicial</Label>
              <Input
                id="start-number"
                type="number"
                value={range.start}
                onChange={(e) => setRange({ ...range, start: e.target.value })}
                placeholder="Ej: 1"
                min="1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-number">Número Final</Label>
              <Input
                id="end-number"
                type="number"
                value={range.end}
                onChange={(e) => setRange({ ...range, end: e.target.value })}
                placeholder="Ej: 10"
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seller">Vendedor</Label>
            <Select 
              value={selectedSellerId} 
              onValueChange={setSelectedSellerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un vendedor" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: user.color }}
                      ></div>
                      <span>{user.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Asignando...' : 'Asignar Números'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NumberAssignment;
