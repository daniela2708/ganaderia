import cattleIcon from '@/assets/cattle-icon.png';
import { useI18n } from '@/lib/i18n';

export const DashboardHeader = () => {
  const { t, lang, toggle } = useI18n();
  return (
    <header className="bg-card border-b-0 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={cattleIcon}
              alt="Cattle Analysis"
              className="w-10 h-10 object-contain drop-shadow-sm"
            />
            <h1 className="text-2xl font-bold text-foreground tracking-wide">
              {t('app.title')}
            </h1>
          </div>
          <button onClick={toggle} className="px-3 py-1 text-sm border rounded">
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
        </div>
      </div>
    </header>
  );
};