"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import ProjectColumn from './ProjectColumn';
import { AddProjectDialog } from './AddProjectDialog';
import { AddConsultantDialog } from './AddConsultantDialog';
import { ClientsDialog } from './ClientsDialog';
import * as api from '../../lib/api-client';
import { Client, Project, Consultant } from '@prisma/client';
import { pusherClient, CHANNELS, EVENTS } from '../../lib/pusher';

type ConsultantWithProject = Consultant & {
  project?: Project & {
    client: Client;
  };
};

interface ExtendedConsultant extends ConsultantWithProject {
  projectTitle: string;
}

interface ExtendedClient extends Client {
  isExpanded: boolean;
}

export default function KanbanBoard() {
  const [consultants, setConsultants] = useState<ExtendedConsultant[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ExtendedClient[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null);

  // State to track minimized state of clients
  const [clientMinimizedView, setClientMinimizedView] = useState<{ [clientId: string]: boolean }>(() => ({}));

  // State to track minimized state of individual projects
  const [projectMinimizedView, setProjectMinimizedView] = useState<{ [projectId: string]: boolean }>(() => ({}));

  const toggleClientMinimizedViewWithToggle = (clientId: string) => {
    setClientMinimizedView(prev => {
      const newValue = !prev[clientId];
      const clientProjects = projects.filter(p => p.clientId === clientId);
      setProjectMinimizedView(prevProjects => {
        const newState = { ...prevProjects };
        clientProjects.forEach(p => {
          newState[p.id] = newValue;
        });
        return newState;
      });
      return {
        ...prev,
        [clientId]: newValue,
      };
    });
  };

  const toggleProjectMinimizedView = (projectId: string) => {
    setProjectMinimizedView(prev => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    loadData();

    // Subscribe to Pusher events
    const channel = pusherClient.subscribe(CHANNELS.KANBAN_UPDATES);

    channel.bind(EVENTS.CONSULTANT_MOVED, (updatedConsultant: ConsultantWithProject) => {
      setConsultants(prev => 
        prev.map(consultant => 
          consultant.id === updatedConsultant.id
            ? { ...updatedConsultant, projectTitle: updatedConsultant.project?.title || 'Disponível' }
            : consultant
        )
      );
    });

    channel.bind(EVENTS.CONSULTANT_ADDED, (newConsultant: ConsultantWithProject) => {
      setConsultants(prev => [
        ...prev,
        { ...newConsultant, projectTitle: newConsultant.project?.title || 'Disponível' },
      ]);
    });

    channel.bind(EVENTS.CONSULTANT_DELETED, ({ id }: { id: string }) => {
      setConsultants(prev => prev.filter(consultant => consultant.id !== id));
    });

    channel.bind(EVENTS.PROJECT_ADDED, (newProject: Project) => {
      setProjects(prev => [...prev, newProject]);
    });

    channel.bind(EVENTS.PROJECT_DELETED, ({ id }: { id: string }) => {
      setProjects(prev => prev.filter(project => project.id !== id));
      setConsultants(prev =>
        prev.map(consultant =>
          consultant.projectId === id
            ? { ...consultant, projectTitle: 'Disponível', projectId: null }
            : consultant
        )
      );
    });

    channel.bind(EVENTS.CLIENT_ADDED, (newClient: Client) => {
      setClients(prev => [...prev, { ...newClient, isExpanded: true }]);
    });

    channel.bind(EVENTS.CLIENT_DELETED, ({ id }: { id: string }) => {
      setClients(prev => prev.filter(client => client.id !== id));
      setProjects(prev => prev.filter(project => project.clientId !== id));
      setConsultants(prev =>
        prev.map(consultant =>
          projects.some(p => p.clientId === id && p.id === consultant.projectId)
            ? { ...consultant, projectTitle: 'Disponível', projectId: null }
            : consultant
        )
      );
    });

    // Cleanup on unmount
    return () => {
      pusherClient.unsubscribe(CHANNELS.KANBAN_UPDATES);
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [clientsData, projectsData, consultantsData] = await Promise.all([
        api.getClients(),
        api.getProjects(),
        api.getConsultants(),
      ]);

      setClients(clientsData.map(client => ({ ...client, isExpanded: true })));
      setProjects(projectsData);
      setConsultants(
        consultantsData.map(consultant => ({
          ...consultant,
          projectTitle: consultant.project?.title || 'Disponível',
        }))
      );

      // Reset minimization states to start expanded
      setClientMinimizedView({});
      setProjectMinimizedView({});
      // Garantir que todos os projetos iniciem expandidos
      // Remover minimizações anteriores
      // Remover minimizações para todos os projetos
      setProjectMinimizedView({});
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Falha ao carregar os dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id as string;

    // Apenas armazena o ID do projeto de destino
    if (overId === "Disponível") {
      setTargetProjectId(null);
      return;
    }

    const targetProject = projects.find(p => p.id === overId);
    if (targetProject) {
      setTargetProjectId(targetProject.id);
      return;
    }

    const overConsultant = consultants.find(c => c.id === overId);
    if (overConsultant) {
      setTargetProjectId(overConsultant.projectId);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event;
    if (!active) return;

    const activeId = active.id as string;
    const activeConsultant = consultants.find(c => c.id === activeId);
    if (!activeConsultant) return;

    try {
      await api.updateConsultant(activeId, targetProjectId);
    } catch (error) {
      console.error('Failed to update consultant:', error);
      setError('Falha ao atualizar o consultor. Por favor, tente novamente.');
      loadData();
    } finally {
      setActiveId(null);
      setTargetProjectId(null);
    }
  };

  const handleAddProject = async (projectName: string, clientId: string) => {
    try {
      setError(null);
      await api.createProject(projectName, clientId);
      // O Pusher atualizará o estado quando receber o evento PROJECT_ADDED
      await loadData(); // Atualização imediata como fallback
    } catch (error) {
      console.error('Failed to add project:', error);
      setError('Falha ao adicionar o projeto. Por favor, tente novamente.');
      await loadData();
    }
  };

  const handleEditProjectName = async (projectId: string, newName: string) => {
    try {
      setError(null);
      await api.updateProject(projectId, newName);
      await loadData(); // Recarrega os dados para atualizar a UI
    } catch (error) {
      console.error('Failed to update project name:', error);
      setError('Falha ao atualizar o nome do projeto. Por favor, tente novamente.');
    }
  };

  const handleAddClient = async (clientName: string) => {
    try {
      setError(null);
      await api.createClient(clientName);
      // O Pusher atualizará o estado quando receber o evento CLIENT_ADDED
    } catch (error) {
      console.error('Failed to add client:', error);
      setError('Falha ao adicionar o cliente. Por favor, tente novamente.');
      await loadData();
    }
  };

  const handleAddConsultant = async (consultant: { name: string; role?: string; projectId?: string }) => {
    try {
      setError(null);
      await api.createConsultant(consultant.name, consultant.role, consultant.projectId);
      // O Pusher atualizará o estado quando receber o evento CONSULTANT_ADDED
    } catch (error) {
      console.error('Failed to add consultant:', error);
      setError('Falha ao adicionar o consultor. Por favor, tente novamente.');
      await loadData();
    }
  };

  const handleDeleteConsultant = async (consultantId: string) => {
    try {
      setError(null);
      await api.deleteConsultant(consultantId);
      // O Pusher atualizará o estado quando receber o evento CONSULTANT_DELETED
    } catch (error) {
      console.error('Failed to delete consultant:', error);
      setError('Falha ao excluir o consultor. Por favor, tente novamente.');
      await loadData();
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setError(null);
      await api.deleteProject(projectId);
      // O Pusher atualizará o estado quando receber o evento PROJECT_DELETED
      await loadData(); // Atualização imediata como fallback
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError('Falha ao excluir o projeto. Por favor, tente novamente.');
      await loadData();
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      setError(null);
      await api.deleteClient(clientId);
      // O Pusher atualizará o estado quando receber o evento CLIENT_DELETED
    } catch (error) {
      console.error('Failed to delete client:', error);
      setError('Falha ao excluir o cliente. Por favor, tente novamente.');
      await loadData();
    }
  };

  const toggleClientExpansion = (clientId: string) => {
    setClients(prev =>
      prev.map(client =>
        client.id === clientId
          ? { ...client, isExpanded: !client.isExpanded }
          : client
      )
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-6">
        <ClientsDialog 
          clients={clients} 
          onAddClient={handleAddClient} 
          onDeleteClient={handleDeleteClient} 
        />
        <AddProjectDialog onAddProject={handleAddProject} clients={clients} />
        <AddConsultantDialog projects={projects} onAddConsultant={handleAddConsultant} />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="p-6 space-y-6">
          {/* Projetos Disponíveis sempre visíveis no topo */}
          <div className="flex space-x-4 overflow-x-auto pb-4">
            <ProjectColumn
              title="Disponível"
              consultants={consultants.filter(c => c.projectTitle === 'Disponível')}
              onDeleteConsultant={handleDeleteConsultant}
            />
          </div>

          {/* Grupos de Clientes */}
          {clients.map(client => (
            <div key={client.id} className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      toggleClientMinimizedViewWithToggle(client.id);
                    }}
                    className="text-red-500 hover:text-red-700 mr-2"
                    title="Minimizar todos os projetos"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleClientExpansion(client.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transform transition-transform ${
                        client.isExpanded ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <h2 className="text-lg font-semibold">{client.name}</h2>
                  <span className="text-sm text-gray-500">
                    ({projects.filter(p => p.clientId === client.id).length} projetos)
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`)) {
                      handleDeleteClient(client.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Excluir Cliente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10l-4-4m0 0L9 3m1-1h4a1 1 0 011 1v3" />
                  </svg>
                </button>
              </div>
              
              {client.isExpanded && (
                <div className={`overflow-x-auto pb-4 pl-6 ${clientMinimizedView[client.id] ? 'flex flex-col space-y-4 max-h-[calc(5*180px)] overflow-y-auto' : 'flex space-x-4 items-start'}`}>
                  {projects
                    .filter(project => project.clientId === client.id)
                    .map(project => (
                      <ProjectColumn
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        consultants={consultants.filter(
                          c => c.projectTitle === project.title
                        )}
                        onDeleteConsultant={handleDeleteConsultant}
                        onDeleteProject={handleDeleteProject}
                        onEditProjectName={handleEditProjectName}
                        forceMinimized={true}
                        isCollapsed={true}
                        onToggleCollapse={() => {
                          setProjectMinimizedView(prev => ({
                            ...prev,
                            [project.id]: !prev[project.id],
                          }));
                        }}
                      />
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
