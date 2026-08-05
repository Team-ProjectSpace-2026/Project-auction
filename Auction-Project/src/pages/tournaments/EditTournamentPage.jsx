import Sidebar from "../../components/layout/Sidebar";
import SuccessModal from "../../components/common/SuccessModal";
import { FiMapPin, FiCalendar, FiUpload } from "react-icons/fi";
import "./EditTournment.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { updateTournament } from "../../services/tournamentService";
import { AUCTION_PRICING_PLANS } from "../../constants/pricing";
import { initiatePlanUpgrade, cancelHostingSubscription, loadCashfreeSDK, verifyPaymentSignature } from "../../services/paymentService";

const toISOWithOffset = (dtLocal) => {
  const d = new Date(dtLocal);
  if (isNaN(d)) return dtLocal;
  return d.toISOString();
};

const toLocalISO = (dateVal) => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const localNowISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const EditTournamentPage = () => {
    const location = useLocation();
    const tournament = location.state?.tournament;
    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(tournament?.logo || null);
    const fileInputRef = useRef(null);

    // Subscription & Upgrade State
    const upgradablePlans = AUCTION_PRICING_PLANS.filter(p => p.maxTeams > (tournament?.teams || 0));
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedTargetTeams, setSelectedTargetTeams] = useState(upgradablePlans[0]?.maxTeams || 30);
    const [upgrading, setUpgrading] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const currentPaidAmount = tournament?.hostingPayment?.amountPaid || 0;
    const targetPlanInfo = AUCTION_PRICING_PLANS.find(p => selectedTargetTeams <= p.maxTeams) || AUCTION_PRICING_PLANS[AUCTION_PRICING_PLANS.length - 1];
    const diffToPay = Math.max(0, targetPlanInfo.price - currentPaidAmount);

    const [formData, setFormData] = useState({
        tournamentName: tournament?.name || "",
        numTeams: tournament?.teams || "",
        budgetPerTeam: tournament?.budgetPerTeam || "",
        maxPlayersPerTeam: tournament?.maxPlayersPerTeam || "",
        playerBasePrice: tournament?.playerBasePrice || "",
        venue: tournament?.venue || "",
        auctionDateTime: toLocalISO(tournament?.date),
        isPaid: tournament?.isPaid || false,
        registrationFee: tournament?.registrationFee || "",
        payoutUpiId: tournament?.payoutUpiId || "",
    });
    const navigate = useNavigate();

    const handleUpgradeSubmit = async () => {
        if (!tournament?._id) return;
        if (selectedTargetTeams <= (tournament?.teams || 0)) {
            alert("Please select a higher team limit to upgrade your plan.");
            return;
        }
        setUpgrading(true);
        try {
            const res = await initiatePlanUpgrade({
                tournamentId: tournament._id,
                targetTeams: selectedTargetTeams
            });

            if (res.success && res.isFree) {
                alert("Plan upgraded successfully!");
                setShowUpgradeModal(false);
                navigate(`/tournament-details/${tournament._id}`);
                return;
            }

            if (res.success && res.paymentSessionId) {
                const cashfree = await loadCashfreeSDK(res.env);
                const checkoutOptions = {
                    paymentSessionId: res.paymentSessionId,
                    redirectTarget: "_modal"
                };
                const result = await cashfree.checkout(checkoutOptions);
                if (result && result.paymentDetails) {
                    const verifyRes = await verifyPaymentSignature(res.orderId, {
                        tournamentId: tournament._id,
                        isUpgrade: true,
                        numTeams: selectedTargetTeams,
                        newTeams: selectedTargetTeams,
                        type: 'tournament_hosting'
                    });
                    if (verifyRes.success) {
                        alert(`🎉 Upgraded successfully to ${selectedTargetTeams} Teams! Invoice sent to your email.`);
                        setShowUpgradeModal(false);
                        navigate(`/tournament-details/${tournament._id}`);
                    } else {
                        alert("Payment verification failed.");
                    }
                }
            }
        } catch (err) {
            console.error("Upgrade error:", err);
            alert(err.response?.data?.message || "Failed to initiate upgrade.");
        } finally {
            setUpgrading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!tournament?._id) return;
        const confirmMsg = currentPaidAmount > 0 
            ? `Are you sure you want to cancel your hosting subscription plan?\n\nA full refund of ₹${currentPaidAmount} will be initiated to your Cashfree payment method.`
            : `Are you sure you want to cancel your tournament hosting plan?`;

        if (!window.confirm(confirmMsg)) return;

        setCancelling(true);
        try {
            const res = await cancelHostingSubscription(tournament._id);
            if (res.success) {
                alert(`✅ Subscription cancelled successfully! Refund of ₹${res.refundAmount} initiated.`);
                navigate(`/tournament-details/${tournament._id}`);
            }
        } catch (err) {
            console.error("Cancellation error:", err);
            alert(err.response?.data?.message || "Failed to cancel subscription.");
        } finally {
            setCancelling(false);
        }
    };


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

    const handleSave = async () => {
        if (!tournament?._id) return;
        if (formData.isPaid && (!formData.registrationFee || Number(formData.registrationFee) <= 0)) {
            alert("Please enter a valid Registration Fee for a Paid tournament.");
            return;
        }
        setSaving(true);
        try {
            const payload = new FormData();
            payload.append("name", formData.tournamentName);
            payload.append("status", tournament.status || "Upcoming");
            payload.append("teams", Number(formData.numTeams));
            payload.append("budgetPerTeam", Number(formData.budgetPerTeam));
            payload.append("maxPlayersPerTeam", Number(formData.maxPlayersPerTeam));
            payload.append("playerBasePrice", Number(formData.playerBasePrice));
            payload.append("venue", formData.venue);
            payload.append("date", toISOWithOffset(formData.auctionDateTime));
            payload.append("isPaid", formData.isPaid);
            payload.append("registrationFee", formData.isPaid ? Number(formData.registrationFee) : 0);
            payload.append("payoutUpiId", formData.isPaid ? formData.payoutUpiId : "");
            if (logoFile) {
                payload.append("logo", logoFile);
            }
            await updateTournament(tournament._id, payload);
            setShowSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update tournament";
            const details = err.response?.data?.errors;
            const detailMsg = details ? details.map((e) => `${e.path || e.param || ""}: ${e.msg}`).join("\n") : "";
            alert(detailMsg ? `${msg}\n\n${detailMsg}` : msg);
        } finally {
            setSaving(false);
        }
    };
  return (
    <div className="create-page">
      {/* Sidebar */}
      <Sidebar activePage="tournaments" />

      {/* Main Container */}
      <div className="create-container">
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
            <h1>Edit Tournament</h1>

            <p>
              Enter tournament details to get started.
            </p>
          </div>

          {/* Main White Card */}
          <div className="create-card">

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
                placeholder="Enter number of teams"
            />
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

{/* Row 6: Subscription & Pack Management */}
<div style={{
  marginTop: '20px',
  marginBottom: '24px',
  padding: '20px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
  border: '1px solid rgba(245, 166, 35, 0.3)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
}}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
    <div>
      <h3 style={{ margin: 0, fontSize: '17px', color: '#f5a623', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🏏 Hosting Plan & Subscription
      </h3>
      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
        Current Plan: <strong style={{ color: '#fff' }}>{tournament?.teams || 4} Teams</strong>
        {tournament?.hostingPayment?.amountPaid ? ` · Paid ₹${tournament.hostingPayment.amountPaid}` : ''}
        {tournament?.hostingPayment?.status === 'CANCELLED' && <span style={{ color: '#ef4444', marginLeft: '8px', fontWeight: 'bold' }}>(CANCELLED & REFUNDED)</span>}
      </p>
    </div>
    
    <div style={{ display: 'flex', gap: '10px' }}>
      {tournament?.hostingPayment?.status !== 'CANCELLED' && (
        <>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f5a623 0%, #e67e22 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: '0 2px 10px rgba(245, 166, 35, 0.3)'
            }}
          >
            ⚡ Upgrade Plan
          </button>

          <button
            type="button"
            onClick={handleCancelSubscription}
            disabled={cancelling}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {cancelling ? 'Cancelling...' : '❌ Cancel Plan / Refund'}
          </button>
        </>
      )}
    </div>
  </div>

  <small style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>
    Bought the wrong plan? You can upgrade anytime by paying only the price difference, or cancel before auction starts to receive a full refund via Cashfree.
  </small>
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

    <button onClick={() => navigate(-1)}
        className="cancel-btn"
        type="button"
    >
        Cancel
    </button>

    <button onClick={handleSave}
        className="create-btn"
        type="submit"
        disabled={saving}
    >
        {saving ? "Saving..." : "Save Changes"}
    </button>

</div>






</div>
        </main>
      </div>
      {showSuccess && (
  <SuccessModal
    title="Tournament Updated!"
    message="Tournament details have been updated successfully."
    onClose={() => {
      setShowSuccess(false);
      navigate(`/tournament-details/${tournament._id}`);
    }}
  />
)}

{showUpgradeModal && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '16px'
  }}>
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px',
      maxWidth: '480px', width: '100%', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#f5a623' }}>⚡ Upgrade Hosting Plan</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>
        Select your new team count limit. You only pay the difference amount!
      </p>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#cbd5e1' }}>
          Select Target Team Limit:
        </label>
        <select
          value={selectedTargetTeams}
          onChange={(e) => setSelectedTargetTeams(Number(e.target.value))}
          style={{
            width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #475569',
            borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none'
          }}
        >
          {upgradablePlans.map(plan => (
            <option key={plan.planNumber} value={plan.maxTeams}>
              {plan.name} — Up to {plan.maxTeams} Teams (₹{plan.price})
            </option>
          ))}
        </select>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
          <span>Current Paid:</span>
          <span>₹{currentPaidAmount}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
          <span>New Plan Price ({targetPlanInfo.name}):</span>
          <span>₹{targetPlanInfo.price}</span>
        </div>
        <div style={{ borderTop: '1px dashed #334155', paddingTop: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', color: '#f5a623' }}>
          <span>Amount to Pay Now:</span>
          <span>₹{diffToPay}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => setShowUpgradeModal(false)}
          disabled={upgrading}
          style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpgradeSubmit}
          disabled={upgrading}
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #f5a623 0%, #e67e22 100%)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
        >
          {upgrading ? 'Initiating...' : diffToPay > 0 ? `Pay ₹${diffToPay} via Cashfree` : 'Confirm Free Upgrade'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default EditTournamentPage;