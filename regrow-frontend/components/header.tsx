import { Bell, MapPin, User } from "lucide-react";
import { Button } from "./ui/button";

// Reusable Header Component
interface HeaderProps {
  activeTab?: 'explore' | 'news' | 'donate' | 'dashboard';
}

const Header: React.FC<HeaderProps> = ({ activeTab = 'explore' }) => {
  const navItems = [
    { id: 'explore', label: 'Explore', href: '/' },
    { id: 'map', label: 'Map', href: '/map' },
    { id: 'news', label: 'News', href: '/news' },
    { id: 'donate', label: 'Donate', href: '/donate' },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Emergency Response</h1>
        </div>

        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`font-medium ${activeTab === item.id
                ? 'text-green-600 hover:text-green-700 border-b-2 border-green-600 pb-1'
                : 'text-slate-700 hover:text-slate-900'
                }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header
