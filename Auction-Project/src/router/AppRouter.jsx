import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CreateTournamentPage from "../pages/tournaments/CreateTournamentPage";
import TournamentsListPage from "../pages/tournaments/TournamentsListPage";
import TournamentHubPage from "../pages/tournaments/TournamentHubPage";
import TeamDetailsPage from "../pages/tournaments/TeamDetailsPage";

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/create-tournament" element={<CreateTournamentPage />} />
      <Route
        path="/tournaments"
        element={<TournamentsListPage />}
      />

      <Route
        path="/tournament-details"
        element={<TournamentHubPage />}
      />

      <Route
        path="/team-details"
        element={<TeamDetailsPage />}
      />
      {/* Redirect root to login as default entry point; authentication guards not yet implemented */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default AppRouter;