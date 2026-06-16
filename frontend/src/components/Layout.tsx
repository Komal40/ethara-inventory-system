import React, { useState } from 'react';
import { LayoutDashboard, Box, Users, ShoppingCart, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Products', icon: Box },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
  ];

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false); // Auto-close drawer overlay menu on mobile select
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      
      {/* Mobile Top Navigation Bar Toggle Header */}
      <div className="lg:hidden bg-slate-900 text-white w-full h-16 fixed top-0 left-0 flex items-center justify-between px-6 z-40 shadow-md">
        <span className="font-bold text-indigo-400 tracking-wide text-lg">Ethara Inventory</span>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-300 hover:text-white transition-colors focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Dimmed Backdrop Tint Layer for Mobile Menu Dismissal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side View Navigation panel (Responsive Mobile Drawer View + Desktop Sidebar View) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 text-xl font-bold border-b border-slate-800 tracking-wide text-indigo-400 hidden lg:block">
          Ethara Inventory
        </div>
        {/* Safe padding element space margin when viewing from inside mobile screen viewports */}
        <div className="h-16 lg:hidden" /> 
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Primary Context Workspace Canvas Container viewport View node */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-20 lg:pt-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};