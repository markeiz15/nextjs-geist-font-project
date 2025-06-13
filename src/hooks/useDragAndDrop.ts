"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";

export function useDragAndDrop() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent, projects: { id: string }[], consultants: { id: string; projectId: string | null }[]) => {
    const { over } = event;
    if (!over) return;

    const overId = over.id as string;

    if (overId === "Disponível") {
      setTargetProjectId(null);
      return;
    }

    const targetProject = projects.find((p) => p.id === overId);
    if (targetProject) {
      setTargetProjectId(targetProject.id);
      return;
    }

    const overConsultant = consultants.find((c) => c.id === overId);
    if (overConsultant) {
      setTargetProjectId(overConsultant.projectId);
    }
  };

  const handleDragEnd = async (
    event: DragEndEvent,
    consultants: { id: string; projectId: string | null }[],
    updateConsultantProject: (id: string, projectId: string | null) => Promise<void>,
    loadData: () => Promise<void>,
    setError: (error: string | null) => void,
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>,
    setTargetProjectId: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const { active } = event;
    if (!active) return;

    const activeId = active.id as string;
    const activeConsultant = consultants.find((c) => c.id === activeId);
    if (!activeConsultant) return;

    try {
      await updateConsultantProject(activeId, targetProjectId);
    } catch (error) {
      console.error("Failed to update consultant:", error);
      setError("Falha ao atualizar o consultor. Por favor, tente novamente.");
      await loadData();
    } finally {
      setActiveId(null);
      setTargetProjectId(null);
    }
  };

  return {
    sensors,
    activeId,
    targetProjectId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    setActiveId,
    setTargetProjectId,
  };
}
