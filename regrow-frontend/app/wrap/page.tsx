'use client'
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, TrendingUp, Users, DollarSign, Leaf, Share2, Download, CheckCircle, Award, Sparkles } from 'lucide-react';
import Header from '@/components/header';

// Impact Stat Card Component
interface ImpactStatProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const ImpactStat: React.FC<ImpactStatProps> = ({ value, label, icon }) => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
};

// Journey Card Component
interface JourneyCardProps {
  title: string;
  description: string;
  metric: string;
  change: string;
  bgColor: string;
  isAfter?: boolean;
}

const JourneyCard: React.FC<JourneyCardProps> = ({
  title,
  description,
  metric,
  change,
  bgColor,
  isAfter = false
}) => {
  return (
    <Card className={`${bgColor} border-0`}>
      <CardContent className="p-6 text-center">
        <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
        <div className="h-px bg-white/30 mb-4"></div>
        <h4 className="font-semibold text-white mb-2">{description}</h4>
        <p className="text-sm text-white/90 mb-3">{metric}</p>
        {isAfter && (
          <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const YearWrapPage = () => {
  const impactStats = [
    {
      value: '$1,250',
      label: 'Total Donated',
      icon: <DollarSign className="w-8 h-8 text-green-600" />
    },
    {
      value: '6',
      label: 'Projects',
      icon: <Leaf className="w-8 h-8 text-blue-600" />
    },
    {
      value: '18.4 ha',
      label: 'Land Restored',
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />
    },
    {
      value: '127',
      label: 'Farmers Helped',
      icon: <Users className="w-8 h-8 text-purple-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header activeTab='wrap' />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Verified Impact</span>
          </div>
          <Card className="overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 border-0 mb-6">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
              <h1 className="text-5xl font-bold text-white mb-3">Your 2025 Impact Wrap</h1>
              <p className="text-xl text-green-50 mb-2">See the real-world impact of your donations</p>
              <p className="text-sm text-green-100">30th Dec 2025</p>
            </CardContent>
          </Card>
        </div>

        {/* Impact Stats */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <ImpactStat
                  key={index}
                  value={stat.value}
                  label={stat.label}
                  icon={stat.icon}
                />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button className="bg-green-600 hover:bg-green-700" size="lg">
                View Impact Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Journey Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Your Impact Journey</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <JourneyCard
              title="Before"
              description="Areas Identified"
              metric="Damaged land awaiting restoration"
              change=""
              bgColor="bg-gradient-to-br from-red-500 to-red-600"
            />

            <JourneyCard
              title="After"
              description="Land Recovery"
              metric="Vegetation improved by +23% across supported areas. 85% to see progress"
              change="+23%"
              bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
              isAfter={true}
            />
          </div>

          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">18.4 ha restored</h4>
                  <p className="text-sm text-green-800">
                    Your contributions helped restore vegetation across 18.4 hectares of damaged land,
                    improving soil health and supporting 127 farming families to rebuild their livelihoods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Your Achievements</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Generous Donor</h4>
                <p className="text-sm text-slate-600">Supported 6 different recovery projects</p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Earth Restorer</h4>
                <p className="text-sm text-slate-600">Helped restore 18.4 hectares of land</p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Community Champion</h4>
                <p className="text-sm text-slate-600">Impacted 127 farming families</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Share Your Impact</h3>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
              Your donations are making a difference in climate recovery efforts.
              Share your impact story to inspire others!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-600 hover:bg-green-700 gap-2" size="lg">
                <Share2 className="w-5 h-5" />
                Share to Social
              </Button>
              <Button variant="outline" className="gap-2 border-green-600 text-green-700 hover:bg-green-50" size="lg">
                <Download className="w-5 h-5" />
                Download Card
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Continue Making Impact */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-green-600 to-emerald-700 border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-3">Continue Making an Impact in 2026</h3>
              <p className="text-green-50 mb-6">
                There are still many communities that need support. Join us in making 2026 even more impactful!
              </p>
              <Button className="bg-white text-green-600 hover:bg-green-50" size="lg">
                Support New Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default YearWrapPage;
