// src/components/layout/ProgressFooter.jsx
import { ClipboardList, Link, Users, Hammer, Lightbulb, ArrowRight } from 'lucide-react';

const steps = [
  { num: 1, label: 'Create Tournament',        desc: 'Set up your tournament details and rules.',   icon: ClipboardList, color: '#2563eb', bg: '#e8f0fe' },
  { num: 2, label: 'Generate Registration Link', desc: 'Share the registration link with players.', icon: Link,          color: '#1a9e5c', bg: '#e6f9f0' },
  { num: 3, label: 'Manage Players',            desc: 'View registered players and manage teams.',   icon: Users,         color: '#7c3aed', bg: '#f3e8ff' },
  { num: 4, label: 'Start Auction',             desc: 'Start the live auction and build champions.', icon: Hammer,        color: '#d97706', bg: '#fef9ec' },
];

const ProgressFooter = () => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.5)',
      padding: '20px 32px',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <Lightbulb size={16} strokeWidth={2} style={{ color: 'var(--text-secondary-light)' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-primary-light)', fontSize: '15px', transition: 'color 0.2s ease' }}>How it works?</span>
        </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
        {steps.map((step, idx) => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: step.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <step.icon size={20} strokeWidth={2} style={{ color: step.color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary-light)', fontSize: '13px', transition: 'color 0.2s ease' }}>
                    {step.num}. {step.label}
                  </div>
                  <div style={{ color: 'var(--text-secondary-light)', fontSize: '12px', marginTop: '2px', transition: 'color 0.2s ease' }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight size={18} strokeWidth={2} style={{ color: '#c5cae0', padding: '12px 8px 0', flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressFooter;