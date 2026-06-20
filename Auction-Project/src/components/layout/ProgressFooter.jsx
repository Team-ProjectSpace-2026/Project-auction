// src/components/layout/ProgressFooter.jsx

const steps = [
  { num: 1, label: 'Create Tournament',        desc: 'Set up your tournament details and rules.',   icon: '📋', color: '#2563eb', bg: '#e8f0fe' },
  { num: 2, label: 'Generate Registration Link', desc: 'Share the registration link with players.', icon: '🔗', color: '#1a9e5c', bg: '#e6f9f0' },
  { num: 3, label: 'Manage Players',            desc: 'View registered players and manage teams.',   icon: '👥', color: '#7c3aed', bg: '#f3e8ff' },
  { num: 4, label: 'Start Auction',             desc: 'Start the live auction and build champions.', icon: '🔨', color: '#d97706', bg: '#fef9ec' },
];

const ProgressFooter = () => {
  return (
    <div style={{
      background: '#fff',
      borderTop: '1px solid #e8eaf0',
      padding: '20px 32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px' }}>💡</span>
        <span style={{ fontWeight: 700, color: '#1a1d2e', fontSize: '15px' }}>How it works?</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
        {steps.map((step, idx) => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: step.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: '13px' }}>
                    {step.num}. {step.label}
                  </div>
                  <div style={{ color: '#8a94a6', fontSize: '12px', marginTop: '2px' }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                color: '#c5cae0', fontSize: '18px', padding: '12px 8px 0',
                flexShrink: 0,
              }}>→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressFooter;