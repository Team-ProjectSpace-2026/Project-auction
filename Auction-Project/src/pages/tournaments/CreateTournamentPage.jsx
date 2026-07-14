import Sidebar from "../../components/layout/Sidebar";
import SuccessModal from "../../components/common/SuccessModal";
import { FiMapPin, FiCalendar, FiUpload } from "react-icons/fi";
import "./CreateTournamentPage.css";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { createTournament } from "../../services/tournamentService";
import bgStadium from "../../assets/bgstadium2.png";

// const MOCK_USER = {
//   name: "Rahul Organizer",
//   role: "Organizer",
// };

const CreateTournamentPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
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
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleCreate = async () => {
    const { tournamentName, numTeams, budgetPerTeam, maxPlayersPerTeam, playerBasePrice, venue, auctionDateTime } = formData;
    if (!tournamentName || !numTeams || !budgetPerTeam || !maxPlayersPerTeam || !playerBasePrice || !venue || !auctionDateTime) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("name", tournamentName);
      payload.append("status", "Upcoming");
      payload.append("date", auctionDateTime);
      payload.append("teams", Number(numTeams));
      payload.append("venue", venue);
      payload.append("budgetPerTeam", Number(budgetPerTeam));
      payload.append("maxPlayersPerTeam", Number(maxPlayersPerTeam));
      payload.append("playerBasePrice", Number(playerBasePrice));
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
        onClick={handleCreate}
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