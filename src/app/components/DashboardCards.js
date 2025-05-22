import React, { useEffect, useState } from 'react';
import shipmentsData from '../data/shipments.json';

const DashboardCards = () => {
  const [vehicleStatuses, setVehicleStatuses] = useState({
    total: 0,
    inTransit: 0,
    available: 0,
    broken: 0,
  });

  useEffect(() => {
    const shipments = shipmentsData.shipments;
    const totalVehicles = shipments.length;
    const inTransit = shipments.filter(s => s.status === "in_transit").length;
    const available = shipments.filter(s => s.status === "available").length;
    const broken = shipments.filter(s => s.status === "broken").length;

    setVehicleStatuses({
      total: totalVehicles,
      inTransit,
      available,
      broken,
    });
  }, []);

  const data = [
        {
      rate: `${Math.round((vehicleStatuses.total / vehicleStatuses.total) * 100)}%`,
      title: `จำนวนรถทั้งหมด: ${vehicleStatuses.total}`,
      sub: `รวม: ${vehicleStatuses.total}`,
      color: "#06b6d4",
      icon: "📍"
    },
    {
      rate: `${Math.round((vehicleStatuses.inTransit / vehicleStatuses.total) * 100)}%`,
      title: `กำลังใช้งาน: ${vehicleStatuses.inTransit}`,
      sub: `จำนวน: ${vehicleStatuses.available}`,
      color: "#ef4444",
      icon: "🚚"
    },
    {
      rate: `${Math.round((vehicleStatuses.available / vehicleStatuses.total) * 100)}%`,
      title: `ว่าง: ${vehicleStatuses.available}`,
      sub: `จำนวน: ${vehicleStatuses.broken}`,
      color: "#97D86E",
      icon: "🟢"
    },
    {
      rate: `${Math.round((vehicleStatuses.broken / vehicleStatuses.total) * 100)}%`,
      title: `ซ่อมบำรุง: ${vehicleStatuses.broken}`,
      sub: `จำนวน: ${vehicleStatuses.total}`,
      color: "#f59e42",
      icon: "⚙️"
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2,1fr)',
      gap: '15px',
      maxWidth: 550,
      margin: '30px auto 0 auto'
    }}>
      {/* Orders Main Card */}
      <div style={{
        gridColumn: "1/3",
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        border: '1px solid #eee',
        marginBottom: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#555' }}>จำนวนรถทั้งหมด</div>
            <div style={{ fontSize: 36, fontWeight: 'bold' }}>{vehicleStatuses.total}</div>
            <div style={{ color: '#888', marginTop: 4 }}>ทั้งหมด</div>
          </div>
          <span style={{ background: "#fff7dc", color: "#d9a400", borderRadius: 12, padding: "4px 14px", fontWeight: 600 }}>ภาพรวม</span>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ color: "#d9a400", fontWeight: 'bold', fontSize: 18 }}><span>{Math.round((vehicleStatuses.inTransit / vehicleStatuses.total) * 100)}%</span></div>
          <div style={{ height: 5, background: "#eee", borderRadius: 5, marginTop: 8 }}>
            <div style={{ width: `${Math.round((vehicleStatuses.inTransit / vehicleStatuses.total) * 100)}%`, height: '100%', background: "#fbbf24", borderRadius: 5 }} />
          </div>
        </div>
      </div>
      {/* Statistic Cards */}
      {data.map((item, idx) => (
        <div key={idx} style={{
          background: "#fff",
          borderRadius: 12,
          border: '1px solid #eee',
          padding: 18,
          boxShadow: "0 1px 5px 0 rgba(0,0,0,0.01)",
          minWidth: 170, minHeight: 100,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ color: item.color, fontWeight: 700, fontSize: 20 }}>{item.rate}</div>
            <div style={{ fontSize: 24 }}>{item.icon}</div>
          </div>
          <div style={{ fontWeight: 600, margin: '8px 0 3px 0', fontSize: 16 }}>{item.title}</div>
          <div style={{ color: '#666', fontSize: 14 }}>{item.sub}</div>
          <div style={{ height: 4, background: "#eee", borderRadius: 3, marginTop: 7 }}>
            <div style={{ width: item.rate, height: '100%', background: item.color, borderRadius: 3, transition: 'width .4s' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;