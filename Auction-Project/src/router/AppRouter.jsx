import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CreateTournamentPage from "../pages/tournaments/CreateTournamentPage";
import TournamentsListPage from "../pages/tournaments/TournamentsListPage";
import TournamentHubPage from "../pages/tournaments/TournamentHubPage";
import TeamDetailsPage from "../pages/tournaments/TeamDetailsPage";
import PlayerDetailsPage from "../pages/tournaments/PlayerDetailsPage";
import LiveAuctionPage from "../pages/auction/LiveAuctionPage";
import ProfilePage from "../pages/profile/ProfilePage";
import PublicRegistrationPage from "../pages/registration/PublicRegistrationPage.jsx";
import EditTournamentPage from "../pages/tournaments/EditTournamentPage";
import LandingPage from "../pages/landing/LandingPage";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/create-tournament" element={<CreateTournamentPage />} />
      <Route path="/tournaments" element={<TournamentsListPage />} />

      <Route path="/tournament-details/:tournamentId?" element={<TournamentHubPage />} />

      <Route path="/team-details" element={<TeamDetailsPage />} />

      <Route path="/live-auction" element={<LiveAuctionPage />} />

      <Route path="/player-details" element={<PlayerDetailsPage />} />

      <Route path="/settings" element={<ProfilePage />} />

      <Route path="/register/:tournamentId" element={<PublicRegistrationPage />} />

      <Route
    path="/edit-tournament"
    element={<EditTournamentPage />}
 />
       
      {/* Fallback redirect to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default AppRouter;
