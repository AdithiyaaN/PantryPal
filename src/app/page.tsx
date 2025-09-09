import { Header } from '@/components/layout/Header';
import { MealPlanner } from '@/components/features/meal-planner/MealPlanner';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <MealPlanner />
      </main>
    </div>
  );
}
