// src/components/dashboard/MetricCard.jsx

const MetricCard = ({ icon: Icon, iconBg, label, value, subtitle }) => {
  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--glass-border)',
      borderRadius: '12px',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      flex: 1,
      minWidth: '160px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '10px',
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
        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary-light)', lineHeight: 1, transition: 'color 0.2s ease' }}>{value}</div>
        {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-secondary-light)', marginTop: '4px', transition: 'color 0.2s ease' }}>{subtitle}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
