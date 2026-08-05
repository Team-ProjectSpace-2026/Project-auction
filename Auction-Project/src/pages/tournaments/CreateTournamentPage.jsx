import Sidebar from "../../components/layout/Sidebar";
import SuccessModal from "../../components/common/SuccessModal";
import { FiMapPin, FiCalendar, FiUpload } from "react-icons/fi";
import "./CreateTournamentPage.css";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { createTournament } from "../../services/tournamentService";
import bgStadium from "../../assets/bgstadium2.png";
import { getPlanForTeamCount } from "../../constants/pricing";
import { useAuth } from "../../context/AuthContext";
import { initiateCashfreePayment, loadCashfreeSDK, verifyPaymentSignature } from "../../services/paymentService";
import { FiCheckCircle, FiShield, FiX, FiAward, FiZap } from "react-icons/fi";

// Converts "YYYY-MM-DDTHH:MM" (datetime-local value) to ISO with timezone offset
const toISOWithOffset = (dtLocal) => {
  const d = new Date(dtLocal);
  if (isNaN(d)) return dtLocal;
  return d.toISOString();
};

// Returns "YYYY-MM-DDTHH:MM" in local time for datetime-local input
const localNowISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const CreateTournamentPage = () => {
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    tournamentName: "",
    numTeams: "",
    budgetPerTeam: "",
    maxPlayersPerTeam: "",
    playerBasePrice: "",
    venue: "",
    auctionDateTime: "",
    isPaid: false,
    registrationFee: "",
    payoutUpiId: "",
  });
  const navigate = useNavigate();

  const userEmail = user?.email || "";
  const currentPlanInfo = getPlanForTeamCount(formData.numTeams, userEmail);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Only JPG and PNG files are allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateCreate = () => {
    const { tournamentName, numTeams, budgetPerTeam, maxPlayersPerTeam, playerBasePrice, venue, auctionDateTime, isPaid, registrationFee } = formData;
    if (!tournamentName || !numTeams || !budgetPerTeam || !maxPlayersPerTeam || !playerBasePrice || !venue || !auctionDateTime) {
      alert("Please fill in all required fields.");
      return;
    }

    if (currentPlanInfo.exceedsLimit) {
      alert("Exceeds maximum allowed limit of 20 teams per auction.");
      return;
    }

    if (isPaid && (!registrationFee || Number(registrationFee) <= 0)) {
      alert("Please enter a valid Registration Fee for a Paid tournament.");
      return;
    }

    // Check if payment is required (paid plan and not VIP)
    if (currentPlanInfo.requiresPayment) {
      setShowPaymentModal(true);
    } else {
      executeTournamentCreation();
    }
  };

  const handleCashfreeCheckout = async () => {
    setLoading(true);
    try {
      // Step 1: Create Cashfree order on server
      const paymentRes = await initiateCashfreePayment({
        numTeams: formData.numTeams,
        amount: currentPlanInfo.price,
        type: 'tournament_hosting',
        firstname: user?.name || 'Organizer',
        email: user?.email,
        phone: user?.mobile
      });

      // Free tier — no payment needed
      if (paymentRes.success && paymentRes.isFree) {
        await executeTournamentCreation();
        return;
      }

      if (paymentRes.success && paymentRes.paymentSessionId) {
        // Step 2: Load Cashfree SDK and open checkout modal
        const cashfree = await loadCashfreeSDK(paymentRes.env);
        const checkoutOptions = {
          paymentSessionId: paymentRes.paymentSessionId,
          redirectTarget: "_modal"
        };

        // Step 3: AWAIT checkout — wait for user to pay/cancel
        const result = await cashfree.checkout(checkoutOptions);

        // Step 4: Verify payment on server BEFORE creating tournament
        if (result && result.paymentDetails) {
          const verifyRes = await verifyPaymentSignature(paymentRes.orderId, {
            numTeams: formData.numTeams,
            tournamentName: formData.tournamentName,
            type: 'tournament_hosting'
          });
          if (verifyRes.success) {
            // Payment confirmed — now create tournament
            await executeTournamentCreation();
          } else {
            alert("Payment verification failed. Your payment may be pending — please try again or contact support.");
            setLoading(false);
          }
        } else {
          // User cancelled or payment failed
          alert("Payment was cancelled or failed. Tournament was not created.");
          setLoading(false);
        }
      } else {
        alert(paymentRes.message || "Payment initiation failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Cashfree checkout error:", err);
      alert("Payment error: " + (err.message || "Something went wrong. Please try again."));
      setLoading(false);
      // DO NOT create tournament on error
    }
  };

  const executeTournamentCreation = async () => {
    setLoading(true);
    setShowPaymentModal(false);
    try {
      const payload = new FormData();
      payload.append("name", formData.tournamentName);
      payload.append("status", "Upcoming");
      payload.append("date", toISOWithOffset(formData.auctionDateTime));
      payload.append("teams", Number(formData.numTeams));
      payload.append("venue", formData.venue);
      payload.append("budgetPerTeam", Number(formData.budgetPerTeam));
      payload.append("maxPlayersPerTeam", Number(formData.maxPlayersPerTeam));
      payload.append("playerBasePrice", Number(formData.playerBasePrice));
      payload.append("isPaid", formData.isPaid);
      payload.append("registrationFee", formData.isPaid ? Number(formData.registrationFee) : 0);
      payload.append("payoutUpiId", formData.isPaid ? formData.payoutUpiId : "");
      if (logoFile) {
        payload.append("logo", logoFile);
      }
      await createTournament(payload);
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to create tournament:", err);
      alert(err.response?.data?.message || "Failed to create tournament. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      {/* Sidebar */}
      <Sidebar activePage="tournaments" />

      {/* Main Container */}
      <div className="create-container">
        {/* Fixed Background */}
        <div style={{
          position: "fixed",
          top: 0,
          left: "220px",
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bgStadium})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }} />

        {/* Top Navigation */}
        {/* <TopBar user={MOCK_USER} /> */}

        {/* Main Content */}
        <main className="create-main">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span className="breadcrumb-active">Dashboard</span>

            <span className="breadcrumb-separator">&gt;</span>

            <span className="breadcrumb-current">
              Create Tournament
            </span>
          </div>

          {/* Page Heading */}
          <div className="page-header">
            <h1>Create Tournament</h1>

            <p>
              Enter tournament details to get started.
            </p>
          </div>

{/* Main White Card */}
        <div className="create-card" style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--glass-border)",
        }}>

    {/* Logo Upload */}
    <div style={{ marginBottom: "24px", textAlign: "center" }}>
      <label style={{ display: "block", marginBottom: "10px", fontWeight: "600" }}>
        Tournament Logo
      </label>
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "16px",
          background: "var(--info-bg)",
          border: "2px dashed var(--border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
          overflow: "hidden",
          cursor: "pointer",
          transition: "border-color 0.2s ease",
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {logoPreview ? (
          <img src={logoPreview} alt="Tournament Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <FiUpload size={28} style={{ color: "var(--text-secondary-light)" }} />
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png"
        onChange={handleLogoChange}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: "none",
          border: "none",
          color: "var(--accent-light)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        {logoPreview ? "Change Logo" : "Upload Tournament Logo"}
      </button>
    </div>

    {/* Row 1 */}
    <div className="form-row">

        <div className="form-group">
            <label>
                Tournament Name <span>*</span>
            </label>

                <input
                    type="text"
                    name="tournamentName"
                    value={formData.tournamentName}
                    onChange={handleInputChange}
                    placeholder="Enter tournament name"
                />
        </div>

        <div className="form-group">
            <label>
                Number of Teams <span>*</span>
            </label>

                <input
                    type="number"
                    name="numTeams"
                    value={formData.numTeams}
                    onChange={handleInputChange}
                    placeholder="Enter number of teams (1 - 20)"
                    min="1"
                    max="20"
                />

                {formData.numTeams && (
                  <div className="pricing-tier-indicator" style={{ marginTop: "8px" }}>
                    {currentPlanInfo.isVip ? (
                      <div className="tier-badge vip-badge">
                        <FiAward /> {currentPlanInfo.badgeText}
                      </div>
                    ) : currentPlanInfo.exceedsLimit ? (
                      <div className="tier-badge error-badge">
                        ⚠️ {currentPlanInfo.message}
                      </div>
                    ) : currentPlanInfo.plan?.isFree ? (
                      <div className="tier-badge free-badge">
                        <FiZap /> {currentPlanInfo.badgeText}
                      </div>
                    ) : (
                      <div className="tier-badge paid-badge">
                        <FiCheckCircle /> {currentPlanInfo.badgeText}
                      </div>
                    )}
                  </div>
                )}
        </div>

    </div>

    {/* Row 2 */}

    <div className="form-row">

        <div className="form-group">
            <label>
                Budget Per Team (₹) <span>*</span>
            </label>

                <input
                    type="number"
                    name="budgetPerTeam"
                    value={formData.budgetPerTeam}
                    onChange={handleInputChange}
                    placeholder="Enter budget per team"
                />
        </div>

        <div className="form-group">
            <label>
                Maximum Players Per Team <span>*</span>
            </label>

                <input
                    type="number"
                    name="maxPlayersPerTeam"
                    value={formData.maxPlayersPerTeam}
                    onChange={handleInputChange}
                    placeholder="Enter maximum players per team"
                />
        </div>

    </div>


    {/* Row 3 */}

    <div className="form-row">

        <div className="form-group">
            <label>
                Venue <span>*</span>
            </label>

            <div className="input-icon">

               <span className="input-symbol">
            <FiMapPin />
        </span>

                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleInputChange}
                            placeholder="Enter tournament venue"
                        />

            </div>
        </div>

        <div className="form-group">
            <label>
                Player Base Price (₹) <span>*</span>
            </label>

                <input
                    type="number"
                    name="playerBasePrice"
                    value={formData.playerBasePrice}
                    onChange={handleInputChange}
                    placeholder="Enter player base price"
                />
        </div>

    </div>

{/* Row 4 */}

<div className="form-group full-width">

    <label>
        Auction Date & Time <span>*</span>
    </label>

    <div className="input-icon">

        <span className="input-symbol">
    <FiCalendar />
</span>

                <input
                    type="datetime-local"
                    name="auctionDateTime"
                    value={formData.auctionDateTime}
                    min={localNowISO()}
                    onChange={handleInputChange}
                />

    </div>

</div>

{/* Row 5: Registration Type & Payment Options */}
<div style={{
  marginTop: '20px',
  marginBottom: '24px',
  padding: '18px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)'
}}>
  <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px', fontSize: '15px' }}>
    Player Registration Type <span>*</span>
  </label>
  <div style={{ display: 'flex', gap: '20px', marginBottom: formData.isPaid ? '16px' : '0' }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
      <input
        type="radio"
        name="isPaidRadio"
        checked={!formData.isPaid}
        onChange={() => setFormData(prev => ({ ...prev, isPaid: false }))}
      />
      🎉 Free Registration
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
      <input
        type="radio"
        name="isPaidRadio"
        checked={formData.isPaid}
        onChange={() => setFormData(prev => ({ ...prev, isPaid: true }))}
      />
      💳 Paid Registration
    </label>
  </div>

  {formData.isPaid && (
    <div className="form-row" style={{ marginTop: '16px' }}>
      <div className="form-group">
        <label>
          Entry Fee per Player (₹) <span>*</span>
        </label>
        <input
          type="number"
          name="registrationFee"
          value={formData.registrationFee}
          onChange={handleInputChange}
          placeholder="e.g. 100"
          min="1"
        />
        <small style={{ color: 'var(--text-secondary-light)', marginTop: '4px', display: 'block' }}>
          Player pays Entry Fee + 2.5% convenience fee at checkout.
        </small>
      </div>

      <div className="form-group">
        <label>
          Organizer Payout UPI ID (GPay / PhonePe / Paytm)
        </label>
        <input
          type="text"
          name="payoutUpiId"
          value={formData.payoutUpiId}
          onChange={handleInputChange}
          placeholder="e.g. yourname@gpay"
        />
        <small style={{ color: 'var(--text-secondary-light)', marginTop: '4px', display: 'block' }}>
          Your tournament registration earnings will be sent here.
        </small>
      </div>
    </div>
  )}
</div>


{/* Information Box */}

<div className="info-box">

    <div className="info-icon">
        i
    </div>

    <div className="info-content">

        <h4>
            Please review the details before creating the tournament.
        </h4>

        <p>
            You can edit these details anytime from the tournament overview page.
        </p>

    </div>

</div>


{/* Bottom Buttons */}

<div className="button-section">

    <button onClick={() => navigate("/tournaments")}
        className="cancel-btn"
        type="button"
    >
        Cancel
    </button>

    <button
        onClick={handleInitiateCreate}
        className="create-btn"
        type="submit"
        disabled={loading}
    >
        {loading ? "Creating..." : "Create Tournament"}
    </button>

</div>






</div>
        </main>
      </div>
      {/* Payment Confirmation Modal */}
      {showPaymentModal && currentPlanInfo?.plan && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card">
            <div className="payment-modal-header">
              <h3>Auction Host Subscription Checkout</h3>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="payment-modal-body">
              <div className="tournament-summary-box">
                <span className="summary-label">Tournament:</span>
                <span className="summary-value">{formData.tournamentName || "Unnamed Tournament"}</span>
              </div>

              <div className="plan-summary-card">
                <div className="plan-row">
                  <span className="plan-title">{currentPlanInfo.plan.name}</span>
                  <span className="plan-teams">Up to {currentPlanInfo.plan.maxTeams} Teams</span>
                </div>
                <div className="plan-price-large">
                  ₹{currentPlanInfo.plan.price} <span>/ auction</span>
                </div>
                <div className="plan-breakdown">
                  Effective cost: ~₹{currentPlanInfo.plan.effectivePerTeam} per team
                </div>
              </div>

              <div className="checkout-perks">
                <div className="perk-item">
                  <FiCheckCircle className="perk-icon" /> Live Player Bidding & Auctioneer Console
                </div>
                <div className="perk-item">
                  <FiCheckCircle className="perk-icon" /> Instant Activation upon checkout
                </div>
                <div className="perk-item">
                  <FiShield className="perk-icon" /> 100% Secure Transaction
                </div>
              </div>
            </div>

            <div className="payment-modal-footer">
              <button
                className="cancel-pay-btn"
                onClick={() => setShowPaymentModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="confirm-pay-btn"
                onClick={handleCashfreeCheckout}
                disabled={loading}
              >
                {loading ? "Activating..." : `Pay ₹${currentPlanInfo.plan.price} via Cashfree`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
  <SuccessModal
    title="Tournament Created!"
    message="Tournament has been created successfully."
    onClose={() => {
      setShowSuccess(false);
      navigate("/tournaments");
    }}
  />
)}
    </div>
  );
};

export default CreateTournamentPage;