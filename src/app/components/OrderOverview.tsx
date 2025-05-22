import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

interface EarningsCardProps {
  title: string;
  value: string;
  percentage: string;
  color: string;
  progress: number;
}

const EarningsCard = ({
  title, value, percentage, color, progress
}: EarningsCardProps) => {
  const displayPercentage = percentage || '0%';

  const colorMap = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500'
  };

  const progressBarColor = colorMap[color as keyof typeof colorMap] || 'bg-gray-500';

  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">{title}</p>
        <div className="text-xl font-semibold">{value}</div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Compared to last year</div>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${displayPercentage.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {displayPercentage}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm text-gray-500">Progress</div>
        <div className="w-full bg-gray-300 rounded-full h-2.5 mt-1">
          <div
            className={`${progressBarColor} h-2.5 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [rejectedOrders, setRejectedOrders] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    Papa.parse('/data/TO.csv', {
      download: true,
      header: true,
      complete: (result) => {
        const rawData = result.data as any[];
        const filteredData = rawData.filter(row => row && Object.keys(row).length > 0 && row['สถานะ']);

        const total = filteredData.filter(item => item['สถานะ']).length;
        const completed = filteredData.filter(item => item['สถานะ'] === 'DELIVERY_COMPLETED').length;
        const totalTiHi = filteredData.reduce((sum, item) => {
          const value = parseFloat(item['TiHi']);
          return !isNaN(value) ? sum + value : sum;
        }, 0);
        const totalQty = filteredData.reduce((sum, item) => {
          const value = parseFloat(item['จำนวน']);
          return !isNaN(value) ? sum + value : sum;
        }, 0);


        const rejected = filteredData.filter(item => item['สถานะ'] === 'OPEN').length;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        console.log(completed+rejected)

        setTotalOrders(total);
        setCompletedOrders(completed);
        setRejectedOrders(rejected);
        setProgressPercentage(progress);
      },
      error: (err) => {
        console.error('Error parsing CSV:', err);
      },
    });
  }, []);

  return (
    <div className="w-full p-4 rounded-lg">
      <div className="w-full max-w-md">
        <EarningsCard
          title="Total Orders"
          value={`${totalOrders}`}
percentage={totalOrders > 0 ? '100%' : '0%'}
          color="blue"
          progress={100}
        />
        <EarningsCard
          title="Completed Orders"
          value={`${completedOrders}`}
          percentage={totalOrders > 0 ? `${Math.round((completedOrders / totalOrders) * 100)}%` : '0%'}
          color="green"
          progress={totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}
        />
        <EarningsCard
          title="Pending Orders"
          value={`${rejectedOrders}`}
          percentage={totalOrders > 0 ? `${Math.round((rejectedOrders / totalOrders) * 100)}%` : '0%'}
          color="red"
          progress={totalOrders > 0 ? Math.round((rejectedOrders / totalOrders) * 100) : 0}
        />
      </div>
    </div>
  );
}
