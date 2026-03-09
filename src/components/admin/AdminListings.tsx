import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, EyeOff, Trash2 } from 'lucide-react';
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

interface Tradesman {
  id: string;
  full_name: string;
  trade_category: string;
  location: string | null;
  is_available: boolean;
  is_claimed: boolean;
  vetted_by_community: boolean;
  view_count: number;
  created_at: string;
}

const AdminListings = () => {
  const [listings, setListings] = useState<Tradesman[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tradesmen')
      .select('id, full_name, trade_category, location, is_available, is_claimed, vetted_by_community, view_count, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const toggleAvailability = async (listing: Tradesman) => {
    const { error } = await supabase
      .from('tradesmen')
      .update({ is_available: !listing.is_available })
      .eq('id', listing.id);

    if (error) {
      toast.error('Failed to update listing');
    } else {
      toast.success(listing.is_available ? 'Listing hidden' : 'Listing restored');
      fetchListings();
    }
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from('tradesmen').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete listing: ' + error.message);
    } else {
      toast.success('Listing deleted');
      fetchListings();
    }
  };

  const filtered = listings.filter(l =>
    l.full_name.toLowerCase().includes(search.toLowerCase()) ||
    l.trade_category.toLowerCase().includes(search.toLowerCase()) ||
    (l.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tradesman Listings</CardTitle>
        <CardDescription>Manage directory listings. Hide spam or delete fake profiles.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, trade, or location…"
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
                  <TableHead>Trade</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No listings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(l => (
                    <TableRow key={l.id} className={!l.is_available ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">
                        {l.full_name}
                        {l.is_claimed && (
                          <Badge variant="secondary" className="ml-2 text-xs">Claimed</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {l.trade_category.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{l.location || '—'}</TableCell>
                      <TableCell>
                        {l.is_available ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{l.view_count}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAvailability(l)}
                          >
                            <EyeOff className="mr-1 h-3.5 w-3.5" />
                            {l.is_available ? 'Hide' : 'Show'}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove "{l.full_name}" from the directory. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteListing(l.id)}
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

export default AdminListings;
