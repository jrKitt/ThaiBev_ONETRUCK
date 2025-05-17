'use client';
import { useState } from 'react';
import {
  HomeIcon,
  TruckIcon,


  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', icon: HomeIcon },
  { name: 'FLEET', icon: TruckIcon },
];

export default function Sidebar() {
  const [active, setActive] = useState('Dashboard');

  return (
    <aside className="w-64 min-h-screen bg-white text-gray-700 p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.name}
            onClick={() => setActive(item.name)}
            className={`flex items-center justify-between cursor-pointer rounded-full px-4 py-2 transition-all ${
              active === item.name
                ? 'bg-gradient-to-r from-purple-300 to-purple-500 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </div>
            {item.expandable && <ChevronRightIcon className="w-4 h-4 opacity-50" />}
          </div>
        ))}
      </nav>
    </aside>
  );
}
