import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

const TeamDetailsPage = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f6fb",
      }}
    >
      <Sidebar activePage="tournaments" />

      <div
        style={{
          marginLeft: "220px",
          flex: 1,
        }}
      >
        <TopBar
          user={{
            name: "Rahul Organizer",
            role: "Organizer",
          }}
        />

        <main
          style={{
            padding: "96px 32px 32px",
          }}
        >
          <h1>Team Details Page</h1>
          <p>Mangalore Warriors Squad</p>
        </main>
      </div>
    </div>
  );
};

export default TeamDetailsPage;