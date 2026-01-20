'use client'

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Share2, Bookmark, TrendingUp } from 'lucide-react';
import Header from '@/components/header';

// Same seed data
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

const NewsDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const newsId = parseInt(params.id as string);
  
  const news = newsData.find(item => item.id === newsId);
  const relatedNews = newsData.filter(item => item.id !== newsId).slice(0, 3);

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header activeTab="news" />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">News Not Found</h2>
              <Button onClick={() => router.push('/news')}>
                Back to News
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header activeTab="news" />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/news')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to News
        </Button>

        {/* Article Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              news.category === 'Alert' ? 'bg-red-100 text-red-700' :
              news.category === 'Technology' ? 'bg-blue-100 text-blue-700' :
              news.category === 'Community' ? 'bg-purple-100 text-purple-700' :
              news.category === 'Weather' ? 'bg-orange-100 text-orange-700' :
              news.category === 'Policy' ? 'bg-indigo-100 text-indigo-700' :
              'bg-green-100 text-green-700'
            }`}>
              {news.category}
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {news.date}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {news.title}
          </h1>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Featured Image */}
        <Card className="overflow-hidden mb-8">
          <CardContent className="p-0">
            <div className="aspect-video w-full bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center overflow-hidden">
              {news.imageUrl ? (
                <img 
                  src={news.imageUrl} 
                  alt={news.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <TrendingUp className="w-24 h-24 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="prose prose-slate max-w-none">
              <p className="text-xl text-slate-700 leading-relaxed mb-6">
                {news.excerpt}
              </p>
              
              <div className="space-y-4 text-slate-600">
                <p>
                  Local authorities have been closely monitoring the situation and coordinating with emergency response teams to ensure public safety. The rapid response system has been activated across affected regions, with evacuation centers being prepared to accommodate displaced residents.
                </p>
                
                <p>
                  Emergency services are on high alert and have deployed additional resources to vulnerable areas. Residents are advised to stay informed through official channels and follow evacuation orders promptly. The local government has set up 24/7 hotlines for emergency assistance and information.
                </p>
                
                <p>
                  Community leaders and volunteers have been mobilized to support affected families, providing essential supplies, temporary shelter, and medical assistance. The disaster management team continues to assess the situation and will provide regular updates as the situation develops.
                </p>
                
                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                  Safety Recommendations
                </h3>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>Stay informed through official weather alerts and emergency broadcasts</li>
                  <li>Prepare emergency kits with essential supplies including water, food, and medicine</li>
                  <li>Follow evacuation orders immediately when issued by authorities</li>
                  <li>Avoid traveling through affected areas unless absolutely necessary</li>
                  <li>Keep mobile devices charged and maintain contact with family members</li>
                </ul>
                
                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
                  Community Response
                </h3>
                
                <p>
                  The community has shown remarkable resilience and solidarity in the face of this challenge. Volunteer groups have been organizing relief efforts, and donations have been pouring in from across the country. Local businesses have stepped up to provide support, offering supplies and temporary accommodation to those in need.
                </p>
                
                <p>
                  The coordinated response between government agencies, non-governmental organizations, and community groups demonstrates the strength of collaborative disaster management. As the situation continues to evolve, officials remain committed to protecting lives and minimizing the impact on affected communities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related News */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related News</h2>
          <div className="grid gap-4">
            {relatedNews.map((item) => (
              <Card 
                key={item.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/news/${item.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <TrendingUp className="w-10 h-10 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                      <h3 className="font-semibold text-slate-900 mt-2 mb-1">
                        {item.title}
                      </h3>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default NewsDetailPage;
