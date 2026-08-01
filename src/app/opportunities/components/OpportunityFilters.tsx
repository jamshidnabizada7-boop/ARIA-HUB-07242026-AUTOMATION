'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Sparkles, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';

export function OpportunityFilters({
  locations,
  currentCategory
}: {
  locations: string[];
  currentCategory: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, 500);

  const updateFilters = (newQ: string, newLoc: string, newSort: string) => {
    const params = new URLSearchParams();
    if (currentCategory !== 'all') params.set('category', currentCategory);
    if (newQ.trim()) params.set('q', newQ.trim());
    if (newLoc !== 'all') params.set('location', newLoc);
    if (newSort !== 'newest') params.set('sort', newSort);
    
    router.push(`/opportunities?${params.toString()}`);
  };

  useEffect(() => {
    // Only update if it's different from the URL to avoid endless loops
    const currentQ = searchParams.get('q') || '';
    if (debouncedQuery !== currentQ && !isAiSearching) {
      updateFilters(debouncedQuery, location, sort);
    }
  }, [debouncedQuery]);

  const handleLocationChange = (val: string) => {
    setLocation(val);
    updateFilters(query, val, sort);
  };

  const handleSortChange = (val: string) => {
    setSort(val);
    updateFilters(query, location, val);
  };

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    setIsAiSearching(true);
    setAiSuggestions([]);
    
    try {
      const res = await fetch('/api/opportunities/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      
      if (data.suggestions && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
      } else {
        // If AI finds a direct exact correction, just apply it
        if (data.correction) {
          setQuery(data.correction);
          updateFilters(data.correction, location, sort);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setAiSuggestions([]);
    updateFilters(suggestion, location, sort);
  };

  return (
    <div className="w-full space-y-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search opportunity, company, organization..." 
            className="pl-9 pr-12 rounded-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateFilters(query, location, sort)}
          />
          {query.length > 2 && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={handleAiSearch}
              disabled={isAiSearching}
              title="AI Recommend correct spelling"
            >
              {isAiSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Location Filter */}
        <div className="w-full md:w-48 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Select value={location} onValueChange={handleLocationChange}>
            <SelectTrigger className="pl-9 rounded-lg">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full md:w-48 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="pl-9 rounded-lg">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="deadline">Deadline Ending Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Suggestions Dropdown */}
      {aiSuggestions.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Did you mean:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((sug, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm"
                className="bg-background hover:bg-primary hover:text-primary-foreground border-primary/20"
                onClick={() => applySuggestion(sug)}
              >
                {sug}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
