'use client'

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Download, Printer } from 'lucide-react';
import Header from '@/components/header';

// Donation Amount Button Component
interface DonationButtonProps {
  amount: string;
  isSelected: boolean;
  onClick: () => void;
}

const DonationButton: React.FC<DonationButtonProps> = ({ amount, isSelected, onClick }) => {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`w-full py-6 text-lg ${isSelected
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-white hover:bg-slate-50 text-slate-900 border-2'
        }`}
      onClick={onClick}
    >
      {amount} vnd
    </Button>
  );
};

const DonatePage = () => {
  const [view, setView] = useState<'amount' | 'qr'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<string>('50,000');
  const [customAmount, setCustomAmount] = useState<string>('');

  const predefinedAmounts = ['50,000', '100,000', '200,000', '500,000', '1,000,000'];

  const handleContinue = () => {
    setView('qr');
  };

  const handleBack = () => {
    setView('amount');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header activeTab="donate" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {view === 'amount' ? (
          // Donation Amount Selection View
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Info */}
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Make a Difference
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Your donation helps us provide emergency response services and support to communities in need.
              </p>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-green-900 mb-2">Why donate?</h3>
                  <ul className="space-y-2 text-green-800 text-sm">
                    <li>• Rapid emergency response</li>
                    <li>• Community safety programs</li>
                    <li>• Disaster relief efforts</li>
                    <li>• Training and education</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="mt-6 p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Total donations this month</span>
                </div>
                <p className="text-3xl font-bold text-green-600">2,450,000 vnd</p>
                <p className="text-xs text-slate-500 mt-1">From 156 generous donors</p>
              </div>
            </div>

            {/* Right Side - Donation Form */}
            <div>
              <Card className="overflow-hidden p-0">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-center">
                  <h3 className="text-3xl font-bold text-white mb-2">Donate Now</h3>
                  <p className="text-green-50">Choose your donation amount</p>
                </div>

                <CardContent className="p-8">
                  <div className="space-y-3 mb-6">
                    {predefinedAmounts.map((amount) => (
                      <DonationButton
                        key={amount}
                        amount={amount}
                        isSelected={selectedAmount === amount && !customAmount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                      />
                    ))}
                  </div>

                  <div className="mb-6">
                    <Input
                      type="text"
                      placeholder="Type your amount (vnd)"
                      className="py-6 text-lg text-center"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount('');
                      }}
                    />
                  </div>

                  <Button
                    className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
                    onClick={handleContinue}
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // QR Code View
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={handleBack}
            >
              ← Back to amount
            </Button>

            <Card className="overflow-hidden p-0">
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-center">
                <h3 className="text-3xl font-bold text-white mb-2">Donate Now</h3>
                <p className="text-green-50">Scan QR code to complete donation</p>
              </div>

              <CardContent className="p-12 text-center">
                <h4 className="text-xl font-semibold text-slate-900 mb-2">
                  Scan to donate
                </h4>
                <p className="text-slate-600 mb-8">
                  Point your camera at this QR Code to start the payment process or download it for later.
                </p>

                {/* QR Code Display */}
                <div className="inline-block p-6 bg-white border-4 border-slate-200 rounded-lg mb-6">
                  <div className="w-64 h-64 bg-slate-100 flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-slate-400" />
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {customAmount || selectedAmount} vnd
                  </p>
                  <p className="text-sm text-slate-500">Donation amount</p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    Print PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </Button>
                </div>

                <div className="mt-8 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    After scanning, you&apos;ll be redirected to complete the payment securely through your banking app.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonatePage;
