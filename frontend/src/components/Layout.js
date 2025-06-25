import { Children, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Menu } from "lucide-react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      <Sidebar isOpen={sidebarOpen} />

      <div className="content-area">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

export default Layout;
