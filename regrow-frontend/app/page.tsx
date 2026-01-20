'use client'

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Image, ChevronRight, Bell, User } from 'lucide-react';
import Header from '@/components/header';

// Reusable Emergency Help Card Component
interface EmergencyHelpCardProps {
  imageUrl?: string;
  location: string;
  distance: string;
  maxDistance: string;
  progress?: number;
  onClick?: () => void;
}

const EmergencyHelpCard: React.FC<EmergencyHelpCardProps> = ({
  imageUrl,
  location,
  distance,
  maxDistance,
  progress,
  onClick
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={location} className="w-full h-full object-cover" />
          ) : (
            <Image className="w-16 h-16 text-slate-400" />
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-900">{location}</span>
            {progress !== undefined && (
              <span className="text-xs text-slate-500">{progress}%</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{distance} / {maxDistance}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Reusable Zone Card Component
interface ZoneCardProps {
  imageUrl?: string;
  zoneName?: string;
  colorScheme?: 'amber' | 'blue' | 'purple' | 'rose' | 'slate';
  onClick?: () => void;
}

const ZoneCard: React.FC<ZoneCardProps> = ({
  imageUrl,
  zoneName,
  colorScheme = 'slate',
  onClick
}) => {
  const colorClasses = {
    amber: 'from-amber-100 to-amber-200',
    blue: 'from-blue-100 to-blue-200',
    purple: 'from-purple-100 to-purple-200',
    rose: 'from-rose-100 to-rose-200',
    slate: 'from-slate-200 to-slate-300'
  };

  const iconColorClasses = {
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    rose: 'text-rose-400',
    slate: 'text-slate-400'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className={`aspect-video bg-gradient-to-br ${colorClasses[colorScheme]} flex items-center justify-center overflow-hidden`}>
          {imageUrl ? (
            <img src={imageUrl} alt={zoneName} className="w-full h-full object-cover" />
          ) : (
            <Image className={`w-16 h-16 ${iconColorClasses[colorScheme]}`} />
          )}
        </div>
        {zoneName && (
          <div className="p-3">
            <span className="text-sm font-medium text-slate-900">{zoneName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const HomePage = () => {
  // Sample data for Emergency Help cards
  const emergencyHelpData = [
    {
      id: 1,
      location: 'Location',
      distance: '96M',
      maxDistance: '100M',
      progress: 96
    },
    {
      id: 2,
      location: 'Location',
      distance: '96M',
      maxDistance: '100M'
    },
    {
      id: 3,
      location: 'Location',
      distance: '96M',
      maxDistance: '100M'
    }
  ];

  // Sample data for Zone cards
  const zoneData = [
    { id: 1, colorScheme: 'amber' as const },
    { id: 2, colorScheme: 'blue' as const },
    { id: 3, colorScheme: 'purple' as const },
    { id: 4, colorScheme: 'rose' as const }
  ];

  const handleEmergencyClick = (id: number) => {
    console.log('Emergency help card clicked:', id);
  };

  const handleZoneClick = (id: number) => {
    console.log('Zone card clicked:', id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Navigation */}
      <Header activeTab='explore' />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <Card className="overflow-hidden bg-gradient-to-r from-green-600 to-emerald-700 border-0">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-12">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Real-time Emergency Updates
                  </h2>
                  <p className="text-green-50 text-lg mb-6">
                    Stay informed about emergency situations in your area and get help when you need it most.
                  </p>
                  <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
                    Get Started
                  </Button>
                </div>
                <div className="relative h-80 flex items-center justify-center"
                  style={{
                    backgroundImage: 'url(/quang_tri.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Image carousel dots */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Emergency Help Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Emergency Help</h3>
            <Button variant="ghost" className="text-green-600 hover:text-green-700">
              See more <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyHelpData.map((item) => (
              <EmergencyHelpCard
                key={item.id}
                location={item.location}
                distance={item.distance}
                maxDistance={item.maxDistance}
                progress={item.progress}
                onClick={() => handleEmergencyClick(item.id)}
              />
            ))}
          </div>
        </section>

        {/* Other Zones Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Other zones</h3>
            <Button variant="ghost" className="text-green-600 hover:text-green-700">
              See more <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {zoneData.map((zone) => (
              <ZoneCard
                key={zone.id}
                colorScheme={zone.colorScheme}
                onClick={() => handleZoneClick(zone.id)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
