// src/App.jsx
// Temporary: renders DashboardPage directly until routing is set up
import AppRouter from './router/AppRouter';
import CricketBallCursor from './components/common/CricketBallCursor';
import './index.css';

function App() {
  return (
    <>
      <CricketBallCursor />
      <AppRouter />
    </>
  );
}

export default App;