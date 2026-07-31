import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUCTION_PRICING_PLANS, getPlanForTeamCount } from '../../constants/pricing';
import { FiCheckCircle, FiZap, FiShield, FiArrowRight } from 'react-icons/fi';
import './PricingSection.css';

const PricingSection = () => {
  const [selectedTeams, setSelectedTeams] = useState(6);
  const navigate = useNavigate();

  const currentPlanInfo = getPlanForTeamCount(selectedTeams);
  const activePlanNumber = currentPlanInfo?.plan?.planNumber || 3;

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

        {/* Interactive Team Count Selector Slider */}
        <div className="pricing-slider-card">
          <div className="slider-header">
            <div className="slider-title-wrapper">
              <label htmlFor="team-count-slider" className="slider-label">
                How many teams are in your auction?
              </label>
              <span className="team-count-display">{selectedTeams} Teams</span>
            </div>
            <div className="active-tier-summary">
              {currentPlanInfo.plan && (
                <span className="tier-pill">
                  {currentPlanInfo.plan.isFree
                    ? '🎉 Free Tier'
                    : `Active: ${currentPlanInfo.plan.name} — ₹${currentPlanInfo.plan.price}/auction`}
                </span>
              )}
            </div>
          </div>

          <div className="slider-input-wrapper">
            <input
              id="team-count-slider"
              type="range"
              min="1"
              max="20"
              value={selectedTeams}
              onChange={(e) => setSelectedTeams(Number(e.target.value))}
              className="team-range-input"
            />
            <div className="slider-ticks">
              <span>1 Team</span>
              <span>4 Teams</span>
              <span>8 Teams</span>
              <span>12 Teams</span>
              <span>16 Teams</span>
              <span>20 Teams</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="pricing-grid">
          {AUCTION_PRICING_PLANS.map((plan) => {
            const isActive = plan.planNumber === activePlanNumber;

            return (
              <div
                key={plan.planNumber}
                className={`pricing-card ${isActive ? 'active-card' : ''} ${plan.planNumber === 3 ? 'popular-card' : ''}`}
                onClick={() => setSelectedTeams(plan.maxTeams)}
              >
                {plan.planNumber === 3 && <div className="popular-badge">Most Popular</div>}
                {isActive && <div className="selected-badge">Selected Match</div>}

                <div className="card-header">
                  <h3 className="card-plan-name">{plan.name}</h3>
                  <div className="card-team-limit">Up to {plan.maxTeams} Teams</div>
                </div>

                <div className="card-price-box">
                  {plan.isFree ? (
                    <div className="price-amount free-text">FREE</div>
                  ) : (
                    <div className="price-amount">
                      <span className="currency">₹</span>
                      <span className="amount">{plan.price}</span>
                      <span className="period">/auction</span>
                    </div>
                  )}
                  {!plan.isFree && (
                    <div className="effective-rate">~₹{plan.effectivePerTeam} per team</div>
                  )}
                </div>

                <p className="card-description">{plan.description}</p>

                <ul className="card-features">
                  <li>
                    <FiCheckCircle className="feature-icon" /> Full Live Auction Console
                  </li>
                  <li>
                    <FiCheckCircle className="feature-icon" /> Real-time Player Bidding
                  </li>
                  <li>
                    <FiCheckCircle className="feature-icon" /> Custom Budget & Squad Limits
                  </li>
                  <li>
                    <FiCheckCircle className="feature-icon" /> Automated Team Squad Exports
                  </li>
                </ul>

                <button
                  onClick={handleCreateAuction}
                  className={`card-cta-btn ${isActive ? 'btn-highlight' : ''}`}
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
