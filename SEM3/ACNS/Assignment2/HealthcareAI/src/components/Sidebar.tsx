import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Home, FileText, HelpCircle, Activity, ImageIcon, BarChart3, Cog } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
  { name: 'Text Analysis', path: '/text-analysis', icon: <FileText className="h-5 w-5" /> },
  { name: 'Q&A', path: '/question-answering', icon: <HelpCircle className="h-5 w-5" /> },
  { name: 'Disease Prediction', path: '/disease-prediction', icon: <Activity className="h-5 w-5" /> },
  { name: 'Image Classification', path: '/image-classification', icon: <ImageIcon className="h-5 w-5" /> },
  { name: 'Metrics', path: '/metrics', icon: <BarChart3 className="h-5 w-5" /> },
  { name: 'Fine-Tuning', path: '/fine-tuning', icon: <Cog className="h-5 w-5" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
            </svg>
            <span className="ml-2 text-lg font-semibold">HealthAI</span>
          </div>
          <button 
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center px-2 py-2 text-base font-medium rounded-md group",
                    isActive 
                      ? "bg-primary text-white" 
                      : "text-gray-700 hover:bg-primary-light/10 hover:text-primary-dark"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;