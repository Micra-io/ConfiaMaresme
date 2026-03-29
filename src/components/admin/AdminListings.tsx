import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search, EyeOff, Trash2, ArrowDownToLine, Loader2,
  CheckCircle2, HelpCircle, XCircle, Phone, MessageSquare,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TRADE_CATEGORIES, LANGUAGES } from '@/lib/constants';
import InlineEditCell from './InlineEditCell';
import { cn } from '@/lib/utils';

interface Tradesman {
  id: string;
  full_name: string;
  trade_category: string;
  location: string | null;
  bio: string | null;
  whatsapp_number: string | null;
  languages: string[];
  services: string[] | null;
  is_available: boolean;
  is_claimed: boolean;
  vetted_by_community: boolean;
  view_count: number;
  created_at: string;
  data_completeness_score: number;
  data_source: string;
  needs_review: boolean;
  admin_notes: string | null;
  whatsapp_reachable: string;
  whatsapp_checked_at: string | null;
  contact_method: string;
  alternate_contact: string | null;
  municipality: string | null;
}

const CONTACT_METHODS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'none', label: 'None' },
];

const SOURCE_STYLES: Record<string, string> = {
  manual: 'bg-muted text-muted-foreground border-border',
  scraped: 'bg-violet-500/10 text-violet-700 border-violet-200',
  bulk_import: 'bg-blue-500/10 text-blue-700 border-blue-200',
  onboarded: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
};

const getCompletenessColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

const getMissingFields = (l: Tradesman): string[] => {
  const missing: string[] = [];
  if (!l.full_name) missing.push('Name');
  if (!l.bio) missing.push('Bio');
  if (!l.location) missing.push('Location');
  if (!l.trade_category) missing.push('Trade category');
  if (!l.services?.length) missing.push('Services');
  if (!l.languages?.length) missing.push('Languages');
  if (!l.whatsapp_number) missing.push('WhatsApp number');
  return missing;
};

