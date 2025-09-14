import { Outlet } from "react-router-dom";
import Navbar from "./navbar";

function Layout() {
  return (
    <div>
      <Navbar />
      <main className="p-4">
        <Outlet /> {/* এখানে প্রতিটা page এর content render হবে */}
      </main>
    </div>
  );
}

export default Layout;
