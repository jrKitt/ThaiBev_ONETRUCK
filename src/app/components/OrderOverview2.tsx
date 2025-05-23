'use client';
import React from 'react';
import { FaTruck, FaExclamationTriangle, FaMapMarkedAlt, FaClock } from 'react-icons/fa';

interface OrderOverviewProps {
  onRoute: number;
  errors: number;
  deviated: number;
  late: number;
}

const OrderOverview2: React.FC<OrderOverviewProps> = ({ onRoute, errors, deviated, late }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard icon={<FaTruck />} title="On Route" value={onRoute} change="10%" color="teal" />
      <StatCard icon={<FaExclamationTriangle />} title="Errors" value={errors} change="5%" color="amber" />
      <StatCard icon={<FaMapMarkedAlt />} title="Deviated" value={deviated} change="7%" color="pink" />
      <StatCard icon={<FaClock />} title="Late" value={late} change="3%" color="blue" />
    </div>
  );
};

export default OrderOverview2;