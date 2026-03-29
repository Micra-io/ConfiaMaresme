import { useState, useEffect, useMemo, Fragment } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, EyeOff, Trash2, ArrowDownToLine, Loader2,
  CheckCircle2, HelpCircle, XCircle, Phone, MessageSquare,
  ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown, X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TRADE_CATEGORIES, LANGUAGES } from '@/lib/constants';
import { MUNICIPALITY_OPTIONS } from '@/lib/maresme';
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

const REACHABILITY_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'verified', label: 'Verified' },
  { value: 'unreachable', label: 'Unreachable' },
  { value: 'phone_only', label: 'Phone Only' },
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
    unreachable: { icon: XCircle, className: 'text-destructive', label: 'Unreachable' },
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
        <span className="inline-flex"><Icon className={cn('h-4 w-4', config.className)} /></span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">{config.label}</p>
        <p className="text-muted-foreground">{checkedLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// ─── Filter chip component ──────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="h-8 text-xs w-auto min-w-[120px] gap-1">
      <span className="text-muted-foreground mr-0.5">{label}:</span>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map(o => (
        <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// ─── Bulk action bar ────────────────────────────────────────────────
const BulkActionBar = ({ count, onAction, loading }: {
  count: number;
  onAction: (action: string, value?: string) => void;
  loading: boolean;
}) => {
  const [bulkMunicipality, setBulkMunicipality] = useState('');
  const [bulkTrade, setBulkTrade] = useState('');
  const [bulkReachability, setBulkReachability] = useState('');

  return (
    <div className="flex items-center gap-2 flex-wrap rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 mb-3">
      <span className="text-sm font-medium text-primary shrink-0">
        {count} selected
      </span>
      <div className="h-4 w-px bg-border" />

      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={loading} onClick={() => onAction('mark_reviewed')}>
        Mark Reviewed
      </Button>

      <div className="flex items-center gap-1">
        <Select value={bulkMunicipality} onValueChange={setBulkMunicipality}>
          <SelectTrigger className="h-7 text-xs w-[140px]"><SelectValue placeholder="Municipality…" /></SelectTrigger>
          <SelectContent>{MUNICIPALITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
        </Select>
        {bulkMunicipality && (
          <Button size="sm" variant="outline" className="h-7 text-xs px-2" disabled={loading} onClick={() => { onAction('set_municipality', bulkMunicipality); setBulkMunicipality(''); }}>
            Apply
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Select value={bulkTrade} onValueChange={setBulkTrade}>
          <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue placeholder="Trade…" /></SelectTrigger>
          <SelectContent>{TRADE_CATEGORIES.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
        </Select>
        {bulkTrade && (
          <Button size="sm" variant="outline" className="h-7 text-xs px-2" disabled={loading} onClick={() => { onAction('set_trade', bulkTrade); setBulkTrade(''); }}>
            Apply
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Select value={bulkReachability} onValueChange={setBulkReachability}>
          <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue placeholder="Reachability…" /></SelectTrigger>
          <SelectContent>{REACHABILITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
        </Select>
        {bulkReachability && (
          <Button size="sm" variant="outline" className="h-7 text-xs px-2" disabled={loading} onClick={() => { onAction('set_reachability', bulkReachability); setBulkReachability(''); }}>
            Apply
          </Button>
        )}
      </div>

      <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => onAction('clear_selection')}>
        <X className="h-3 w-3 mr-1" /> Clear
      </Button>
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────
type SortDir = 'asc' | 'desc' | null;

const AdminListings = ({ onDemoted }: { onDemoted?: () => void }) => {
  const [listings, setListings] = useState<Tradesman[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [demotingId, setDemotingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filters
  const [filterCompleteness, setFilterCompleteness] = useState('all');
  const [filterReachability, setFilterReachability] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterReview, setFilterReview] = useState('all');
  const [filterMunicipality, setFilterMunicipality] = useState('all');

  // Sort
  const [sortScore, setSortScore] = useState<SortDir>(null);

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
    toast.success('Updated', { duration: 1500 });
    setListings(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const toggleAvailability = async (listing: Tradesman) => {
    const { error } = await supabase.from('tradesmen').update({ is_available: !listing.is_available }).eq('id', listing.id);
    if (error) toast.error('Failed to update listing');
    else { toast.success(listing.is_available ? 'Listing hidden' : 'Listing restored'); fetchListings(); }
  };

  const demoteToLead = async (listing: Tradesman) => {
    setDemotingId(listing.id);
    try {
      const { error: insertError } = await supabase.from('tradesman_leads').insert({
        raw_name: listing.full_name, clean_name: listing.full_name, raw_phone: listing.whatsapp_number,
        raw_bio: listing.bio, clean_bio: listing.bio, raw_location: listing.location,
        clean_location: listing.location, raw_trade: listing.trade_category,
        raw_languages: listing.languages || [], source: 'demoted', status: 'pending',
        admin_notes: `Demoted from tradesmen directory on ${new Date().toLocaleDateString()}`,
      } as any);
      if (insertError) throw insertError;
      await supabase.from('tradesman_leads').update({ status: 'pending', approved_tradesman_id: null } as any).eq('approved_tradesman_id', listing.id);
      const { error: deleteError } = await supabase.from('tradesmen').delete().eq('id', listing.id);
      if (deleteError) throw deleteError;
      toast.success(`"${listing.full_name}" demoted back to leads`);
      fetchListings();
      onDemoted?.();
    } catch (err: any) { toast.error('Demotion failed: ' + err.message); }
    finally { setDemotingId(null); }
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from('tradesmen').delete().eq('id', id);
    if (error) toast.error('Failed to delete: ' + error.message);
    else { toast.success('Listing deleted'); fetchListings(); }
  };

  // ─── Bulk actions ───────────────────────────────────────────────
  const handleBulkAction = async (action: string, value?: string) => {
    if (action === 'clear_selection') { setSelectedIds(new Set()); return; }

    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBulkLoading(true);

    try {
      let updatePayload: Record<string, any> = {};
      switch (action) {
        case 'mark_reviewed': updatePayload = { needs_review: false }; break;
        case 'set_municipality': updatePayload = { municipality: value }; break;
        case 'set_trade': updatePayload = { trade_category: value }; break;
        case 'set_reachability': updatePayload = { whatsapp_reachable: value }; break;
      }

      const { error } = await supabase.from('tradesmen').update(updatePayload as any).in('id', ids);
      if (error) throw error;

      toast.success(`Updated ${ids.length} listing(s)`);
      setSelectedIds(new Set());
      fetchListings();
    } catch (err: any) {
      toast.error('Bulk update failed: ' + err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // ─── Filtering + sorting ────────────────────────────────────────
  const processed = useMemo(() => {
    let result = listings.filter(l => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        l.full_name.toLowerCase().includes(q) ||
        l.trade_category.toLowerCase().includes(q) ||
        (l.location || '').toLowerCase().includes(q) ||
        (l.municipality || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (filterCompleteness !== 'all') {
        if (filterCompleteness === 'high' && l.data_completeness_score < 80) return false;
        if (filterCompleteness === 'medium' && (l.data_completeness_score < 50 || l.data_completeness_score >= 80)) return false;
        if (filterCompleteness === 'low' && l.data_completeness_score >= 50) return false;
      }
      if (filterReachability !== 'all' && l.whatsapp_reachable !== filterReachability) return false;
      if (filterSource !== 'all' && l.data_source !== filterSource) return false;
      if (filterReview === 'yes' && !l.needs_review) return false;
      if (filterReview === 'no' && l.needs_review) return false;
      if (filterMunicipality === '_unset' && l.municipality) return false;
      if (filterMunicipality !== 'all' && filterMunicipality !== '_unset' && l.municipality !== filterMunicipality) return false;

      return true;
    });

    if (sortScore) {
      result = [...result].sort((a, b) =>
        sortScore === 'asc'
          ? a.data_completeness_score - b.data_completeness_score
          : b.data_completeness_score - a.data_completeness_score
      );
    }

    return result;
  }, [listings, search, filterCompleteness, filterReachability, filterSource, filterReview, filterMunicipality, sortScore]);

  const allVisibleSelected = processed.length > 0 && processed.every(l => selectedIds.has(l.id));
  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processed.map(l => l.id)));
    }
  };

  const hasActiveFilters = filterCompleteness !== 'all' || filterReachability !== 'all' || filterSource !== 'all' || filterReview !== 'all' || filterMunicipality !== 'all';

  const clearFilters = () => {
    setFilterCompleteness('all');
    setFilterReachability('all');
    setFilterSource('all');
    setFilterReview('all');
    setFilterMunicipality('all');
  };

  const cycleSortScore = () => {
    setSortScore(prev => prev === null ? 'desc' : prev === 'desc' ? 'asc' : null);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Card>
        <CardHeader>
          <CardTitle>Tradesman Listings</CardTitle>
          <CardDescription>Manage directory listings. Click any field to edit inline.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, trade, location, or municipality…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Filter bar */}
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <FilterSelect label="Quality" value={filterCompleteness} onChange={setFilterCompleteness} options={[
              { value: 'all', label: 'All' }, { value: 'high', label: 'High (80+)' },
              { value: 'medium', label: 'Medium (50-79)' }, { value: 'low', label: 'Low (<50)' },
            ]} />
            <FilterSelect label="WhatsApp" value={filterReachability} onChange={setFilterReachability} options={[
              { value: 'all', label: 'All' }, ...REACHABILITY_OPTIONS,
            ]} />
            <FilterSelect label="Source" value={filterSource} onChange={setFilterSource} options={[
              { value: 'all', label: 'All' }, { value: 'manual', label: 'Manual' },
              { value: 'scraped', label: 'Scraped' }, { value: 'bulk_import', label: 'Bulk Import' },
              { value: 'onboarded', label: 'Onboarded' },
            ]} />
            <FilterSelect label="Review" value={filterReview} onChange={setFilterReview} options={[
              { value: 'all', label: 'All' }, { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
            ]} />
            <FilterSelect label="Municipality" value={filterMunicipality} onChange={setFilterMunicipality} options={[
              { value: 'all', label: 'All' }, { value: '_unset', label: 'Unset' },
              ...MUNICIPALITY_OPTIONS,
            ]} />
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" /> Clear filters
              </Button>
            )}
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <BulkActionBar count={selectedIds.size} onAction={handleBulkAction} loading={bulkLoading} />
          )}

          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Loading…</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox checked={allVisibleSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
                    </TableHead>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-[60px]">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={cycleSortScore}>
                      <div className="flex items-center gap-1">
                        Score
                        {sortScore === null && <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />}
                        {sortScore === 'desc' && <ArrowDown className="h-3 w-3" />}
                        {sortScore === 'asc' && <ArrowUp className="h-3 w-3" />}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processed.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                        No listings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    processed.map(l => {
                      const missing = getMissingFields(l);
                      const isExpanded = expandedId === l.id;
                      const isSelected = selectedIds.has(l.id);

                      return (
                        <Fragment key={l.id}>
                          <TableRow className={cn(!l.is_available && 'opacity-50', isSelected && 'bg-primary/5')}>
                            {/* Checkbox */}
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  const next = new Set(selectedIds);
                                  checked ? next.add(l.id) : next.delete(l.id);
                                  setSelectedIds(next);
                                }}
                              />
                            </TableCell>

                            {/* NAME + BADGES */}
                            <TableCell>
                              <div className="flex items-center gap-2">
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
                                {l.is_claimed && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Claimed</Badge>}
                                {l.needs_review && <Badge className="bg-amber-500/15 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0">Review</Badge>}
                                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', SOURCE_STYLES[l.data_source] || SOURCE_STYLES.manual)}>
                                  {l.data_source}
                                </Badge>
                              </div>
                            </TableCell>

                            {/* TRADE */}
                            <TableCell>
                              <InlineEditCell value={l.trade_category} field="trade_category" mode="select"
                                options={TRADE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                                onSave={(f, v) => handleInlineSave(l.id, f, v)} />
                            </TableCell>

                            {/* LOCATION */}
                            <TableCell>
                              <InlineEditCell value={l.location} field="location" mode="text"
                                onSave={(f, v) => handleInlineSave(l.id, f, v)} />
                            </TableCell>

                            {/* WHATSAPP */}
                            <TableCell>
                              <WhatsAppIcon status={l.whatsapp_reachable} checkedAt={l.whatsapp_checked_at} />
                            </TableCell>

                            {/* SCORE */}
                            <TableCell>
                              <span className="text-sm tabular-nums text-muted-foreground">{l.data_completeness_score}%</span>
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
                                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setExpandedId(isExpanded ? null : l.id)}>
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
                                        Remove "{l.full_name}" from the directory and create a new lead for re-review.
                                        {l.is_claimed && ' Warning: claimed profile — account link will break.'}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => demoteToLead(l)} className="bg-amber-600 text-white hover:bg-amber-700">Demote</AlertDialogAction>
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
                                      <AlertDialogDescription>Permanently remove "{l.full_name}". This cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteListing(l.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* EXPANDED DETAIL ROW */}
                          {isExpanded && (
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                              <TableCell colSpan={9} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Bio</label>
                                    <InlineEditCell value={l.bio} field="bio" mode="textarea" onSave={(f, v) => handleInlineSave(l.id, f, v)} placeholder="No bio" />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Municipality</label>
                                    <InlineEditCell value={l.municipality} field="municipality" mode="select" options={MUNICIPALITY_OPTIONS} onSave={(f, v) => handleInlineSave(l.id, f, v)} placeholder="Not set" />
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
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Services (comma-separated)</label>
                                    <InlineEditCell value={l.services} field="services" mode="comma-list" onSave={(f, v) => handleInlineSave(l.id, f, v)} placeholder="No services" />
                                  </div>
                                  <div className="md:col-span-2 lg:col-span-3">
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Admin Notes</label>
                                    <InlineEditCell value={l.admin_notes} field="admin_notes" mode="textarea" onSave={(f, v) => handleInlineSave(l.id, f, v)} placeholder="No notes" />
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
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
