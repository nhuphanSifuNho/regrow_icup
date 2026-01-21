'use client'

import React from 'react';
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
    <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4">
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
                onClick={onClick}
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
  // Sample news data
  const newsData = [
    {
      id: 1,
      title: 'Emergency Response Update',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et blandit quam. Aenean et ultricies magna, et molli...',
      date: 'Jan 15, 2026',
      category: 'Alert'
    },
    {
      id: 2,
      title: 'Community Safety Initiative',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et blandit quam. Aenean et ultricies magna, et molli...',
      date: 'Jan 14, 2026',
      category: 'Update'
    },
    {
      id: 3,
      title: 'Weather Warning System',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et blandit quam. Aenean et ultricies magna, et molli...',
      date: 'Jan 13, 2026',
      category: 'Weather'
    },
    {
      id: 4,
      title: 'New Safety Protocols',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et blandit quam. Aenean et ultricies magna, et molli...',
      date: 'Jan 12, 2026',
      category: 'Policy'
    },
    {
      id: 5,
      title: 'Disaster Preparedness Workshop',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et blandit quam. Aenean et ultricies magna, et molli...',
      date: 'Jan 11, 2026',
      category: 'Event'
    },
    {
      id: 6,
      title: 'Regional Coordination Efforts',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et blandit quam. Aenean et ultricies magna, et molli...',
      date: 'Jan 10, 2026',
      category: 'Update'
    }
  ];

  const handleNewsClick = (id: number) => {
    console.log('News card clicked:', id);
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
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Featured News Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold text-slate-900">Trending Now</h3>
          </div>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-video md:aspect-auto bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center">
                  <Image className="w-24 h-24 text-green-500" />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full w-fit mb-3">
                    BREAKING
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Major Emergency Response Coordination
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse et blandit quam.
                    Aenean et ultricies magna, et mollis nulla. Praesent in urna vitae lorem dignissim facilisis.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">2 hours ago</span>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Read Full Story
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* News Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">All News</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-green-600">Latest</Button>
              <Button variant="ghost" size="sm">Popular</Button>
              <Button variant="ghost" size="sm">Archived</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {newsData.map((news) => (
              <NewsCard
                key={news.id}
                id={news.id}
                title={news.title}
                excerpt={news.excerpt}
                date={news.date}
                category={news.category}
                onClick={() => handleNewsClick(news.id)}
              />
            ))}
          </div>

          {/* Load More Button */}
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Load More News
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NewsPage;
