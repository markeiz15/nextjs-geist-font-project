import KanbanBoard from '../components/kanban/KanbanBoard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto">
        <div className="py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Consultores</h1>
            <p className="mt-2 text-gray-600">
              Arraste e solte os cartões para gerenciar os consultores entre projetos
            </p>
          </div>
          <KanbanBoard />
        </div>
      </div>
    </main>
  );
}
