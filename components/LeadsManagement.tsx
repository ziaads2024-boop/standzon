"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, FileText, Image as ImageIcon, Download, Loader2 } from "lucide-react";

// Matches the ACTUAL `leads` table (supabase/migrations/001_initial_schema.sql +
// 005_add_lead_context_fields.sql), not a guessed shape. The previous version of this
// file used field names (event_name, budget_range) and lowercase status/priority values
// that don't exist in the live schema — every row silently rendered blank in half these
// columns, and status/priority filtering and badges never matched anything real.
interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  trade_show_name: string;
  event_date: string | null;
  venue: string | null;
  city: string;
  country: string;
  stand_size: number;
  budget: string;
  timeline: string;
  special_requests: string | null;
  lead_score: number;
  estimated_value: number | null;
  status: 'NEW' | 'ASSIGNED' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'LOST' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  source: string;
  source_details: string | null;
  targeted_builder_id: string | null;
  targeted_builder_name: string | null;
  is_general_inquiry: boolean;
  search_location_city: string | null;
  search_location_country: string | null;
  has_design_files: boolean;
  uploaded_files_count: number;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
}

interface LeadsManagementProps {
  adminId: string;
  permissions: string[];
}

const STATUS_OPTIONS: Lead['status'][] = ['NEW', 'ASSIGNED', 'CONTACTED', 'QUOTED', 'CONVERTED', 'LOST', 'CANCELLED'];
const PRIORITY_OPTIONS: Lead['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const selectTriggerClass = "rounded-none border-[#E4E6E8] bg-white text-[#252525] focus:ring-[#E03A3A]/30";
const selectContentClass = "rounded-none border-[#E4E6E8] bg-white text-[#252525]";
const selectItemClass = "text-[#252525] focus:bg-[#F5F6F7] focus:text-[#252525]";

export default function LeadsManagement({
  adminId,
  permissions,
}: LeadsManagementProps) {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const [loadingAttachment, setLoadingAttachment] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, searchTerm, statusFilter, priorityFilter, sourceFilter, countryFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.company_name?.toLowerCase().includes(term) ||
        lead.contact_name?.toLowerCase().includes(term) ||
        lead.contact_email?.toLowerCase().includes(term) ||
        lead.trade_show_name?.toLowerCase().includes(term) ||
        lead.city?.toLowerCase().includes(term) ||
        lead.country?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") filtered = filtered.filter(l => l.status === statusFilter);
    if (priorityFilter !== "all") filtered = filtered.filter(l => l.priority === priorityFilter);
    if (sourceFilter !== "all") filtered = filtered.filter(l => l.source === sourceFilter);
    if (countryFilter !== "all") filtered = filtered.filter(l => l.country === countryFilter);

    setFilteredLeads(filtered);
    setCurrentPage(1);
  };

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update lead');

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast({ title: "Success", description: `Lead status updated to ${newStatus}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update lead status", variant: "destructive" });
    }
  };

  const updateLeadPriority = async (leadId: string, newPriority: Lead['priority']) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority })
      });
      if (!response.ok) throw new Error('Failed to update lead');

      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, priority: newPriority } : l));
      toast({ title: "Success", description: `Lead priority updated to ${newPriority}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update lead priority", variant: "destructive" });
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete lead');

      setLeads(prev => prev.filter(l => l.id !== leadId));
      toast({ title: "Success", description: "Lead deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete lead", variant: "destructive" });
    }
  };

  const bulkUpdateStatus = async (status: Lead['status']) => {
    if (selectedLeads.size === 0) return;
    try {
      const response = await fetch('/api/admin/leads/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: Array.from(selectedLeads), status })
      });
      if (!response.ok) throw new Error('Failed to bulk update');

      setLeads(prev => prev.map(l =>
        selectedLeads.has(l.id) ? { ...l, status } : l
      ));
      setSelectedLeads(new Set());
      toast({ title: "Success", description: `Updated ${selectedLeads.size} leads` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to bulk update leads", variant: "destructive" });
    }
  };

  const exportToCSV = () => {
    const headers = ['Company', 'Contact', 'Email', 'Phone', 'Trade Show', 'City', 'Country', 'Status', 'Priority', 'Source', 'Files', 'Created'];
    const rows = filteredLeads.map(l => [
      l.company_name, l.contact_name, l.contact_email, l.contact_phone,
      l.trade_show_name, l.city, l.country, l.status, l.priority, l.source,
      l.attachments?.length || 0, l.created_at
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Exported", description: `${filteredLeads.length} leads exported to CSV` });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const toggleSelect = (leadId: string) => {
    const newSet = new Set(selectedLeads);
    if (newSet.has(leadId)) {
      newSet.delete(leadId);
    } else {
      newSet.add(leadId);
    }
    setSelectedLeads(newSet);
  };

  // Attachments live in a private Supabase Storage bucket — mint a short-lived signed
  // URL on demand rather than storing/exposing a permanent public link.
  const openAttachment = async (path: string) => {
    if (attachmentUrls[path]) {
      window.open(attachmentUrls[path], '_blank', 'noopener,noreferrer');
      return;
    }
    setLoadingAttachment(path);
    try {
      const res = await fetch(`/api/admin/leads/attachment-url?path=${encodeURIComponent(path)}`);
      const result = await res.json();
      if (!res.ok || !result?.success) throw new Error(result?.error || 'Could not open file');
      setAttachmentUrls(prev => ({ ...prev, [path]: result.url }));
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast({ title: "Error", description: "Could not open attachment", variant: "destructive" });
    } finally {
      setLoadingAttachment(null);
    }
  };

  const countries = [...new Set(leads.map(l => l.country).filter(Boolean))];
  const sources = [...new Set(leads.map(l => l.source).filter(Boolean))];

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  // Plain spans, not the shared <Badge> — its cva variants hardcode a background/text
  // color of their own (built for the dark admin theme), which fights these semantic
  // status colors via Tailwind class ordering rather than reliably losing to them.
  //
  // tailwind.config.ts deliberately collapses blue/purple/indigo/violet/pink/rose/
  // fuchsia/sky/cyan/orange/red into the single brand red, and gray/slate/navy into
  // ink — only red, amber and emerald render as genuinely distinct hues on this site.
  // Color-coding below leans on shade/weight within those three instead of hue variety.
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: "bg-[#F5F6F7] text-[#252525] border-[#E4E6E8]",
      ASSIGNED: "bg-amber-50 text-amber-700 border-amber-200",
      CONTACTED: "bg-amber-100 text-amber-800 border-amber-300",
      QUOTED: "bg-amber-200 text-amber-900 border-amber-300",
      CONVERTED: "bg-emerald-50 text-emerald-700 border-emerald-300",
      LOST: "bg-red-50 text-red-700 border-red-200",
      CANCELLED: "bg-[#F5F6F7] text-[#9A9B9C] border-[#E4E6E8]",
    };
    return <span className={`inline-block border px-2.5 py-0.5 text-xs font-semibold ${styles[status] || "bg-[#F5F6F7] text-[#9A9B9C] border-[#E4E6E8]"}`}>{status || 'NEW'}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      LOW: "bg-[#F5F6F7] text-[#9A9B9C] border-[#E4E6E8]",
      MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
      HIGH: "bg-amber-100 text-amber-800 border-amber-300",
      URGENT: "bg-red-50 text-red-700 border-red-200",
    };
    return <span className={`inline-block border px-2.5 py-0.5 text-xs font-semibold ${styles[priority] || "bg-[#F5F6F7] text-[#9A9B9C] border-[#E4E6E8]"}`}>{priority || 'MEDIUM'}</span>;
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    converted: leads.filter(l => l.status === 'CONVERTED').length,
    withFiles: leads.filter(l => (l.attachments?.length || 0) > 0).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E03A3A] mx-auto"></div>
          <p className="mt-4 text-[#5B5C5D]">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-[-0.02em] text-[#252525]">Leads Management</h1>
          <p className="text-[#5B5C5D]">Manage incoming leads and track conversion pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-none border-[#252525]/25 text-[#252525] hover:border-[#252525] hover:bg-transparent" onClick={exportToCSV}>
            Export CSV
          </Button>
          <Button className="rounded-none bg-[#252525] text-white hover:bg-[#E03A3A]" onClick={fetchLeads}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Leads', value: stats.total },
          { title: 'New Leads', value: stats.new },
          { title: 'Converted', value: stats.converted },
          { title: 'With Attachments', value: stats.withFiles },
        ].map((stat, idx) => (
          <Card key={idx} className="rounded-none border-[#E4E6E8]">
            <CardContent className="p-4">
              <p className="text-sm text-[#5B5C5D]">{stat.title}</p>
              <p className="text-2xl font-light text-[#252525]">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-none border-[#E4E6E8]">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 relative max-w-md">
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-none border-[#E4E6E8]"
              />
            </div>
            <div className="flex items-center gap-2">
              {selectedLeads.size > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-none border-[#252525]/25">
                      Bulk ({selectedLeads.size})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-none border-[#E4E6E8]">
                    <DropdownMenuItem onClick={() => bulkUpdateStatus('CONTACTED')}>Mark as Contacted</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus('QUOTED')}>Mark as Quoted</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus('CONVERTED')}>Mark as Converted</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdateStatus('LOST')}>Mark as Lost</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedLeads(new Set())}>Clear Selection</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="outline"
                className="rounded-none border-[#252525]/25"
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {(statusFilter !== 'all' || priorityFilter !== 'all' || sourceFilter !== 'all' || countryFilter !== 'all') && (
                  <span className="ml-2 inline-block bg-[#E03A3A]/10 px-2 py-0.5 text-xs font-semibold text-[#CC2E2E]">Active</span>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#E4E6E8]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`w-[160px] ${selectTriggerClass}`}><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="all" className={selectItemClass}>All Statuses</SelectItem>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className={selectItemClass}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className={`w-[160px] ${selectTriggerClass}`}><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="all" className={selectItemClass}>All Priorities</SelectItem>
                  {PRIORITY_OPTIONS.map(p => <SelectItem key={p} value={p} className={selectItemClass}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className={`w-[160px] ${selectTriggerClass}`}><SelectValue placeholder="Source" /></SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="all" className={selectItemClass}>All Sources</SelectItem>
                  {sources.map(s => <SelectItem key={s} value={s} className={selectItemClass}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className={`w-[160px] ${selectTriggerClass}`}><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="all" className={selectItemClass}>All Countries</SelectItem>
                  {countries.map(c => <SelectItem key={c} value={c} className={selectItemClass}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSourceFilter('all'); setCountryFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="border border-[#E4E6E8]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F5F6F7] hover:bg-[#F5F6F7]">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-[#252525]">Company</TableHead>
                  <TableHead className="font-semibold text-[#252525]">Contact</TableHead>
                  <TableHead className="font-semibold text-[#252525]">Trade Show</TableHead>
                  <TableHead className="font-semibold text-[#252525]">Location</TableHead>
                  <TableHead className="font-semibold text-[#252525]">Status</TableHead>
                  <TableHead className="font-semibold text-[#252525]">Priority</TableHead>
                  <TableHead className="font-semibold text-[#252525]">Source</TableHead>
                  <TableHead className="font-semibold text-[#252525]">Files</TableHead>
                  <TableHead className="font-semibold text-[#252525]">Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-[#9A9B9C]">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-[#F5F6F7]">
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.has(lead.id)}
                          onCheckedChange={() => toggleSelect(lead.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="text-[#252525]">{lead.company_name}</div>
                        <div className="text-xs text-[#9A9B9C]">{lead.budget}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[#252525]">{lead.contact_name}</div>
                        <div className="text-xs text-[#9A9B9C]">{lead.contact_email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[#252525]">{lead.trade_show_name}</div>
                        <div className="text-xs text-[#9A9B9C]">{lead.timeline}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[#252525]">{lead.city}</div>
                        <div className="text-xs text-[#9A9B9C]">{lead.country}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>{getPriorityBadge(lead.priority)}</TableCell>
                      <TableCell>
                        <span className="inline-block border border-[#E4E6E8] bg-[#F5F6F7] px-2 py-0.5 text-xs text-[#5B5C5D]">{lead.source}</span>
                      </TableCell>
                      <TableCell>
                        {lead.attachments && lead.attachments.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[#CC2E2E]">
                            <Paperclip className="h-3.5 w-3.5" /> {lead.attachments.length}
                          </span>
                        ) : (
                          <span className="text-[#D7D8D9]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-[#9A9B9C]">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-none p-0">⋮</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none border-[#E4E6E8]">
                            <DropdownMenuItem onClick={() => setSelectedLead(lead)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditMode(true); setEditForm(lead); setSelectedLead(lead); }}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            {STATUS_OPTIONS.filter(s => s !== 'NEW').map(s => (
                              <DropdownMenuItem key={s} onClick={() => updateLeadStatus(lead.id, s)}>{s}</DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                            {PRIORITY_OPTIONS.map(p => (
                              <DropdownMenuItem key={p} onClick={() => updateLeadPriority(lead.id, p)}>{p}</DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteLead(lead.id)} className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-[#9A9B9C]">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className={`w-[100px] ${selectTriggerClass}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="10" className={selectItemClass}>10 / page</SelectItem>
                  <SelectItem value="25" className={selectItemClass}>25 / page</SelectItem>
                  <SelectItem value="50" className={selectItemClass}>50 / page</SelectItem>
                  <SelectItem value="100" className={selectItemClass}>100 / page</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="rounded-none border-[#252525]/25" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                  ‹
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <Button key={pageNum} size="sm" className={`rounded-none ${currentPage === pageNum ? "bg-[#252525] text-white hover:bg-[#252525]" : "border-[#252525]/25 bg-white text-[#252525]"}`} variant={currentPage === pageNum ? "default" : "outline"} onClick={() => setCurrentPage(pageNum)}>
                      {pageNum}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" className="rounded-none border-[#252525]/25" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                  ›
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLead} onOpenChange={() => { setSelectedLead(null); setEditMode(false); setEditForm({}); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none border-[#E4E6E8]">
          <DialogHeader>
            <DialogTitle className="text-[#252525]">Lead Details</DialogTitle>
            <DialogDescription>
              {selectedLead?.company_name}
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4">
              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#5B5C5D]">Company Name</label>
                      <Input className="rounded-none border-[#E4E6E8]" value={editForm.company_name || ''} onChange={(e) => setEditForm({...editForm, company_name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#5B5C5D]">Contact Name</label>
                      <Input className="rounded-none border-[#E4E6E8]" value={editForm.contact_name || ''} onChange={(e) => setEditForm({...editForm, contact_name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#5B5C5D]">Email</label>
                      <Input className="rounded-none border-[#E4E6E8]" value={editForm.contact_email || ''} onChange={(e) => setEditForm({...editForm, contact_email: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#5B5C5D]">Phone</label>
                      <Input className="rounded-none border-[#E4E6E8]" value={editForm.contact_phone || ''} onChange={(e) => setEditForm({...editForm, contact_phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#5B5C5D]">Status</label>
                      <Select value={editForm.status} onValueChange={(v) => setEditForm({...editForm, status: v as Lead['status']})}>
                        <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContentClass}>
                          {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className={selectItemClass}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#5B5C5D]">Priority</label>
                      <Select value={editForm.priority} onValueChange={(v) => setEditForm({...editForm, priority: v as Lead['priority']})}>
                        <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                        <SelectContent className={selectContentClass}>
                          {PRIORITY_OPTIONS.map(p => <SelectItem key={p} value={p} className={selectItemClass}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#5B5C5D]">Special Requests</label>
                    <Textarea className="rounded-none border-[#E4E6E8]" value={editForm.special_requests || ''} onChange={(e) => setEditForm({...editForm, special_requests: e.target.value})} rows={3} />
                  </div>
                  <div className="flex gap-2">
                    <Button className="rounded-none bg-[#252525] text-white hover:bg-[#E03A3A]" onClick={async () => {
                      try {
                        const response = await fetch(`/api/admin/leads/${selectedLead.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editForm)
                        });
                        if (!response.ok) throw new Error('Failed to update');
                        setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, ...editForm } : l));
                        setEditMode(false);
                        toast({ title: 'Success', description: 'Lead updated successfully' });
                      } catch (error) {
                        toast({ title: 'Error', description: 'Failed to update lead', variant: 'destructive' });
                      }
                    }}>Save Changes</Button>
                    <Button variant="outline" className="rounded-none border-[#252525]/25" onClick={() => setEditMode(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Company</p>
                      <p className="font-medium text-[#252525]">{selectedLead.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Contact</p>
                      <p className="font-medium text-[#252525]">{selectedLead.contact_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Email</p>
                      <p className="font-medium text-[#252525]">{selectedLead.contact_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Phone</p>
                      <p className="font-medium text-[#252525]">{selectedLead.contact_phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Trade Show</p>
                      <p className="font-medium text-[#252525]">{selectedLead.trade_show_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Venue</p>
                      <p className="font-medium text-[#252525]">{selectedLead.venue || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Location</p>
                      <p className="font-medium text-[#252525]">{selectedLead.city}, {selectedLead.country}</p>
                    </div>
                    {(selectedLead.search_location_city || selectedLead.search_location_country) && (
                      <div>
                        <p className="text-sm text-[#9A9B9C]">Searching for builders in</p>
                        <p className="font-medium text-[#252525]">{[selectedLead.search_location_city, selectedLead.search_location_country].filter(Boolean).join(', ')}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Stand Size</p>
                      <p className="font-medium text-[#252525]">{selectedLead.stand_size ? `${selectedLead.stand_size} sq m` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Budget</p>
                      <p className="font-medium text-[#252525]">{selectedLead.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Timeline</p>
                      <p className="font-medium text-[#252525]">{selectedLead.timeline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Status</p>
                      {getStatusBadge(selectedLead.status)}
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Priority</p>
                      {getPriorityBadge(selectedLead.priority)}
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Source</p>
                      <p className="font-medium text-[#252525]">{selectedLead.source}{selectedLead.source_details ? ` — ${selectedLead.source_details}` : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Lead Type</p>
                      <p className="font-medium text-[#252525]">{selectedLead.is_general_inquiry ? 'General inquiry' : (selectedLead.targeted_builder_name || 'Builder-specific')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Estimated Value</p>
                      <p className="font-medium text-[#252525]">{selectedLead.estimated_value ? `$${selectedLead.estimated_value.toLocaleString()}` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Lead Score</p>
                      <p className="font-medium text-[#252525]">{selectedLead.lead_score ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Created</p>
                      <p className="font-medium text-[#252525]">{selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Updated</p>
                      <p className="font-medium text-[#252525]">{selectedLead.updated_at ? new Date(selectedLead.updated_at).toLocaleString() : '-'}</p>
                    </div>
                  </div>

                  {selectedLead.special_requests && (
                    <div>
                      <p className="text-sm text-[#9A9B9C]">Special Requests / Message</p>
                      <p className="mt-1 border border-[#E4E6E8] bg-[#F5F6F7] p-3 text-[#434444]">{selectedLead.special_requests}</p>
                    </div>
                  )}

                  {/* Files the person attached during submission — fetched via a short-lived
                      signed URL since the storage bucket is private. */}
                  <div>
                    <p className="mb-1 text-sm text-[#9A9B9C]">Attached Files {selectedLead.attachments?.length ? `(${selectedLead.attachments.length})` : ''}</p>
                    {selectedLead.attachments && selectedLead.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {selectedLead.attachments.map((path) => {
                          const name = path.split('/').pop() || path;
                          const isImage = /\.(jpe?g|png|gif|webp)$/i.test(name);
                          const loading = loadingAttachment === path;
                          return (
                            <button
                              key={path}
                              type="button"
                              onClick={() => openAttachment(path)}
                              disabled={loading}
                              className="flex w-full items-center justify-between border border-[#E4E6E8] bg-white p-3 text-left transition-colors hover:border-[#E03A3A]/40 hover:bg-[#F5F6F7] disabled:opacity-60"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                {isImage ? <ImageIcon className="h-4 w-4 shrink-0 text-[#5B5C5D]" /> : <FileText className="h-4 w-4 shrink-0 text-[#CC2E2E]" />}
                                <span className="truncate text-sm text-[#252525]">{name}</span>
                              </span>
                              {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#9A9B9C]" /> : <Download className="h-4 w-4 shrink-0 text-[#9A9B9C]" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="border border-dashed border-[#E4E6E8] bg-[#F5F6F7] p-3 text-sm text-[#9A9B9C]">
                        {selectedLead.has_design_files ? 'Marked as having design files, but none were saved with this request.' : 'No files attached.'}
                      </p>
                    )}
                  </div>

                  <Button variant="outline" className="w-full rounded-none border-[#252525]/25" onClick={() => setEditMode(true)}>
                    Edit Lead
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
