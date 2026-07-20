import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavigation from '../components/common/MobileNavigation';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const closeMobileNavigation = useCallback(() => setMobileNavigationOpen(false), []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed((current) => !current)}
        />
      </div>

      <MobileNavigation open={mobileNavigationOpen} onClose={closeMobileNavigation} />

      <div className={`min-h-screen transition-[padding] duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <Topbar onOpenNavigation={() => setMobileNavigationOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
