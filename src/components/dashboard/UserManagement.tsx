
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User } from '@/lib/types';
import { Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// This component now uses Supabase for user management
const UserManagement = () => {
  const { users, refreshUsers } = useAuth();
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    color: '#6B7280',
    role: 'operator'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For editing users
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    color: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create the user in authentication system
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: 'temporary-password',
        user_metadata: { name: newUser.name },
        email_confirm: true,
      });

      if (authError) {
        throw authError;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          name: newUser.name,
          color: newUser.color,
          role: newUser.role
        }]);

      if (profileError) {
        throw profileError;
      }

      toast.success('Usuario creado exitosamente');
      setNewUser({
        email: '',
        name: '',
        color: '#6B7280',
        role: 'operator'
      });
      
      // Refresh the user list
      refreshUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      color: user.color
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: editForm.name,
          color: editForm.color,
          updated_at: new Date()
        })
        .eq('id', editingUser.id);

      if (error) {
        throw error;
      }

      toast.success('Usuario actualizado exitosamente');
      setEditDialogOpen(false);
      refreshUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Usuarios Actuales</h3>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: user.color }}
                        ></div>
                        <span>{user.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil size={16} />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Nombre del usuario"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value) => setNewUser({ ...newUser, role: value as 'admin' | 'operator' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operator">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={newUser.color}
                onChange={(e) => setNewUser({ ...newUser, color: e.target.value })}
                className="h-10 w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </form>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Nombre del usuario"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    className="h-10 w-full"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
