
import React, { useState } from 'react';
import { useRaffle } from '@/contexts/RaffleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AdminSettings = () => {
  const { settings, updateSettings } = useRaffle();
  const [title, setTitle] = useState(settings.title);
  const [description, setDescription] = useState(settings.description);
  const [imageUrl, setImageUrl] = useState(settings.image_url);
  const [price, setPrice] = useState(settings.price_per_number.toString());
  const [winningNumber, setWinningNumber] = useState(settings.winning_number?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateSettings({
        title,
        description,
        image_url: imageUrl,
        price_per_number: parseInt(price),
        winning_number: winningNumber ? parseInt(winningNumber) : null
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de la Rifa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la Rifa</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la rifa"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la rifa"
              rows={4}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image-url">URL de la Imagen</Label>
            <Input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL de la imagen"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Precio por Número</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Precio por número"
              min="0"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="winning-number">Número Ganador</Label>
            <Input
              id="winning-number"
              type="number"
              value={winningNumber}
              onChange={(e) => setWinningNumber(e.target.value)}
              placeholder="Ingrese el número ganador (opcional)"
              min="1"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
