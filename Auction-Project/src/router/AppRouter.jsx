import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import CricketLoader from "../components/common/CricketLoader";

// Lazy-loaded page components for fast initial load & code splitting
const LandingPage = lazy(() => import("../pages/landing/LandingPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const CreateTournamentPage = lazy(() => import("../pages/tournaments/CreateTournamentPage"));
const TournamentsListPage = lazy(() => import("../pages/tournaments/TournamentsListPage"));
const TournamentHubPage = lazy(() => import("../pages/tournaments/TournamentHubPage"));
const TeamDetailsPage = lazy(() => import("../pages/tournaments/TeamDetailsPage"));
const PlayerDetailsPage = lazy(() => import("../pages/tournaments/PlayerDetailsPage"));
const LiveAuctionPage = lazy(() => import("../pages/auction/LiveAuctionPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const PublicRegistrationPage = lazy(() => import("../pages/registration/PublicRegistrationPage.jsx"));
const EditTournamentPage = lazy(() => import("../pages/tournaments/EditTournamentPage"));

const AppRouter = () => (
  <Router>
    <Suspense fallback={<CricketLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
    </Suspense>
  </Router>
);

export default AppRouter;
