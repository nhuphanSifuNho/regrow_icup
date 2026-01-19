'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, FolderKanban, DollarSign, Image, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/header';

// Summary Card Component
interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  subtextColor?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  label,
  value,
  subtext,
  subtextColor = 'text-blue-600'
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-slate-500">{icon}</div>
          <span className="text-sm text-slate-600">{label}</span>
        </div>
        <div className="mb-2">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <p className={`text-sm font-medium ${subtextColor}`}>{subtext}</p>
      </CardContent>
    </Card>
  );
};

// Detail Statement Row Component
interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
};

// Before/After Image Card Component
interface BeforeAfterCardProps {
  label: 'Before' | 'After';
  imageUrl?: string;
}

const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({ label, imageUrl }) => {
  return (
    <div>
      <h4 className="font-medium text-slate-900 mb-3">{label}</h4>
      <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <Image className="w-16 h-16 text-green-400" />
        )}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [selectedLocation, setSelectedLocation] = useState('Flood zone');
  const [selectedProject, setSelectedProject] = useState('Storm Area');

  // Overview Dashboard Data
  const summaryData = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Disbursement',
      value: '2,450,000,000',
      subtext: 'VND',
      subtextColor: 'text-blue-600'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Areas',
      value: '23',
      subtext: 'Provinces',
      subtextColor: 'text-blue-600'
    },
    {
      icon: <FolderKanban className="w-5 h-5" />,
      label: 'Projects',
      value: '156',
      subtext: 'Completed',
      subtextColor: 'text-orange-600'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Beneficiaries',
      value: '8420',
      subtext: 'Households',
      subtextColor: 'text-red-600'
    }
  ];

  const detailStatements = [
    { label: 'Seeds & seedlings', value: '950,000,000 VND' },
    { label: 'Fertilizer', value: '150,000,000 VND' },
    { label: 'Tools', value: '1,250,000,000 VND' }
  ];

  // Projects Dashboard Data
  const projectSummaryData = [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Areas',
      value: '23',
      subtext: 'Provinces',
      subtextColor: 'text-blue-600'
    },
    {
      icon: <FolderKanban className="w-5 h-5" />,
      label: 'Projects',
      value: '156',
      subtext: 'Completed',
      subtextColor: 'text-orange-600'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Beneficiaries',
      value: '8420',
      subtext: 'Households',
      subtextColor: 'text-red-600'
    }
  ];

  const projectDetailStatements = [
    { label: 'Seeds & seedlings', value: '950,000,000 VND' },
    { label: 'Fertilizer', value: '150,000,000 VND' },
    { label: 'Tools', value: '1,250,000,000 VND' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header activeTab="dashboard" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Soil Recovery</h2>
              <p className="text-slate-600">Track Restoration Progress</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-sm">Last updated:</span>
                <span className="font-semibold">Dec 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different dashboard views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="before-after">Before & After</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Summaries</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryData.map((item, index) => (
                  <SummaryCard
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                    subtext={item.subtext}
                    subtextColor={item.subtextColor}
                  />
                ))}
              </div>
            </section>

            {/* Detailed Statements */}
            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Detailed Statements</h3>
              <Card>
                <CardContent className="p-6">
                  {detailStatements.map((item, index) => (
                    <DetailRow key={index} label={item.label} value={item.value} />
                  ))}
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {/* Summary Cards */}
            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Summaries</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {projectSummaryData.map((item, index) => (
                  <SummaryCard
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                    subtext={item.subtext}
                    subtextColor={item.subtextColor}
                  />
                ))}
              </div>
            </section>

            {/* Detailed Statements */}
            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Detailed Statements</h3>
              <Card>
                <CardContent className="p-6">
                  {projectDetailStatements.map((item, index) => (
                    <DetailRow key={index} label={item.label} value={item.value} />
                  ))}
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Before & After Tab */}
          <TabsContent value="before-after" className="space-y-6">
            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Before & After Recovery</h3>

              {/* Location Selector */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-600 block mb-1">Location - {selectedLocation}</span>
                      <span className="text-xs text-slate-500">November 2025</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Before Section */}
              <div className="mb-8">
                <BeforeAfterCard label="Before" />
              </div>

              {/* After Section */}
              <div className="mb-8">
                <BeforeAfterCard label="After" />
                <p className="text-sm text-green-600 font-medium mt-3">
                  Impact: 45 hectares of farmland restored
                </p>
              </div>

              {/* Project Selector */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-600 block mb-1">Location - {selectedProject}</span>
                      <span className="text-xs text-slate-500">March 2025</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;
