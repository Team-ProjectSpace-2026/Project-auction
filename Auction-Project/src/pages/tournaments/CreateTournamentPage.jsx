import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import { FiMapPin, FiCalendar } from "react-icons/fi";
import "./CreateTournamentPage.css";

const MOCK_USER = {
  name: "Rahul Organizer",
  role: "Organizer",
};

const CreateTournamentPage = () => {
  return (
    <div className="create-page">
      {/* Sidebar */}
      <Sidebar activePage="tournaments" />

      {/* Main Container */}
      <div className="create-container">
        {/* Top Navigation */}
        <TopBar user={MOCK_USER} />

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
          <div className="create-card">

    {/* Row 1 */}
    <div className="form-row">

        <div className="form-group">
            <label>
                Tournament Name <span>*</span>
            </label>

            <input
                type="text"
                placeholder="Enter tournament name"
            />
        </div>

        <div className="form-group">
            <label>
                Number of Teams <span>*</span>
            </label>

            <input
                type="number"
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
                placeholder="Enter budget per team"
            />
        </div>

        <div className="form-group">
            <label>
                Maximum Players Per Team <span>*</span>
            </label>

            <input
                type="number"
                placeholder="Enter maximum players per team"
            />
        </div>

    </div>


    {/* Row 3 */}

<div className="form-group full-width">

    <label>
        Venue <span>*</span>
    </label>

    <div className="input-icon">

       <span className="input-symbol">
    <FiMapPin />
</span>

        <input
            type="text"
            placeholder="Enter tournament venue"
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
            type="text"
            placeholder="Select auction date and time"
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

    <button
        className="cancel-btn"
        type="button"
    >
        Cancel
    </button>

    <button
        className="create-btn"
        type="submit"
    >
        Create Tournament
    </button>

</div>






</div>
        </main>
      </div>
    </div>
  );
};

export default CreateTournamentPage;