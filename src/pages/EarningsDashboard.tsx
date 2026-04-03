import React, { useEffect, useRef } from 'react';
import { AppProvider } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';

const EarningsDashboardContent: React.FC = () => {
  const { t } = useLanguage();
  const titleBeforeRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (titleBeforeRouteRef.current === null) {
      titleBeforeRouteRef.current = document.title;
    }
    return () => {
      if (titleBeforeRouteRef.current !== null) {
        document.title = titleBeforeRouteRef.current;
      }
    };
  }, []);

  useEffect(() => {
    document.title = t.earningsDashboardDocumentTitle;
  }, [t.earningsDashboardDocumentTitle]);

  return (
    <div
      data-testid="earnings-dashboard"
      className="min-h-screen flex flex-col bg-background"
    >
      <Header />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t.earningsDashboardHeading}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          {t.earningsDashboardPlaceholder}
        </p>
      </main>
    </div>
  );
};

const EarningsDashboard: React.FC = () => {
  return (
    <AppProvider>
      <EarningsDashboardContent />
    </AppProvider>
  );
};

export default EarningsDashboard;
