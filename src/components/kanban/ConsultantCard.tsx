"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Project, Consultant } from '@prisma/client';

interface ExtendedConsultant extends Consultant {
  projectTitle: string;
}

interface ConsultantCardProps {
  consultant: ExtendedConsultant;
  onDeleteConsultant?: (consultantId: string) => void;
  onMoveConsultant?: (consultantId: string, newProject: string) => void;
  allProjects?: Project[];
}

const ConsultantCard: React.FC<ConsultantCardProps> = ({
  consultant,
  onDeleteConsultant,
  onMoveConsultant,
  allProjects,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: consultant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-2 cursor-move bg-white hover:shadow-md transition-shadow"
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{consultant.name}</h3>
            {consultant.role && (
              <p className="text-sm text-gray-500">{consultant.role}</p>
            )}
          </div>
          <div className="flex gap-2">
            {onMoveConsultant && allProjects && (
              <select
                className="text-xs bg-transparent border rounded px-1 cursor-pointer"
                value={consultant.projectTitle}
                onChange={(e) => onMoveConsultant(consultant.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="Disponível">Disponível</option>
                {allProjects.map((project) => (
                  <option key={project.id} value={project.title}>
                    {project.title}
                  </option>
                ))}
              </select>
            )}
            {onDeleteConsultant && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Tem certeza que deseja excluir ${consultant.name}?`)) {
                    onDeleteConsultant(consultant.id);
                  }
                }}
                className="text-red-500 hover:text-red-700"
                title="Excluir Consultor"
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
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultantCard;
