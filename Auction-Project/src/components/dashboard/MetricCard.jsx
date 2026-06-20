// src/components/dashboard/MetricCard.jsx

const MetricCard = ({ icon, iconBg, label, value }) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8eaf0',
      borderRadius: '12px',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flex: 1,
      minWidth: '160px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8a94a6', fontWeight: 500, marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1d2e', lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
};

export default MetricCard;