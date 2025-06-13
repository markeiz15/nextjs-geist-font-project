import { Client, Project, Consultant } from '@prisma/client';

export type ClientWithProjects = Client & {
  projects: Project[];
};

export type ProjectWithClientAndConsultants = Project & {
  client: Client;
  consultants: Consultant[];
};

export type ConsultantWithProject = Consultant & {
  project: Project & {
    client: Client;
  };
};

// Client API calls
export async function getClients(): Promise<ClientWithProjects[]> {
  const response = await fetch('/api/clients');
  if (!response.ok) throw new Error('Failed to fetch clients');
  return response.json();
}

export async function createClient(name: string): Promise<Client> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to create client');
  return response.json();
}

export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete client');
}

// Project API calls
export async function getProjects(): Promise<ProjectWithClientAndConsultants[]> {
  const response = await fetch('/api/projects');
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
}

export async function createProject(title: string, clientId: string): Promise<Project> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, clientId }),
  });
  if (!response.ok) throw new Error('Failed to create project');
  return response.json();
}

export async function updateProject(id: string, title: string): Promise<Project> {
  const response = await fetch(`/api/projects?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to update project');
  return response.json();
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete project');
}

// Consultant API calls
export async function getConsultants(): Promise<ConsultantWithProject[]> {
  const response = await fetch('/api/consultants');
  if (!response.ok) throw new Error('Failed to fetch consultants');
  return response.json();
}

export async function createConsultant(name: string, role: string | undefined, projectId: string | undefined): Promise<Consultant> {
  const response = await fetch('/api/consultants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, role, projectId }),
  });
  if (!response.ok) throw new Error('Failed to create consultant');
  return response.json();
}

export async function updateConsultant(id: string, projectId: string | null): Promise<Consultant> {
  const response = await fetch(`/api/consultants?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  if (!response.ok) throw new Error('Failed to update consultant');
  return response.json();
}

export async function deleteConsultant(id: string): Promise<void> {
  const response = await fetch(`/api/consultants?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete consultant');
}
