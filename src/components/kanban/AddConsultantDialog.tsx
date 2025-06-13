"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from 'lucide-react';

interface Project {
  id: string;
  title: string;
}

interface AddConsultantDialogProps {
  projects: Project[];
  onAddConsultant: (consultant: { name: string; role?: string; projectId?: string }) => void;
}

export function AddConsultantDialog({ projects, onAddConsultant }: AddConsultantDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    project: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const project = formData.project === 'Disponível' 
        ? undefined 
        : projects.find(p => p.title === formData.project);
        
      onAddConsultant({
        name: formData.name.trim(),
        role: formData.role.trim() || undefined,
        projectId: project?.id,
      });
      setFormData({ name: '', role: '', project: '' });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Consultor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Consultor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Consultor</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome do consultor"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Digite o cargo do consultor"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project">Projeto</Label>
              <Select
                value={formData.project}
                onValueChange={(value) => setFormData({ ...formData, project: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.title}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!formData.name.trim()}>
              Adicionar Consultor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
