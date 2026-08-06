import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUCTION_PRICING_PLANS } from '../../constants/pricing';
import { FiCheckCircle, FiZap, FiShield, FiArrowRight } from 'react-icons/fi';
import './PricingSection.css';

const PricingSection = () => {
  const [selectedPlanNumber, setSelectedPlanNumber] = useState(3);
  const navigate = useNavigate();

  const handleCreateAuction = () => {
    navigate('/tournaments/create');
  };

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        {/* Header */}
        <div className="pricing-header">
          <span className="pricing-badge">
            <FiZap /> Fair & Transparent Pricing
          </span>
          <h2 className="pricing-title">Pay Only For The Teams You Host</h2>
          <p className="pricing-subtitle">
            Every auction plan comes with full access to live bidding dashboard, player draft tools, custom budgets, and instant analytics.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="pricing-grid">
          {AUCTION_PRICING_PLANS.map((plan) => {
            const isActive = plan.planNumber === selectedPlanNumber;

            return (
              <div
                key={plan.planNumber}
                className={`simple-pricing-card ${isActive ? 'active-card' : ''} ${plan.planNumber === 3 ? 'popular-card' : ''}`}
                onClick={() => setSelectedPlanNumber(plan.planNumber)}
              >
                {plan.planNumber === 3 && <div className="popular-badge">Most Popular</div>}
                {isActive && <div className="selected-badge">Selected Match</div>}

                <div className="simple-card-plan">{plan.name}</div>

                <h3 className="simple-card-teams">
                  <span className="team-num-highlight">{plan.maxTeams}</span> Teams
                </h3>

                <div className="simple-card-ribbon">
                  {plan.isFree ? (
                    <div className="ribbon-price-content free-ribbon">
                      <span className="free-title">Free</span>
                      <span className="ribbon-sparkles">✨</span>
                    </div>
                  ) : (
                    <div className="ribbon-price-content">
                      <div className="ribbon-amount">₹ {plan.price.toLocaleString('en-IN')}/-</div>
                      <div className="ribbon-per-auction">Per Auction</div>
                    </div>
                  )}
                </div>

                <div className="simple-card-footer">
                  Total Teams - Upto {plan.maxTeams}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateAuction();
                  }}
                  className={`simple-card-btn ${isActive ? 'btn-highlight' : ''}`}
                >
                  Host Tournament <FiArrowRight />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Banner */}
        <div className="pricing-footer-banner">
          <div className="trust-item">
            <FiShield className="trust-icon" />
            <span>Instant Activation upon creation</span>
          </div>
          <div className="trust-item">
            <FiCheckCircle className="trust-icon" />
            <span>No recurring subscription auto-debits</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
