import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User, Users, MessageSquare, Settings, Eye } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import DashboardProfileEditor from '@/components/dashboard/DashboardProfileEditor';
import ProfileCompleteness from '@/components/dashboard/ProfileCompleteness';
import DashboardLeads from '@/components/dashboard/DashboardLeads';
import DashboardReviews from '@/components/dashboard/DashboardReviews';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import ResidentDashboard from '@/components/dashboard/ResidentDashboard';

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
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');

  // Check if user has a tradesman profile
  const { data: tradesmanProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-tradesman-check', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tradesmen')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t('dashboard.loading')}</p>
      </div>
    );
  }

  // If user has no tradesman profile, show the resident dashboard
  if (!tradesmanProfile) {
    return <ResidentDashboard />;
  }

  // Tradesman dashboard with sidebar
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-[calc(100vh-4rem)]">
        <DashboardSidebar active={activeTab} onSelect={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4">
            <SidebarTrigger className="mr-3" />
            <h1 className="font-display text-xl font-bold">{t('dashboard.title')}</h1>
            {tradesmanProfile.view_count > 0 && (
              <div className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {t('dashboard.profileViews', { count: tradesmanProfile.view_count })}
              </div>
            )}
          </header>
          <main className="flex-1 p-4 sm:p-6 max-w-3xl w-full space-y-6">
            {activeTab === 'profile' && (
              <>
                <ProfileCompleteness profile={tradesmanProfile as any} />
                <DashboardProfileEditor />
              </>
            )}
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
