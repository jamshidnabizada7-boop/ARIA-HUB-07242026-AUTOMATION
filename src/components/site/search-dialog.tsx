'use client';

import { useEffect, useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useT } from '@/hooks/use-t';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  url: string;
  image: string | null;
}

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useT();

  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const typeColor: Record<string, string> = {
    Service: 'text-chart-2 bg-chart-2/10',
    Visa: 'text-chart-1 bg-chart-1/10',
    Opportunity: 'text-chart-3 bg-chart-3/10',
    News: 'text-chart-4 bg-chart-4/10',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">{t('search.placeholder')}</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border/60 px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.placeholder')}
            className="h-14 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
          {q && (
            <button onClick={() => setQ('')} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {!loading && q.length >= 2 && results.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">{t('search.noResults')}</div>
          )}
          {!loading && results.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-muted-foreground">
                {t('search.resultsCount', { count: results.length })}
              </div>
              <div className="p-2">
                {results.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  onClick={() => onOpenChange(false)}
                  className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
                >
                  {r.image && (
                    <img src={r.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase', typeColor[r.type] || 'text-muted-foreground bg-muted')}>
                        {r.type}
                      </span>
                    </div>
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    {r.subtitle && <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 rtl-flip" />
                </a>
              ))}
            </div>
            </div>
          )}
          {!loading && q.length < 2 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t('search.placeholder')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
