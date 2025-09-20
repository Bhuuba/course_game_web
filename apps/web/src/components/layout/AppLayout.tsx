import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Arcane Relay</h1>
            <p className="text-sm text-muted-foreground">
              Кооперативна текстова пригода з GM на основі ШІ
            </p>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
