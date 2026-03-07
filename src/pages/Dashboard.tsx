import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { User, Users, MessageSquare, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import DashboardProfileEditor from '@/components/dashboard/DashboardProfileEditor';
import DashboardLeads from '@/components/dashboard/DashboardLeads';
import DashboardReviews from '@/components/dashboard/DashboardReviews';
import DashboardSettings from '@/components/dashboard/DashboardSettings';

type DashboardTab = 'profile' | 'leads' | 'reviews' | 'settings';

const NAV_ITEMS: { key: DashboardTab; icon: typeof User }[] = [
  { key: 'profile', icon: User },
  { key: 'leads', icon: Users },
  { key: 'reviews', icon: MessageSquare },
  { key: 'settings', icon: Settings },
];

const DashboardSidebar = ({ active, onSelect }: { active: DashboardTab; onSelect: (t: DashboardTab) => void }) => {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => onSelect(item.key)}
                    isActive={active === item.key}
                    tooltip={t(`dashboard.nav.${item.key}`)}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{t(`dashboard.nav.${item.key}`)}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const Dashboard = () => {
  const { loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('dashboard.loading')}</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-[calc(100vh-4rem)]">
        <DashboardSidebar active={activeTab} onSelect={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger className="mr-3" />
            <h1 className="font-display text-lg font-bold">{t('dashboard.title')}</h1>
          </header>
          <main className="flex-1 p-6 max-w-3xl">
            {activeTab === 'profile' && <DashboardProfileEditor />}
            {activeTab === 'leads' && <DashboardLeads />}
            {activeTab === 'reviews' && <DashboardReviews />}
            {activeTab === 'settings' && <DashboardSettings />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
