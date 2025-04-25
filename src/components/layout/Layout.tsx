import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";  // Change from { Header } to just Header

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className={`min-h-screen ${sidebarOpen ? "block" : "hidden md:block"}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
