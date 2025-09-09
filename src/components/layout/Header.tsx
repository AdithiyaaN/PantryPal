import { NotebookPen } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-card shadow-sm sticky top-0 z-30 bg-opacity-75 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <NotebookPen className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Recipe List Central
          </h1>
        </div>
      </div>
    </header>
  );
}
