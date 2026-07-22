import Sidebar from "../../components/layout/Sidebar";
import SuccessModal from "../../components/common/SuccessModal";
import { FiMapPin, FiCalendar, FiUpload } from "react-icons/fi";
import "./EditTournment.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { updateTournament } from "../../services/tournamentService";

const EditTournamentPage = () => {
    const location = useLocation();
    const tournament = location.state?.tournament;
    const [showSuccess, setShowSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(tournament?.logo || null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        tournamentName: tournament?.name || "",
        numTeams: tournament?.teams || "",
        budgetPerTeam: tournament?.budgetPerTeam || "",
        maxPlayersPerTeam: tournament?.maxPlayersPerTeam || "",
        playerBasePrice: tournament?.playerBasePrice || "",
        venue: tournament?.venue || "",
        auctionDateTime: tournament?.date ? new Date(tournament.date).toISOString().slice(0, 16) : "",
        isPaid: tournament?.isPaid || false,
        registrationFee: tournament?.registrationFee || "",
        payoutUpiId: tournament?.payoutUpiId || "",
    });
    const navigate = useNavigate();

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
            payload.append("date", formData.auctionDateTime);
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
        name="isPaidRadioEdit"
        checked={!formData.isPaid}
        onChange={() => setFormData(prev => ({ ...prev, isPaid: false }))}
      />
      🎉 Free Registration
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
      <input
        type="radio"
        name="isPaidRadioEdit"
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
      navigate("/tournament-details");
    }}
  />
)}
    </div>
  );
};

export default EditTournamentPage;