'use client'
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, FolderKanban, DollarSign, Image, ChevronDown, Calendar } from 'lucide-react';
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

// Project Card Component with Before/After
interface ProjectCardProps {
  location: string;
  date: string;
  impact: string;
  beforeImage?: string;
  afterImage?: string;
  onExpand?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  location,
  date,
  impact,
  beforeImage,
  afterImage,
  onExpand
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-lg text-slate-900 mb-1">Location - {location}</h4>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onExpand}>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Before */}
          <div>
            <h5 className="font-medium text-slate-700 mb-2 text-sm">Before</h5>
            <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center overflow-hidden">
              {beforeImage ? (
                <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-12 h-12 text-slate-400" />
              )}
            </div>
          </div>

          {/* After */}
          <div>
            <h5 className="font-medium text-slate-700 mb-2 text-sm">After</h5>
            <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center overflow-hidden">
              {afterImage ? (
                <img src={afterImage} alt="After" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-12 h-12 text-green-400" />
              )}
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            <span className="font-semibold">Impact:</span> {impact}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
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

  // Projects Data
  const projectsData = [
    {
      id: 1,
      location: 'Flood zone',
      date: 'November 2025',
      impact: '45 hectares of farmland restored'
    },
    {
      id: 2,
      location: 'Storm Area',
      date: 'March 2025',
      impact: '32 hectares of agricultural land rehabilitated'
    },
    {
      id: 3,
      location: 'Coastal Region',
      date: 'October 2025',
      impact: '28 hectares of mangrove forest replanted'
    },
    {
      id: 4,
      location: 'Mountain District',
      date: 'August 2025',
      impact: '50 hectares of terraced fields restored'
    },
    {
      id: 5,
      location: 'Delta Zone',
      date: 'June 2025',
      impact: '38 hectares of rice paddies recovered'
    },
    {
      id: 6,
      location: 'Highland Area',
      date: 'April 2025',
      impact: '42 hectares of crop land rejuvenated'
    }
  ];

  const handleProjectExpand = (id: number) => {
    console.log('Expand project:', id);
  };

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

          {/* Projects Tab with Before & After */}
          <TabsContent value="projects" className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Active Recovery Projects</h3>
                <div className="text-sm text-slate-600">
                  {projectsData.length} projects in progress
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsData.map((project) => (
                  <ProjectCard
                    key={project.id}
                    location={project.location}
                    date={project.date}
                    impact={project.impact}
                    onExpand={() => handleProjectExpand(project.id)}
                  />
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;
