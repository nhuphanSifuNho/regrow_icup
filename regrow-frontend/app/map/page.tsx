'use client'
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Home, Calendar, CheckCircle, Download, Heart, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/header';
import RegionMarker from './_components/region-marker';

// Damage Assessment Card Component
interface DamageMetricProps {
  label: string;
  percentage: number;
  color: string;
}

const DamageMetric: React.FC<DamageMetricProps> = ({ label, percentage, color }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{percentage}%</span>
      </div>
      <Progress value={percentage} className={`h-2 ${color}`} />
    </div>
  );
};

// Timeline Step Component
interface TimelineStepProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  details?: string;
  target?: string;
  progress?: number;
  status: 'completed' | 'in-progress' | 'upcoming';
}

const TimelineStep: React.FC<TimelineStepProps> = ({
  icon,
  title,
  subtitle,
  details,
  target,
  progress,
  status
}) => {
  const statusColors = {
    completed: 'bg-green-100 border-green-500 text-green-700',
    'in-progress': 'bg-blue-100 border-blue-500 text-blue-700',
    upcoming: 'bg-slate-100 border-slate-300 text-slate-600'
  };

  return (
    <Card className={`border-l-4 ${statusColors[status]}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${statusColors[status]}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
            <p className="text-sm text-slate-600 mb-2">{subtitle}</p>
            {details && <p className="text-xs text-slate-500 mb-2">{details}</p>}
            {progress !== undefined && (
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Disbursement progress</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}
            {target && (
              <p className="text-xs font-medium text-slate-700">
                <span className="font-semibold">Target:</span> {target}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MapViewPage = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [detailView, setDetailView] = useState<'overview' | 'timeline' | 'breakdown'>('overview');
  const [isReloading, setIsReloading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isDetailReloading, setIsDetailReloading] = useState(false);
  const [detailLastUpdated, setDetailLastUpdated] = useState<Date | null>(null);
  const [regionDataUpdates, setRegionDataUpdates] = useState<{ [key: string]: number }>({});

  // Additional regions to add on reload
  const additionalRegions = [
    {
      id: 4,
      name: 'Hà Nội',
      severity: 'moderate' as const,
      position: { top: '38%', left: '48%' },
      ndvi: 0.58,
      notReported: 12,
      affectedArea: '7,680 ha',
      damageAssessment: 22100000,
      soilErosion: 55,
      flooding: 48,
      nutrientLoss: 52
    },
    {
      id: 5,
      name: 'Hải Dương',
      severity: 'severe' as const,
      position: { top: '52%', left: '42%' },
      ndvi: 0.42,
      notReported: 18,
      affectedArea: '11,220 ha',
      damageAssessment: 35600000,
      soilErosion: 88,
      flooding: 72,
      nutrientLoss: 78
    },
    {
      id: 6,
      name: 'Hưng Yên',
      severity: 'minor' as const,
      position: { top: '60%', left: '52%' },
      ndvi: 0.72,
      notReported: 5,
      affectedArea: '3,890 ha',
      damageAssessment: 11200000,
      soilErosion: 32,
      flooding: 35,
      nutrientLoss: 28
    }
  ];

  // Initial region data
  const initialRegions = [
    {
      id: 1,
      name: 'Quảng Ninh',
      severity: 'severe' as const,
      position: { top: '48%', left: '20%' },
      ndvi: 0.45,
      notReported: 15,
      affectedArea: '9,105 ha',
      damageAssessment: 28800000,
      soilErosion: 82,
      flooding: 65,
      nutrientLoss: 70
    },
    {
      id: 2,
      name: 'Hải Phòng',
      severity: 'moderate' as const,
      position: { top: '67%', left: '33%' },
      ndvi: 0.62,
      notReported: 8,
      affectedArea: '5,230 ha',
      damageAssessment: 15200000,
      soilErosion: 45,
      flooding: 52,
      nutrientLoss: 38
    },
    {
      id: 3,
      name: 'Thái Bình',
      severity: 'minor' as const,
      position: { top: '86%', left: '45%' },
      ndvi: 0.78,
      notReported: 3,
      affectedArea: '2,450 ha',
      damageAssessment: 8500000,
      soilErosion: 25,
      flooding: 30,
      nutrientLoss: 22
    }
  ];

  const [regions, setRegions] = useState(initialRegions);

  const selectedRegionData = regions.find(r => r.name === selectedRegion);

  const getUpdatedRegionData = () => {
    if (!selectedRegionData) return selectedRegionData;
    
    const updateCount = regionDataUpdates[selectedRegion || ''] || 0;
    const multiplier = 1 + (updateCount * 0.05); // 5% increase per reload
    
    return {
      ...selectedRegionData,
      ndvi: Math.min(0.95, Number((selectedRegionData.ndvi * multiplier).toFixed(2))),
      damageAssessment: Math.floor(selectedRegionData.damageAssessment * (0.9 - updateCount * 0.05)), // Decreases as recovery progresses
      soilErosion: Math.max(5, Math.floor(selectedRegionData.soilErosion - updateCount * 3)),
      flooding: Math.max(5, Math.floor(selectedRegionData.flooding - updateCount * 2)),
      nutrientLoss: Math.max(5, Math.floor(selectedRegionData.nutrientLoss - updateCount * 3)),
      notReported: Math.max(0, selectedRegionData.notReported - updateCount)
    };
  };

  const displayedRegionData = getUpdatedRegionData();

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(regionName);
    setDetailView('overview');
  };

  const handleBackToMap = () => {
    setSelectedRegion(null);
  };

  const handleReload = async () => {
    setIsReloading(true);
    // Simulate API call delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add one new region on each reload
    const randomIndex = Math.floor(Math.random() * additionalRegions.length);
    const newRegion = additionalRegions[randomIndex];
    
    // Check if region already exists
    if (!regions.some(r => r.id === newRegion.id)) {
      setRegions([...regions, newRegion]);
    }
    
    setLastUpdated(new Date());
    setIsReloading(false);
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const handleDetailReload = async () => {
    setIsDetailReloading(true);
    // Simulate API call delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update the region data version
    setRegionDataUpdates({
      ...regionDataUpdates,
      [selectedRegion || '']: (regionDataUpdates[selectedRegion || ''] || 0) + 1
    });
    
    setDetailLastUpdated(new Date());
    setIsDetailReloading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header activeTab="map" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!selectedRegion ? (
          // Map View
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden p-0 gap-0">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Damage Heat Map</h2>
                    <p className="text-green-50">View Storm Damage Severity</p>
                    <p className="text-xs text-green-100 mt-2">Dec 2025</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      onClick={handleReload}
                      disabled={isReloading}
                      className="bg-white text-green-600 hover:bg-green-50 gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
                      {isReloading ? 'Refreshing...' : 'Reload Data'}
                    </Button>
                    <p className="text-xs text-green-100">
                      Updated: {formatLastUpdated(lastUpdated)}
                    </p>
                  </div>
                </div>

                <CardContent className="p-0">
                  {/* Vietnam Map Placeholder with Heat Overlay */}
                  <div style={{
                    backgroundImage: "url(/FloodAssessment.png)"
                  }} className="relative bg-gradient-to-br bg-cover from-green-900 via-green-700 to-green-800 h-[600px]">
                    {/* Simulated heat map effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-yellow-500/20 to-green-500/10"></div>

                    {/* Region markers */}
                    {regions.map((region) => (
                      <RegionMarker
                        key={region.id}
                        name={region.name}
                        severity={region.severity}
                        position={region.position}
                        onClick={() => handleRegionClick(region.name)}
                      />
                    ))}

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg">
                      <h4 className="font-semibold text-sm mb-3">Severity</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span>Severe (ΔNDVI ≥ 0.50)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                          <span>Moderate (0.20 ≤ ΔNDVI &lt; 0.50)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span>Minor (ΔNDVI &lt; 0.10)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Data Freshness: SLA: 48 hours</h3>
                        <p className="text-sm text-blue-800">
                          Click on any zone to view detailed statistics and recovery costs. Zones are automatically
                          classified based on ΔNDVI values from satellite imagery.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleReload}
                      disabled={isReloading}
                      size="sm"
                      className="gap-1 flex-shrink-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
                      {isReloading ? 'Loading...' : 'Refresh'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-4">Active Regions</h3>
                  <div className="space-y-3">
                    {regions.map((region) => (
                      <div
                        key={region.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleRegionClick(region.name)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${region.severity === 'severe' ? 'bg-red-500' :
                            region.severity === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                          <span className="font-medium text-slate-900">{region.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${region.severity === 'severe' ? 'bg-red-100 text-red-700' :
                          region.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                          {region.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Region Detail View
          <div>
            <Button
              variant="ghost"
              className="mb-6"
              onClick={handleBackToMap}
            >
              ← View Damage Heat Map
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header Card */}
                <Card className="overflow-hidden p-0">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold mb-1">{selectedRegion}</h2>
                        <p className="text-red-100">ΔNDVI = {displayedRegionData?.ndvi}</p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Button variant="secondary" size="sm" className="gap-2">
                          <Heart className="w-4 h-4" />
                          Donate Now
                        </Button>
                        <Button
                          onClick={handleDetailReload}
                          disabled={isDetailReloading}
                          size="sm"
                          className="gap-2 bg-white text-red-600 hover:bg-red-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${isDetailReloading ? 'animate-spin' : ''}`} />
                          {isDetailReloading ? 'Updating...' : 'Update Info'}
                        </Button>
                        {detailLastUpdated && (
                          <p className="text-xs text-red-100">
                            Updated: {formatLastUpdated(detailLastUpdated)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b">
                  <Button
                    variant={detailView === 'overview' ? 'default' : 'ghost'}
                    onClick={() => setDetailView('overview')}
                    className={detailView === 'overview' ? 'bg-green-600' : ''}
                  >
                    Overview
                  </Button>
                  <Button
                    variant={detailView === 'timeline' ? 'default' : 'ghost'}
                    onClick={() => setDetailView('timeline')}
                    className={detailView === 'timeline' ? 'bg-green-600' : ''}
                  >
                    Recovery Timeline
                  </Button>
                  <Button
                    variant={detailView === 'breakdown' ? 'default' : 'ghost'}
                    onClick={() => setDetailView('breakdown')}
                    className={detailView === 'breakdown' ? 'bg-green-600' : ''}
                  >
                    Cost Breakdown
                  </Button>
                </div>

                {/* Overview Tab */}
                {detailView === 'overview' && (
                  <div className="space-y-6">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-green-700 mb-2">Detailed Damage Assessment</p>
                        <p className="text-4xl font-bold text-green-900 mb-1">
                          {displayedRegionData?.damageAssessment.toLocaleString()} VND
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Detailed Damage Assessment</h3>
                        <DamageMetric
                          label="Soil Erosion"
                          percentage={displayedRegionData?.soilErosion || 0}
                          color="bg-red-500"
                        />
                        <DamageMetric
                          label="Flooding"
                          percentage={displayedRegionData?.flooding || 0}
                          color="bg-blue-500"
                        />
                        <DamageMetric
                          label="Nutrient Loss"
                          percentage={displayedRegionData?.nutrientLoss || 0}
                          color="bg-orange-500"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Recommended Actions</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                              1
                            </div>
                            <p className="text-sm text-slate-700">Must verify affected area</p>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                              2
                            </div>
                            <p className="text-sm text-slate-700">28.8M VND required urgently</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-red-900 mb-3">Why Immediate Support is Needed</h3>
                        <ul className="space-y-2 text-sm text-red-800">
                          <li>• Every week of delay increases recovery costs by 7~10%</li>
                          <li>• High irreversibility: risk of permanent loss of recovery</li>
                          <li>• Long-term erosion leads to permanent soil loss</li>
                          <li>• Loss of the next crop season → starves poverty</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Timeline Tab */}
                {detailView === 'timeline' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Expected Recovery Timeline</h3>

                    <TimelineStep
                      icon={<CheckCircle className="w-5 h-5" />}
                      title="Weeks 0-2: Assessment & Verification"
                      subtitle="Completed: 1,640 households verified"
                      details="Detailed damage survey & farmer assistance records government validation"
                      status="completed"
                    />

                    <TimelineStep
                      icon={<TrendingUp className="w-5 h-5" />}
                      title="Weeks 2-4: Phase 1 Disbursement"
                      subtitle="In progress - Priority support for 721 poor households"
                      progress={8}
                      status="in-progress"
                    />

                    <TimelineStep
                      icon={<Calendar className="w-5 h-5" />}
                      title="Weeks 4-8: Land Recovery"
                      subtitle="Upcoming - Soil renewal, land stabilization, fertilization, replanting"
                      target="NDVI increase from 0.39 to 0.55+"
                      status="upcoming"
                    />

                    <TimelineStep
                      icon={<Home className="w-5 h-5" />}
                      title="Weeks 8-16: Monitoring & Additional Support"
                      subtitle="Ongoing - Periodic NDVI monitoring, additional support deployment"
                      target="80% of land fully recovered (NDVI ≥ 0.6)"
                      status="upcoming"
                    />
                  </div>
                )}

                {/* Breakdown Tab */}
                {detailView === 'breakdown' && (
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-4">Recovery Cost Breakdown</h3>
                        <p className="text-sm text-slate-600 mb-4">Budget Allocation</p>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-slate-700">Soil treatment (land renewal, erosion control)</span>
                            <span className="font-semibold">35%</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-slate-700">Fertilizer & soil revitalization</span>
                            <span className="font-semibold">21%</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-slate-700">Seeds & planting materials</span>
                            <span className="font-semibold">26%</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-slate-700">Labor costs</span>
                            <span className="font-semibold">11%</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-slate-700">Management & monitoring</span>
                            <span className="font-semibold">5%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">Contingency & buffer</span>
                            <span className="font-semibold">2%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-green-900 mb-2">Disbursement Phases</h3>
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-white rounded border-l-4 border-green-600">
                            <p className="font-semibold text-slate-900 mb-1">Phase 1: 40~50%</p>
                            <p className="text-slate-600">Critical assessment & immediate support for poorest households immediately after verification</p>
                          </div>
                          <div className="p-3 bg-white rounded border-l-4 border-blue-600">
                            <p className="font-semibold text-slate-900 mb-1">Phase 2: 30~35%</p>
                            <p className="text-slate-600">Bulk land recovery activities after Acquaintance of Phase 1</p>
                          </div>
                          <div className="p-3 bg-white rounded border-l-4 border-orange-600">
                            <p className="font-semibold text-slate-900 mb-1">Phase 3: 10~20%</p>
                            <p className="text-slate-600">Performance-based transfer</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-900 mb-4">Quick Stats</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-600 mb-1">ΔNDVI</p>
                        <p className="font-bold text-lg">{displayedRegionData?.ndvi}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 mb-1">Not reported yet</p>
                        <p className="font-bold text-lg text-red-600">{displayedRegionData?.notReported} days</p>
                      </div>
                      <div>
                        <p className="text-slate-600 mb-1">Affected Area</p>
                        <p className="font-bold text-lg">{displayedRegionData?.affectedArea}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-600 text-white">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-3" />
                    <h3 className="font-bold text-xl mb-2">Join Hands to Help {selectedRegion} Recover</h3>
                    <p className="text-green-100 text-sm mb-4">
                      Every contribution is 100% transparently allocated with detailed breakdown
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full bg-white text-green-600 hover:bg-green-50">
                        Donate Now
                      </Button>
                      <Button className="w-full bg-white text-green-600 hover:bg-green-50">
                        <Download className="w-4 h-4" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MapViewPage;
