import Sidebar from "../components/Sidebar";

export default function ChatLayout({ children }) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    );
  }