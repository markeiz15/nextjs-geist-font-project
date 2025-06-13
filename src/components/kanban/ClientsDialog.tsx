"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Client } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClientsDialogProps {
  clients: Client[];
  onAddClient: (clientName: string) => void;
  onDeleteClient: (clientId: string) => void;
}

export function ClientsDialog({ clients, onAddClient, onDeleteClient }: ClientsDialogProps) {
  const [clientName, setClientName] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName.trim()) {
      await onAddClient(clientName.trim());
      setClientName("");
      setOpen(false);
      if (typeof onAddClient === "function" && "loadData" in onAddClient) {
        // Caso onAddClient tenha loadData, chamar para recarregar dados
        (onAddClient as any).loadData();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Clientes</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Clientes</DialogTitle>
        </DialogHeader>
        
        {/* Lista de Clientes */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Clientes Existentes</h3>
          <div className="space-y-2">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
              >
                <span className="font-medium">{client.name}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10l-4-4m0 0L9 3m1-1h4a1 1 0 011 1v3"
                        />
                      </svg>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente "{client.name}" 
                        e todos os seus projetos associados. Todos os consultores desses projetos ficarão disponíveis.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => onDeleteClient(client.id)}
                      >
                        Excluir Cliente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário para Adicionar Novo Cliente */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Adicionar Novo Cliente</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="clientName" className="text-sm font-medium">
                Nome do Cliente
              </label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Digite o nome do cliente"
              />
            </div>
            <Button type="submit" disabled={!clientName.trim()}>
              Adicionar Cliente
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
