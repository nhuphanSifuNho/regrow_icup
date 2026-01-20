'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, Search, Filter, Calendar, TrendingUp } from 'lucide-react';
import Header from '@/components/header';

// Reusable News Card Component
interface NewsCardProps {
  id: number;
  title: string;
  excerpt: string;
  imageUrl?: string;
  date?: string;
  category?: string;
  onClick?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  excerpt,
  imageUrl,
  date,
  category,
  onClick
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4" onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <Image className="w-10 h-10 text-green-500" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
              {category && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                  {category}
                </span>
              )}
            </div>

            <p className="text-slate-600 text-sm line-clamp-2 mb-3">
              {excerpt}
            </p>

            <div className="flex items-center justify-between">
              {date && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {date}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                View more
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NewsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  
  // Sample news data
  const newsData = [
    {
      id: 1,
      title: 'Flash Flood Alert Issued for Central Vietnam',
      excerpt:
        'Heavy rainfall over the last 24 hours has caused rapid water level rises in several central provinces. Residents in low-lying areas are advised to evacuate immediately.',
      date: 'Jan 19, 2026',
      category: 'Alert',
      imageUrl:
        'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      title: 'Early Warning System Successfully Predicts Landslide Risk',
      excerpt:
        'The national disaster monitoring system detected abnormal soil moisture and slope instability, allowing local authorities to close roads before incidents occurred.',
      date: 'Jan 18, 2026',
      category: 'Technology',
      imageUrl:
        'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      title: 'Community Evacuation Drill Conducted in Flood-Prone Districts',
      excerpt:
        'More than 500 households participated in a coordinated evacuation drill aimed at improving preparedness for extreme weather events.',
      date: 'Jan 17, 2026',
      category: 'Community',
      imageUrl:
        'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 4,
      title: 'Severe Weather Warning: Tropical Depression Approaching',
      excerpt:
        'Meteorological agencies report that a tropical depression in the East Sea may strengthen and bring strong winds and heavy rain within 48 hours.',
      date: 'Jan 16, 2026',
      category: 'Weather',
      imageUrl:
        'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 5,
      title: 'New Disaster Response Protocols Announced',
      excerpt:
        'Authorities have introduced updated emergency response protocols focusing on faster data sharing and improved coordination between provinces.',
      date: 'Jan 15, 2026',
      category: 'Policy',
      imageUrl:
        'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 6,
      title: 'Volunteers Deployed to Support Flood Recovery Efforts',
      excerpt:
        'Hundreds of volunteers have been mobilized to assist with cleanup operations, food distribution, and temporary shelter management.',
      date: 'Jan 14, 2026',
      category: 'Update',
      imageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80'
    }
  ];


  const handleNewsClick = (id: number) => {
    router.push(`/news/${id}`);
  };

  // Filter news based on search query
  const filteredNews = newsData.filter((news) => {
    const query = searchQuery.toLowerCase();
    return (
      news.title.toLowerCase().includes(query) ||
      news.excerpt.toLowerCase().includes(query) ||
      news.category.toLowerCase().includes(query)
    );
  });

  // Get search suggestions
  const allCategories = Array.from(new Set(newsData.map(news => news.category)));
  const allKeywords = ['flood', 'warning', 'alert', 'evacuation', 'community', 'response', 'weather', 'disaster', 'technology', 'volunteers'];
  
  const suggestions = React.useMemo(() => {
    if (!searchQuery) return [...allCategories, ...allKeywords].slice(0, 6);
    
    const query = searchQuery.toLowerCase();
    const matchedCategories = allCategories.filter(cat => 
      cat.toLowerCase().includes(query)
    );
    const matchedKeywords = allKeywords.filter(kw => 
      kw.toLowerCase().includes(query) && !matchedCategories.includes(kw)
    );
    const matchedTitles = newsData
      .filter(news => news.title.toLowerCase().includes(query))
      .map(news => news.title)
      .slice(0, 3);
    
    return [...matchedCategories, ...matchedKeywords, ...matchedTitles].slice(0, 6);
  }, [searchQuery]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Navigation */}
      <Header activeTab="news" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Latest News & Updates</h2>
          <p className="text-slate-600">Stay informed about emergency alerts and community updates</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search news and updates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute top-full mt-2 w-full z-10 shadow-lg">
                <CardContent className="p-2">
                  <div className="text-xs text-slate-500 px-3 py-2 font-semibold">
                    {searchQuery ? 'Suggestions' : 'Popular Searches'}
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-slate-100 rounded cursor-pointer flex items-center gap-2 transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{suggestion}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Featured News Section */}
        {!searchQuery && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-bold text-slate-900">Trending Now</h3>
            </div>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNewsClick(newsData[0]?.id || 1)}>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-video md:aspect-auto bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center overflow-hidden">
                    {newsData[0]?.imageUrl ? (
                      <img src={newsData[0].imageUrl} alt={newsData[0].title} className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-24 h-24 text-green-500" />
                    )}
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full w-fit mb-3">
                      {newsData[0]?.category?.toUpperCase() || 'BREAKING'}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {newsData[0]?.title || 'Major Emergency Response Coordination'}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {newsData[0]?.excerpt || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{newsData[0]?.date || '2 hours ago'}</span>
                      <Button 
                        className="bg-green-600 hover:bg-green-700" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNewsClick(newsData[0]?.id || 1);
                        }}
                      >
                        Read Full Story
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* News Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              {searchQuery ? `Search Results (${filteredNews.length})` : 'All News'}
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-green-600">Latest</Button>
              <Button variant="ghost" size="sm">Popular</Button>
              <Button variant="ghost" size="sm">Archived</Button>
            </div>
          </div>

          {filteredNews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredNews.map((news) => (
                <NewsCard
                  key={news.id}
                  id={news.id}
                  title={news.title}
                  excerpt={news.excerpt}
                  date={news.date}
                  category={news.category}
                  imageUrl={news.imageUrl}
                  onClick={() => handleNewsClick(news.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CardContent>
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-600">
                  No news articles match your search for "{searchQuery}"
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Load More Button */}
          {!searchQuery && (
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                Load More News
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default NewsPage;
