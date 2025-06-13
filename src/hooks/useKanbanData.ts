"use client";

import { useState, useEffect, useCallback } from "react";
import * as api from "../lib/api-client";
import { Client, Project, Consultant } from "@prisma/client";

export type ExtendedConsultant = Consultant & {
  projectTitle: string;
};

export type ExtendedClient = Client & {
  isExpanded: boolean;
};

export function useKanbanData() {
  const [consultants, setConsultants] = useState<ExtendedConsultant[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ExtendedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [clientsData, projectsData, consultantsData] = await Promise.all([
        api.getClients(),
        api.getProjects(),
        api.getConsultants(),
      ]);

      setClients(clientsData.map((client: Client) => ({ ...client, isExpanded: true })));
      setProjects(projectsData);
      setConsultants(
        consultantsData.map((consultant: Consultant & { project?: Project }) => ({
          ...consultant,
          projectTitle: consultant.project?.title || "Disponível",
        }))
      );
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Falha ao carregar os dados. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addClient = useCallback(
    async (name: string) => {
      try {
        setError(null);
        await api.createClient(name);
      } catch (error) {
        console.error("Failed to add client:", error);
        setError("Falha ao adicionar o cliente. Por favor, tente novamente.");
        await loadData();
        return;
      }
      await loadData();
    },
    [loadData]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await api.deleteClient(id);
      } catch (error) {
        console.error("Failed to delete client:", error);
        setError("Falha ao excluir o cliente. Por favor, tente novamente.");
        await loadData();
        return;
      }
      await loadData();
    },
    [loadData]
  );

  const addProject = useCallback(
    async (title: string, clientId: string) => {
      try {
        setError(null);
        await api.createProject(title, clientId);
      } catch (error) {
        console.error("Failed to add project:", error);
        setError("Falha ao adicionar o projeto. Por favor, tente novamente.");
        await loadData();
        return;
      }
      await loadData();
    },
    [loadData]
  );

  const updateProjectName = useCallback(
    async (id: string, newName: string) => {
      try {
        setError(null);
        await api.updateProject(id, newName);
        await loadData();
      } catch (error) {
        console.error("Failed to update project name:", error);
        setError("Falha ao atualizar o nome do projeto. Por favor, tente novamente.");
      }
    },
    [loadData]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await api.deleteProject(id);
      } catch (error) {
        console.error("Failed to delete project:", error);
        setError("Falha ao excluir o projeto. Por favor, tente novamente.");
        await loadData();
        return;
      }
      await loadData();
    },
    [loadData]
  );

  const addConsultant = useCallback(
    async (consultant: { name: string; role?: string; projectId?: string }) => {
      try {
        setError(null);
        await api.createConsultant(consultant.name, consultant.role, consultant.projectId);
      } catch (error) {
        console.error("Failed to add consultant:", error);
        setError("Falha ao adicionar o consultor. Por favor, tente novamente.");
        await loadData();
      }
    },
    [loadData]
  );

  const updateConsultantProject = useCallback(
    async (id: string, projectId: string | null) => {
      if (!id) {
        setError("ID do consultor é obrigatório para atualização.");
        return;
      }
      try {
        setError(null);
        await api.updateConsultant(id, projectId === undefined ? null : projectId);
      } catch (error) {
        console.error("Failed to update consultant:", error);
        setError("Falha ao atualizar o consultor. Por favor, tente novamente.");
        await loadData();
      }
    },
    [loadData]
  );

  const deleteConsultant = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await api.deleteConsultant(id);
      } catch (error) {
        console.error("Failed to delete consultant:", error);
        setError("Falha ao excluir o consultor. Por favor, tente novamente.");
        await loadData();
      }
    },
    [loadData]
  );

  const toggleClientExpansion = useCallback((clientId: string) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId ? { ...client, isExpanded: !client.isExpanded } : client
      )
    );
  }, []);

  return {
    consultants,
    projects,
    clients,
    isLoading,
    error,
    loadData,
    addClient,
    deleteClient,
    addProject,
    updateProjectName,
    deleteProject,
    addConsultant,
    updateConsultantProject,
    deleteConsultant,
    toggleClientExpansion,
  };
}
