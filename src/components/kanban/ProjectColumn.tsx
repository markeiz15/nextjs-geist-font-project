"use client";

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ConsultantCard from './ConsultantCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, Consultant } from '@prisma/client';

interface ExtendedConsultant extends Consultant {
  projectTitle: string;
}

interface ProjectColumnProps {
  id?: string;
  title: string;
  consultants: ExtendedConsultant[];
  onDeleteProject?: (projectId: string) => void;
  onEditProjectName?: (projectId: string, newName: string) => void;
  onDeleteConsultant?: (consultantId: string) => void;
  onMoveConsultant?: (consultantId: string, newProject: string) => void;
  allProjects?: Project[];
  isCollapsed?: boolean;
  forceMinimized?: boolean;
  onToggleCollapse?: () => void;
}

const ProjectColumn: React.FC<ProjectColumnProps> = ({ 
  id, 
  title, 
  consultants,
  onDeleteProject,
  onEditProjectName,
  onDeleteConsultant,
  onMoveConsultant,
  allProjects,
  isCollapsed = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isCollapsedState, setIsCollapsedState] = useState(isCollapsed);

  const { setNodeRef, isOver } = useDroppable({
    id: id || title,
  });

  const MIN_WIDTH = 200;
  const MAX_WIDTH = 500;
  const WIDTH_PER_CONSULTANT = 50;

  // Revertendo largura para fixa e implementando altura dinâmica
  const MIN_HEIGHT = 150;
  const HEIGHT_PER_CONSULTANT = 50;

  // Removendo altura fixa para deixar o card crescer naturalmente
  // const computedHeight = MIN_HEIGHT + (consultants?.length || 0) * HEIGHT_PER_CONSULTANT;

  return (
    <Card 
      style={
        !isCollapsedState 
          ? undefined
          : undefined
      }
      className={`${isCollapsedState ? (title === 'Disponível' ? 'h-[60px] min-h-[60px] cursor-pointer' : 'w-[180px] min-w-[180px] cursor-pointer') : 'w-[300px] min-w-[300px]'} mx-2 bg-gray-50 transition-all duration-300 overflow-visible relative`}
      onClick={() => isCollapsedState && setIsCollapsedState(false)}
    >
      <CardHeader className="p-4 relative">
        {isCollapsedState ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-90 px-1">
            <span className="text-2xl font-bold text-gray-800">
              {consultants.length}
            </span>
            <span className="text-sm text-gray-600 mb-2">
              Consultor{consultants.length !== 1 ? "es" : ""}
            </span>
            <span className="text-xs font-semibold text-gray-700 writing-mode-vertical-lr whitespace-nowrap max-h-[calc(100%-1rem)] max-w-[1.6rem] overflow-visible text-center mx-auto break-words" style={{minWidth: '160px'}}>
              {title.length > 12 ? title.slice(0, 12) + "..." : title}
            </span>
          </div>
        ) : (
          <div className={`flex items-center justify-between group relative`}>
            {isEditing && title !== 'Disponível' && id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={() => {
                    if (newTitle.trim() && newTitle !== title && onEditProjectName) {
                      onEditProjectName(id, newTitle);
                    }
                    setIsEditing(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTitle.trim() && newTitle !== title && onEditProjectName) {
                      onEditProjectName(id, newTitle);
                      setIsEditing(false);
                    }
                  }}
                  className="text-lg font-semibold bg-white border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CardTitle 
                  className={`text-lg font-semibold cursor-pointer ${
                    isCollapsedState ? 'writing-mode-vertical-lr transform my-4 whitespace-nowrap' : ''
                  }`}
                  onClick={() => title !== 'Disponível' && !isCollapsedState && setIsEditing(true)}
                >
                  {isCollapsedState ? title.slice(0, 12) : title}
                  {isCollapsedState && title.length > 12 && "..."}
                </CardTitle>
              </div>
            )}
            
            <div className={`flex ${isCollapsedState ? 'flex-col items-center' : ''} items-center gap-2`}>
              <Badge variant="secondary" className={`${isCollapsedState ? 'mb-1 text-sm pointer-events-none' : ''}`}>
                {consultants.length}
              </Badge>
              {!isCollapsedState && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsedState(true);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Minimizar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="flex items-center gap-2">
                {!isCollapsedState && title !== 'Disponível' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCollapsedState(true);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    title="Minimizar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {title !== 'Disponível' && id && onDeleteProject && (
                  <button
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
                        onDeleteProject(id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Excluir Projeto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10l-4-4m0 0L9 3m1-1h4a1 1 0 011 1v3" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent
        ref={setNodeRef}
        className={`p-2 rounded-lg transition-all duration-300 ${
          isOver ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-gray-50'
        } ${isCollapsedState ? 'hidden' : ''}`}
      >
        <SortableContext 
          items={consultants.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {!isCollapsedState && consultants.map((consultant) => (
            <ConsultantCard
              key={consultant.id}
              consultant={consultant}
              onDeleteConsultant={onDeleteConsultant}
              onMoveConsultant={onMoveConsultant}
              allProjects={allProjects || []}
            />
          ))}
        </SortableContext>
        {consultants.length === 0 && !isCollapsedState && (
          <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
            Sem consultores
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectColumn;
