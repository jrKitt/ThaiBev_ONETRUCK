const data = [
    {
      rate: "17%", title: "Clicked 7,3672",
      sub: "Unclicked 352,735", color: "#ef4444", icon: "🔄"
    },
    {
      rate: "67%", title: "Opened 8,7678",
      sub: "Unopened 126,035", color: "#06b6d4", icon: "🗑️"
    },
    {
      rate: "42%", title: "Subscribes 8,376",
      sub: "Unclicked 352,735", color: "#f59e42", icon: "📧"
    },
    {
      rate: "33%", title: "18 Complains",
      sub: "Unclicked 457,735", color: "#3b82f6", icon: "⚠️"
    },
    {
      rate: "85%", title: "Total CTR",
      sub: "Unclicked 652,735", color: "#10b981", icon: "⏱️"
    },
  ];
  
  export default function DashboardCards() {
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
              <div style={{ color: '#555' }}>Orders</div>
              <div style={{ fontSize: 36, fontWeight: 'bold' }}>2500</div>
              <div style={{ color: '#888', marginTop: 4 }}>New Orders</div>
            </div>
            <span style={{ background: "#fff7dc", color: "#d9a400", borderRadius: 12, padding: "4px 14px", fontWeight: 600 }}>Annual</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ color: "#d9a400", fontWeight: 'bold', fontSize: 18 }}><span>24%</span></div>
            <div style={{ height: 5, background: "#eee", borderRadius: 5, marginTop: 8 }}>
              <div style={{ width: "24%", height: '100%', background: "#fbbf24", borderRadius: 5 }} />
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
            minWidth:170, minHeight:100,
            display:'flex', flexDirection:'column', justifyContent:'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ color: item.color, fontWeight: 700, fontSize: 20 }}>{item.rate}</div>
              <div style={{ fontSize:24 }}>{item.icon}</div>
            </div>
            <div style={{ fontWeight: 600, margin: '8px 0 3px 0', fontSize:16 }}>{item.title}</div>
            <div style={{ color: '#666', fontSize:14 }}>{item.sub}</div>
            <div style={{ height: 4, background: "#eee", borderRadius: 3, marginTop: 7 }}>
              <div style={{ width: item.rate, height: '100%', background: item.color, borderRadius: 3, transition: 'width .4s' }} />
            </div>
          </div>
        ))}
        {/* Frontend time card (full width) */}
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: '1px solid #eee',
          padding: 20,
          minHeight: 100,
          gridColumn: "2/3",
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent:'center'
        }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#555' }}>2.14s</div>
          <div style={{ color: '#888', marginTop: 2 }}>Frontend time</div>
        </div>
      </div>
    );
  }