const WhatsAppIcon = ({ status, checkedAt }: { status: string; checkedAt: string | null }) => {
  const icons: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
    verified: { icon: CheckCircle2, className: 'text-emerald-600', label: 'Verified' },
    unknown: { icon: HelpCircle, className: 'text-muted-foreground', label: 'Unknown' },
    unreachable: { icon: XCircle, className: 'text-red-500', label: 'Unreachable' },
    phone_only: { icon: Phone, className: 'text-amber-600', label: 'Phone only' },
  };
  const config = icons[status] || icons.unknown;
  const Icon = config.icon;
  const checkedLabel = checkedAt
    ? `Last checked: ${new Date(checkedAt).toLocaleDateString()}`
    : 'Never checked';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Icon className={cn('h-4 w-4', config.className)} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">{config.label}</p>
        <p className="text-muted-foreground">{checkedLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const AdminListings = ({ onDemoted }: { onDemoted?: () => void }) => {
  const [listings, setListings] = useState<Tradesman[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [demotingId, setDemotingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tradesmen')
      .select('id, full_name, trade_category, location, bio, whatsapp_number, languages, services, is_available, is_claimed, vetted_by_community, view_count, created_at, data_completeness_score, data_source, needs_review, admin_notes, whatsapp_reachable, whatsapp_checked_at, contact_method, alternate_contact, municipality')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setListings(data as Tradesman[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const handleInlineSave = async (id: string, field: string, value: string | string[] | null) => {
    const { error } = await supabase
      .from('tradesmen')
      .update({ [field]: value } as any)
      .eq('id', id);

    if (error) {
      toast.error(`Failed to update ${field}`);
      throw error;
    }
    toast.success('Updated');
    // Optimistic update
    setListings(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

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

  const demoteToLead = async (listing: Tradesman) => {
    setDemotingId(listing.id);
    try {
      const { error: insertError } = await supabase
        .from('tradesman_leads')
        .insert({
          raw_name: listing.full_name,
          clean_name: listing.full_name,
          raw_phone: listing.whatsapp_number,
          raw_bio: listing.bio,
          clean_bio: listing.bio,
          raw_location: listing.location,
          clean_location: listing.location,
          raw_trade: listing.trade_category,
          raw_languages: listing.languages || [],
          source: 'demoted',
          status: 'pending',
          admin_notes: `Demoted from tradesmen directory on ${new Date().toLocaleDateString()}`,
        } as any);

      if (insertError) throw insertError;

      await supabase
        .from('tradesman_leads')
        .update({ status: 'pending', approved_tradesman_id: null } as any)
        .eq('approved_tradesman_id', listing.id);

      const { error: deleteError } = await supabase
        .from('tradesmen')
        .delete()
        .eq('id', listing.id);

      if (deleteError) throw deleteError;

      toast.success(`"${listing.full_name}" demoted back to leads for re-review`);
      fetchListings();
      onDemoted?.();
    } catch (err: any) {
      toast.error('Demotion failed: ' + err.message);
    } finally {
      setDemotingId(null);
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
    (l.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.municipality || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Card>
        <CardHeader>
          <CardTitle>Tradesman Listings</CardTitle>
          <CardDescription>Manage directory listings. Click any field to edit inline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, trade, location, or municipality…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Loading…</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-[60px]">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No listings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(l => {
                      const missing = getMissingFields(l);
                      const isExpanded = expandedId === l.id;

                      return (
                        <>
                          <TableRow key={l.id} className={cn(!l.is_available && 'opacity-50')}>
                            {/* NAME + BADGES */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {/* Completeness dot */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', getCompletenessColor(l.data_completeness_score))} />
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="text-xs max-w-[200px]">
                                    <p className="font-medium mb-1">Completeness: {l.data_completeness_score}%</p>
                                    {missing.length > 0 ? (
                                      <ul className="list-disc pl-3 space-y-0.5 text-muted-foreground">
                                        {missing.map(f => <li key={f}>{f}</li>)}
                                      </ul>
                                    ) : (
                                      <p className="text-emerald-600">All fields complete</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>

                                <span className="font-medium text-sm">{l.full_name}</span>
                              </div>

                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {l.is_claimed && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Claimed</Badge>
                                )}
                                {l.needs_review && (
                                  <Badge className="bg-amber-500/15 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0">
                                    Review
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className={cn('text-[10px] px-1.5 py-0', SOURCE_STYLES[l.data_source] || SOURCE_STYLES.manual)}
                                >
                                  {l.data_source}
                                </Badge>
                              </div>
                            </TableCell>

                            {/* TRADE - inline editable */}
                            <TableCell>
                              <InlineEditCell
                                value={l.trade_category}
                                field="trade_category"
                                mode="select"
                                options={TRADE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                                onSave={(f, v) => handleInlineSave(l.id, f, v)}
                              />
                            </TableCell>

                            {/* LOCATION - inline editable */}
                            <TableCell>
                              <InlineEditCell
                                value={l.location}
                                field="location"
                                mode="text"
                                onSave={(f, v) => handleInlineSave(l.id, f, v)}
                              />
                            </TableCell>

                            {/* WHATSAPP REACHABILITY */}
                            <TableCell>
                              <WhatsAppIcon status={l.whatsapp_reachable} checkedAt={l.whatsapp_checked_at} />
                            </TableCell>

                            {/* STATUS */}
                            <TableCell>
                              {l.is_available ? (
                                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Hidden</Badge>
                              )}
                            </TableCell>

                            {/* VIEWS */}
                            <TableCell className="text-muted-foreground text-sm">{l.view_count}</TableCell>

                            {/* ACTIONS */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => setExpandedId(isExpanded ? null : l.id)}
                                >
                                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toggleAvailability(l)}>
                                  <EyeOff className="h-3.5 w-3.5" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-amber-600 hover:text-amber-700" disabled={demotingId === l.id}>
                                      {demotingId === l.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowDownToLine className="h-3.5 w-3.5" />}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Demote to lead?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will remove "{l.full_name}" from the public directory and create a new lead for re-review.
                                        {l.is_claimed && ' Warning: this tradesman has claimed their profile — their account link will be broken.'}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => demoteToLead(l)} className="bg-amber-600 text-white hover:bg-amber-700">
                                        Demote to Lead
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive">
                                      <Trash2 className="h-3.5 w-3.5" />
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
                                      <AlertDialogAction onClick={() => deleteListing(l.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* EXPANDED DETAIL ROW */}
                          {isExpanded && (
                            <TableRow key={`${l.id}-detail`} className="bg-muted/30 hover:bg-muted/30">
                              <TableCell colSpan={7} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Bio</label>
                                    <InlineEditCell value={l.bio} field="bio" mode="textarea" onSave={(f, v) => handleInlineSave(l.id, f, v)} placeholder="No bio" />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Municipality</label>
                                    <InlineEditCell value={l.municipality} field="municipality" mode="text" onSave={(f, v) => handleInlineSave(l.id, f, v)} placeholder="Not set" />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Contact Method</label>
                                    <InlineEditCell value={l.contact_method} field="contact_method" mode="select" options={CONTACT_METHODS} onSave={(f, v) => handleInlineSave(l.id, f, v)} />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Alternate Contact</label>
                                    <InlineEditCell value={l.alternate_contact} field="alternate_contact" mode="text" onSave={(f, v) => handleInlineSave(l.id, f, v)} placeholder="None" />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Languages</label>
                                    <InlineEditCell value={l.languages} field="languages" mode="multi-select" options={LANGUAGES.map(lg => ({ value: lg.value, label: lg.label }))} onSave={(f, v) => handleInlineSave(l.id, f, v)} />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Services</label>
                                    <InlineEditCell value={l.services} field="services" mode="textarea" onSave={(f, v) => {
                                      // Convert comma-separated text back to array
                                      const arr = typeof v === 'string'
                                        ? v.split(',').map(s => s.trim()).filter(Boolean)
                                        : v;
                                      return handleInlineSave(l.id, f, arr);
                                    }} placeholder="No services" />
                                  </div>
                                  <div className="md:col-span-2 lg:col-span-3">
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Admin Notes</label>
                                    <InlineEditCell value={l.admin_notes} field="admin_notes" mode="textarea" onSave={(f, v) => handleInlineSave(l.id, f, v)} placeholder="No notes" />
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default AdminListings;
