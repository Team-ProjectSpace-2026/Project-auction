import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
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
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/:tournamentId" element={<PublicRegistrationPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-tournament"
          element={
            <ProtectedRoute>
              <CreateTournamentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournaments"
          element={
            <ProtectedRoute>
              <TournamentsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament-details/:tournamentId?"
          element={
            <ProtectedRoute>
              <TournamentHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-details/:teamId?"
          element={
            <ProtectedRoute>
              <TeamDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-auction"
          element={
            <ProtectedRoute>
              <LiveAuctionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player-details/:playerId?"
          element={
            <ProtectedRoute>
              <PlayerDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-tournament"
          element={
            <ProtectedRoute>
              <EditTournamentPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
);

export default AppRouter;
