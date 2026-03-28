import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wrench, Star, Inbox } from 'lucide-react';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminListings from '@/components/admin/AdminListings';
import AdminTradesmanLeads from '@/components/admin/AdminTradesmanLeads';

const Admin = () => {
  const [stats, setStats] = useState({ users: 0, listings: 0, reviews: 0 });
  const [leadsRefreshKey, setLeadsRefreshKey] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, listingsRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tradesmen').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        users: usersRes.count ?? 0,
        listings: listingsRes.count ?? 0,
        reviews: reviewsRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const handleDemoted = useCallback(() => {
    setLeadsRefreshKey(k => k + 1);
  }, []);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.users}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.listings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.reviews}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads">
        <TabsList className="mb-4">
          <TabsTrigger value="leads" className="gap-1.5">
            <Inbox className="h-4 w-4" /> Scraped Leads
          </TabsTrigger>
          <TabsTrigger value="listings">Listing Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="leads">
          <AdminTradesmanLeads refreshKey={leadsRefreshKey} />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsers />
        </TabsContent>
        <TabsContent value="listings">
          <AdminListings onDemoted={handleDemoted} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
