import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Search, CheckCircle, XCircle, Eye, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Constants } from '@/integrations/supabase/types';

interface TradesmanLead {
  id: string;
  created_at: string;
  raw_name: string;
  raw_phone: string | null;
  raw_bio: string | null;
  raw_location: string | null;
  raw_trade: string | null;
  raw_languages: string[];
  source: string;
  clean_name: string | null;
  clean_bio: string | null;
  clean_location: string | null;
  status: string;
  admin_notes: string | null;
}

// Simple Cyrillic → Latin transliteration map
const cyrillicMap: Record<string, string> = {
  'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i',
  'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
  'у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y',
  'ь':'','э':'e','ю':'yu','я':'ya',
  'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh','З':'Z','И':'I',
  'Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T',
  'У':'U','Ф':'F','Х':'Kh','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Shch','Ъ':'','Ы':'Y',
  'Ь':'','Э':'E','Ю':'Yu','Я':'Ya',
};

function transliterate(text: string): string {
  return text.split('').map(c => cyrillicMap[c] ?? c).join('');
}

function hasNonLatin(text: string): boolean {
  return /[^\u0000-\u007F\u00C0-\u024F\s\-'.]/u.test(text);
}

const tradeCategories = Constants.public.Enums.trade_category;

const AdminTradesmanLeads = ({ refreshKey }: { refreshKey?: number }) => {
  const [leads, setLeads] = useState<TradesmanLead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [reviewLead, setReviewLead] = useState<TradesmanLead | null>(null);
  const [approving, setApproving] = useState(false);

  // Editable fields in review dialog
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editTrade, setEditTrade] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    let query = supabase
      .from('tradesman_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setLeads(data as unknown as TradesmanLead[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [statusFilter, refreshKey]);

  const openReview = (lead: TradesmanLead) => {
    setReviewLead(lead);
    // Auto-transliterate if non-latin characters detected
    const name = lead.clean_name || lead.raw_name;
    setEditName(hasNonLatin(name) ? transliterate(name) : name);
    const bio = lead.clean_bio || lead.raw_bio || '';
    setEditBio(hasNonLatin(bio) ? transliterate(bio) : bio);
    setEditLocation(lead.clean_location || lead.raw_location || '');
    setEditTrade(lead.raw_trade || 'other');
    setEditNotes(lead.admin_notes || '');
  };

  const handleApprove = async () => {
    if (!reviewLead) return;
    setApproving(true);

    try {
      // 1. Insert into production tradesmen table
      const { data: newTradesman, error: insertError } = await supabase
        .from('tradesmen')
        .insert({
          full_name: editName.trim(),
          bio: editBio.trim() || null,
          location: editLocation.trim() || null,
          trade_category: editTrade as any,
          whatsapp_number: reviewLead.raw_phone,
          languages: reviewLead.raw_languages.length > 0 ? reviewLead.raw_languages : ['es'],
          is_available: true,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // 2. Update the lead as approved
      const { error: updateError } = await supabase
        .from('tradesman_leads')
        .update({
          status: 'approved',
          clean_name: editName.trim(),
          clean_bio: editBio.trim() || null,
          clean_location: editLocation.trim() || null,
          admin_notes: editNotes.trim() || null,
          reviewed_at: new Date().toISOString(),
          approved_tradesman_id: newTradesman.id,
        } as any)
        .eq('id', reviewLead.id);

      if (updateError) throw updateError;

      toast.success(`"${editName}" approved and added to directory`);
      setReviewLead(null);
      fetchLeads();
    } catch (err: any) {
      toast.error('Approval failed: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('tradesman_leads')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) {
      toast.error('Failed to reject');
    } else {
      toast.success('Lead rejected');
      setReviewLead(null);
      fetchLeads();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tradesman_leads').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete: ' + error.message);
    } else {
      toast.success('Lead deleted');
      fetchLeads();
    }
  };

  const filtered = leads.filter(l =>
    l.raw_name.toLowerCase().includes(search.toLowerCase()) ||
    (l.raw_phone || '').includes(search) ||
    (l.raw_trade || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-700 border-amber-200',
    approved: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-500/15 text-red-700 border-red-200',
    duplicate: 'bg-slate-500/15 text-slate-700 border-slate-200',
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Scraped Tradesman Leads</CardTitle>
          <CardDescription>
            Review raw data from the WhatsApp bot. Clean names, transliterate, and approve to publish.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, trade…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Loading…</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Raw Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No leads found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(l => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">
                          {l.raw_name}
                          {hasNonLatin(l.raw_name) && (
                            <Badge variant="outline" className="ml-2 text-xs text-amber-600 border-amber-300">
                              Non-Latin
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{l.raw_phone || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {(l.raw_trade || 'unknown').replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{l.source}</TableCell>
                        <TableCell>
                          <Badge className={statusColor[l.status] || ''} variant="outline">
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {(l.status === 'pending' || l.status === 'rejected') && (
                              <Button variant="outline" size="sm" onClick={() => openReview(l)}>
                                <Eye className="mr-1 h-3.5 w-3.5" /> Review
                              </Button>
                            )}
                            {l.status === 'approved' && (
                              <Button variant="outline" size="sm" onClick={() => openReview(l)}>
                                <Eye className="mr-1 h-3.5 w-3.5" /> Re-review
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete lead?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Permanently remove "{l.raw_name}" from leads. This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(l.id)}
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

      {/* Review / Approve Dialog */}
      <Dialog open={!!reviewLead} onOpenChange={(open) => !open && setReviewLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Lead</DialogTitle>
            <DialogDescription>
              Clean up the data below and approve to add to the directory.
            </DialogDescription>
          </DialogHeader>

          {reviewLead && (
            <div className="space-y-4">
              {/* Show raw data */}
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p><span className="font-medium">Raw name:</span> {reviewLead.raw_name}</p>
                <p><span className="font-medium">Raw phone:</span> {reviewLead.raw_phone || '—'}</p>
                <p><span className="font-medium">Raw bio:</span> {reviewLead.raw_bio || '—'}</p>
                <p><span className="font-medium">Raw location:</span> {reviewLead.raw_location || '—'}</p>
                <p><span className="font-medium">Raw trade:</span> {reviewLead.raw_trade || '—'}</p>
                <p><span className="font-medium">Languages:</span> {reviewLead.raw_languages.join(', ') || '—'}</p>
              </div>

              {/* Editable clean fields */}
              <div className="space-y-3">
                <div>
                  <Label>Clean Name</Label>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} />
                  {hasNonLatin(reviewLead.raw_name) && (
                    <p className="text-xs text-amber-600 mt-1">Auto-transliterated from Cyrillic</p>
                  )}
                </div>
                <div>
                  <Label>Clean Bio</Label>
                  <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} />
                </div>
                <div>
                  <Label>Trade Category</Label>
                  <Select value={editTrade} onValueChange={setEditTrade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tradeCategories.map(cat => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Admin Notes</Label>
                  <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} placeholder="Internal notes…" />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={() => reviewLead && handleReject(reviewLead.id)}
              disabled={approving}
            >
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
            <Button onClick={handleApprove} disabled={approving || !editName.trim()}>
              {approving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />}
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTradesmanLeads;
