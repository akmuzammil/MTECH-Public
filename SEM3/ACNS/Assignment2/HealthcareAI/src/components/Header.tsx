import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 lg:ml-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
              </svg>
              <span className="ml-2 text-lg font-semibold text-foreground">HealthAI Assistant</span>
            </div>
          </div>
          <div className="flex items-center">
            <button
              type="button" hidden={true}
              className="p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="View notifications"
            >
              <Bell className="h-6 w-6" />
            </button>
            <text className="hidden lg:block text-gray-700">Muzammil AK - 2023MT03579 - Group 31</text>
            <div className="ml-3 relative">
              
              <button
                type="button"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="User menu"
                aria-expanded="false"
              >
               
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;