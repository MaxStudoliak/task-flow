import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Users, LayoutDashboard } from 'lucide-react';
import { useLanguageStore } from '@/stores/language.store';
import { Button } from '@/components/ui/button';

export function HomePage() {
  const { t } = useLanguageStore();

  const features = [
    t.home.features.dragDrop,
    t.home.features.multipleWorkspaces,
    t.home.features.priorityLevels,
    t.home.features.dueDates,
    t.home.features.comments,
    t.home.features.labels,
  ];

  return (
    <div className="flex flex-col">
      <section className="container flex flex-col items-center justify-center gap-4 md:gap-6 py-12 md:py-20 lg:py-32 text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          {t.home.title}
          <span className="text-primary"> TaskFlow</span>
        </h1>
        <p className="max-w-2xl text-base md:text-lg text-muted-foreground sm:text-xl">
          {t.home.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">{t.home.getStartedFree}</Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              {t.home.signIn}
            </Button>
          </Link>
        </div>
      </section>

      <section className="container py-12 md:py-20 px-4">
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex flex-col items-center gap-4 rounded-lg border p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t.home.kanbanBoards}</h3>
            <p className="text-muted-foreground">{t.home.kanbanDesc}</p>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-lg border p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t.home.realTimeUpdates}</h3>
            <p className="text-muted-foreground">{t.home.realTimeDesc}</p>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-lg border p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t.home.teamCollaboration}</h3>
            <p className="text-muted-foreground">{t.home.teamDesc}</p>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/50 py-12 md:py-20">
        <div className="container px-4">
          <h2 className="mb-8 md:mb-12 text-center text-2xl md:text-3xl font-bold">{t.home.everythingYouNeed}</h2>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
