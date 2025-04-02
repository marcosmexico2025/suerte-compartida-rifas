
import React, { useState } from 'react';
import { useRaffle } from '@/contexts/RaffleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';

const RequestsTable = () => {
  const { requests, approveRequest, rejectRequest, raffleNumbers } = useRaffle();
  const { currentUser } = useAuth();
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // Filter requests based on user role and assigned numbers
  const filteredRequests = requests.filter(request => {
    // Admin can see all requests
    if (currentUser?.role === 'admin') {
      return true;
    }
    
    // Operators can see only their requests
    if (currentUser?.role === 'operator') {
      // Check if any of the request's numbers are assigned to this operator
      return request.numbers.some(num => {
        const raffleNum = raffleNumbers.find(r => r.number === num);
        return raffleNum?.seller_id === currentUser.id;
      });
    }
    
    return false;
  });
  
  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const otherRequests = filteredRequests.filter(r => r.status !== 'pending');

  const handleApprove = async (requestId: string) => {
    setProcessingIds(prev => [...prev, requestId]);
    try {
      await approveRequest(requestId);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingIds(prev => [...prev, requestId]);
    try {
      await rejectRequest(requestId);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const isProcessing = (requestId: string) => processingIds.includes(requestId);

  if (filteredRequests.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay solicitudes para mostrar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Solicitudes ({pendingRequests.length} pendientes)</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mb-2">Solicitudes Pendientes</h3>
            <div className="rounded-md border overflow-auto mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Números</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.buyer.name}</TableCell>
                      <TableCell>{request.buyer.phone}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {request.numbers.map((num) => (
                            <span key={num} className="bg-processing text-white px-2 py-0.5 rounded-sm text-xs">
                              {num}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{request.buyer.payment_method}</TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request.id)}
                            disabled={isProcessing(request.id)}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing(request.id)}
                            className="text-red-500 border-red-500 hover:bg-red-50"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Rechazar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {otherRequests.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mb-2">Solicitudes Procesadas</h3>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Números</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.buyer.name}</TableCell>
                      <TableCell>{request.buyer.phone}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {request.numbers.map((num) => (
                            <span 
                              key={num} 
                              className={`px-2 py-0.5 rounded-sm text-xs text-white ${
                                request.status === 'approved' ? 'bg-green-600' : 'bg-red-500'
                              }`}
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                        </span>
                      </TableCell>
                      <TableCell>{request.buyer.payment_method}</TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestsTable;
