'use client';


import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  TruckIcon,
  ArchiveBoxIcon,
  MapIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import {useState} from 'react';

const menuItems = [
  { name: 'แดชบอร์ด', icon: HomeIcon, href: '/region/south/rdc' },  // ตัวอย่าง default path
  { name: 'ยานพาหนะ', icon: TruckIcon, href: '/vehicles' },
  { name: 'คำสั่งซื้อ', icon: ArchiveBoxIcon, href: '/orders' },
  { name: 'เส้นทาง', icon: MapIcon, href: '/routes' },
  { name: 'รายงาน', icon: ChartBarIcon, href: '/reports' },
  { name: 'ผู้ใช้งาน', icon: UsersIcon, href: '/users' },
  { name: 'ตั้งค่า', icon: Cog6ToothIcon, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const brandGradient = 'from-[#004E92] via-[#0066CC] to-[#0099FF]';

  const logout = () => {
    window.location.href = '/login';
  };

  return (
    <aside
      className={`
        relative flex flex-col bg-white shadow-lg h-screen
        transition-width duration-300
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute top-4 right-4 p-5 rounded"
      >
        {collapsed ? (
          <ChevronDoubleRightIcon className="w-5 h-5 p-3 opacity-100" />
        ) : (
          <ChevronDoubleLeftIcon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* โลโก้ */}
      <div className="flex items-center justify-center p-6">
        <Image
          src="/logo.png"
          alt="One Logistics"
          width={collapsed ? 36 : 120}
          height={collapsed ? 36 : 120}
          className="transition-all duration-300"
        />
      </div>

      {/* เมนูหลัก */}
      <nav className="flex-1 px-2 space-y-1 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all
                ${isActive
                  ? `bg-gradient-to-r ${brandGradient} text-white shadow-md`
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 text-sm font-medium">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ขีดแบ่ง */}
      <div className="border-t mt-4" />

      {/* โปรไฟล์ + Logout */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Image
            src="/user-profile.jpg"
            alt="รูปพนักงาน"
            width={collapsed ? 32 : 64}
            height={collapsed ? 32 : 64}
            className="rounded-full transition-all duration-300"
          />
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold">ONELOG0001</p>
              <p className="text-xs text-gray-500">พนักงาน</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg transition hover:bg-red-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">ออกจากระบบ</span>
          </button>
        )}
      </div>
    </aside>
  );
}
