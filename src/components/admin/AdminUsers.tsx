import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Ban, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Profile {
  id: string;
  display_name: string | null;
  user_role: string;
  created_at: string;
  is_admin: boolean;
  is_blocked: boolean;
}

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data as unknown as Profile[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const toggleBlock = async (profile: Profile) => {
    const newBlocked = !profile.is_blocked;
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: newBlocked } as any)
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update user');
    } else {
      toast.success(newBlocked ? 'User blocked' : 'User unblocked');
      fetchProfiles();
    }
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete user: ' + error.message);
    } else {
      toast.success('User deleted');
      fetchProfiles();
    }
  };

  const filtered = profiles.filter(p =>
    (p.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
    p.user_role.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage all registered users.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading…</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.display_name || '—'}
                        {p.is_admin && (
                          <Badge variant="secondary" className="ml-2 gap-1">
                            <ShieldCheck className="h-3 w-3" /> Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{p.user_role}</Badge>
                      </TableCell>
                      <TableCell>
                        {p.is_blocked ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(p.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant={p.is_blocked ? 'outline' : 'ghost'}
                            size="sm"
                            onClick={() => toggleBlock(p)}
                            className={!p.is_blocked ? 'text-destructive hover:text-destructive' : ''}
                          >
                            <Ban className="mr-1 h-3.5 w-3.5" />
                            {p.is_blocked ? 'Unblock' : 'Block'}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the user profile. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(p.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
