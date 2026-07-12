// src/components/dashboard/MetricCard.jsx

const MetricCard = ({ icon: Icon, iconBg, label, value, subtitle }) => {
  return (
    <div style={{
      background: 'var(--card-bg-light)',
      border: '1px solid var(--border-light)',
      borderRadius: '12px',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flex: 1,
      minWidth: '160px',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {Icon && <Icon size={22} strokeWidth={2} />}
      </div>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary-light)', fontWeight: 500, marginBottom: '4px', transition: 'color 0.2s ease' }}>{label}</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary-light)', lineHeight: 1, transition: 'color 0.2s ease' }}>{value}</div>
        {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-secondary-light)', marginTop: '4px', transition: 'color 0.2s ease' }}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default MetricCard;