"use client";

import React from "react";
import { ClientsDialog } from "./ClientsDialog";

interface ClientsDialogWrapperProps {
  clients: any[];
  onAddClient: (clientName: string) => Promise<void>;
  onDeleteClient: (clientId: string) => void;
  loadData: () => Promise<void>;
}

export function ClientsDialogWrapper({ clients, onAddClient, onDeleteClient, loadData }: ClientsDialogWrapperProps) {
  const handleAddClient = async (clientName: string) => {
    await onAddClient(clientName);
    await loadData();
  };

  const handleDeleteClient = async (clientId: string) => {
    await onDeleteClient(clientId);
    await loadData();
  };

  return (
    <ClientsDialog
      clients={clients}
      onAddClient={handleAddClient}
      onDeleteClient={handleDeleteClient}
    />
  );
}
