'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Quote, Send, CheckCircle, Building, Calendar, DollarSign, Upload, X, FileText, Image as ImageIcon, Globe, MapPin } from 'lucide-react';
import { MaskLine, Tag, BannerBackdrop } from '@/components/location-v2/locMotion';
import { FieldLabel, StepHeading, fieldClass, selectContentClass, selectItemClass } from '@/components/quoteFormShared';
import { QuoteLocationFields } from '@/components/QuoteLocationFields';

// Full-page counterpart to the PublicQuoteRequest modal — same 4 steps, same fields,
// same submission target (/api/leads/submit) and the same real Supabase Storage upload
// for attachments, so every lead lands in the admin Leads table identically regardless
// of whether it came from a location-page popup or this standalone page. Kept as its
// own component (some duplication with PublicQuoteRequest) rather than sharing state via
// a hook, since the two live in very different shells (dialog vs. full page) and the
// modal is already wired into dozens of pages — safer not to refactor it mid-flight.

interface FormData {
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  exhibitionName: string;
  customExhibition: string;
  standSize: string;
  timeline: string;
  budget: string;
  message: string;
  hasDesign: boolean;
  confirmDetails: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  status: 'uploading' | 'done' | 'error';
  path?: string;
}

interface ExhibitionOption {
  id?: string;
  name: string;
  start_date?: string | null;
}

function exhibitionOptionLabel(exhibition: ExhibitionOption): string {
  if (!exhibition.start_date) return exhibition.name;
  const date = new Date(exhibition.start_date);
  if (Number.isNaN(date.getTime())) return exhibition.name;
  return `${exhibition.name} — ${new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(date)}`;
}

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Company', 'Exhibition', 'Budget', 'Files'];

export default function QuoteRequestContent() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [matchingBuildersCount, setMatchingBuildersCount] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [exhibitions, setExhibitions] = useState<ExhibitionOption[]>([]);
  const [exhibitionStatus, setExhibitionStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [formData, setFormData] = useState<FormData>({
    companyName: '', email: '', phone: '', country: '', city: '',
    exhibitionName: '', customExhibition: '', standSize: '', timeline: '', budget: '', message: '',
    hasDesign: false, confirmDetails: false,
  });

  useEffect(() => {
    return () => {
      uploadedFiles.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((previous) => {
      const next = { ...previous, [field]: value as any };
      if ((field === 'country' || field === 'city') && value !== previous[field]) {
        next.exhibitionName = '';
        next.customExhibition = '';
      }
      return next;
    });
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    try {
      const fd = new FormData();
      fd.append('file', uploadedFile.file);
      const res = await fetch('/api/leads/upload-attachment', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok || !result?.success) throw new Error(result?.error || 'Upload failed');
      setUploadedFiles((prev) => prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: 'done', path: result.data.path } : f)));
    } catch (error) {
      setUploadedFiles((prev) => prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: 'error' } : f)));
      toast({ title: 'Upload Failed', description: `${uploadedFile.file.name} could not be uploaded. Remove it and try again.`, variant: 'destructive' });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/zip'];
    const maxSize = 10 * 1024 * 1024;

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'Invalid File Type', description: `${file.name} is not supported. Upload PDF, JPG, PNG, or ZIP.`, variant: 'destructive' });
        return false;
      }
      if (file.size > maxSize) {
        toast({ title: 'File Too Large', description: `${file.name} exceeds 10MB.`, variant: 'destructive' });
        return false;
      }
      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'uploading',
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach(uploadFile);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const toRemove = prev.find((f) => f.id === fileId);
      if (toRemove?.preview) URL.revokeObjectURL(toRemove.preview);
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!(formData.companyName && formData.email && formData.country && formData.city);
      case 2:
        return formData.exhibitionName === 'Other Exhibition'
          ? !!formData.customExhibition.trim()
          : !!formData.exhibitionName;
      case 3:
        return true;
      case 4:
        if (formData.hasDesign && uploadedFiles.filter((f) => f.status === 'done').length === 0) return false;
        if (uploadedFiles.some((f) => f.status === 'uploading')) return false;
        return !!formData.confirmDetails;
      default:
        return false;
    }
  }, [currentStep, formData, uploadedFiles]);

  // Surfaced next to the Next/Submit button whenever it's disabled, so "why can't I
  // continue" has a visible answer instead of a silently inert button.
  const stepValidationHint = useMemo((): string | null => {
    if (isStepValid) return null;
    switch (currentStep) {
      case 1: {
        const missing = [
          !formData.companyName && 'company name',
          !formData.email && 'email',
          !formData.country && 'country',
          !formData.city && 'city',
        ].filter(Boolean);
        return `Enter your ${missing.join(', ')} to continue.`;
      }
      case 2:
        return 'Select an exhibition to continue.';
      case 4:
        if (uploadedFiles.some((f) => f.status === 'uploading')) return 'Wait for your file(s) to finish uploading.';
        if (formData.hasDesign && uploadedFiles.filter((f) => f.status === 'done').length === 0) return 'Upload at least one file, or untick "I have existing designs".';
        if (!formData.confirmDetails) return 'Confirm the details above to submit.';
        return null;
      default:
        return null;
    }
  }, [isStepValid, currentStep, formData, uploadedFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalExhibitionName = formData.exhibitionName === 'Other Exhibition' ? formData.customExhibition : formData.exhibitionName;
      const attachments = uploadedFiles.filter((f) => f.status === 'done' && f.path).map((f) => f.path as string);

      const leadData = {
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        countryName: formData.country,
        cityName: formData.city || undefined,
        exhibitionName: finalExhibitionName,
        standSize: formData.standSize,
        timeline: formData.timeline,
        budget: formData.budget,
        message: formData.message,
        hasDesign: formData.hasDesign,
        uploadedFilesCount: attachments.length,
        attachments,
        builderId: 'public_request',
        builderName: 'Multiple Builders',
        builderLocation: formData.city ? `${formData.city}, ${formData.country}` : formData.country,
        timestamp: new Date().toISOString(),
        source: 'website_quote_page',
        urgency: formData.timeline.includes('1-2 months') ? 'high' : formData.timeline.includes('3-6 months') ? 'medium' : 'low',
        leadScore: 80,
      };

      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit request');

      const matched = typeof result?.data?.matchingBuilders === 'number' ? result.data.matchingBuilders : null;
      setMatchingBuildersCount(matched);
      setIsSuccess(true);
      toast({ title: 'Quote Request Sent!', description: 'Verified builders matching your criteria will be in touch within 24 hours.', duration: 5000 });
    } catch (error) {
      toast({ title: 'Submission Failed', description: 'There was an error sending your request. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setExhibitions([]);
    if (!formData.country.trim() || !formData.city.trim()) {
      setExhibitionStatus('idle');
      return;
    }

    const controller = new AbortController();
    setExhibitionStatus('loading');
    const params = new URLSearchParams({ country: formData.country.trim(), city: formData.city.trim() });
    fetch(`/api/exhibitions?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload?.success) throw new Error(payload?.error || 'Failed to load exhibitions');
        return payload;
      })
      .then((data) => {
        setExhibitions(Array.isArray(data?.data) ? data.data : []);
        setExhibitionStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setExhibitionStatus('error');
      });
    return () => controller.abort();
  }, [formData.country, formData.city]);

  return (
    <div className="bg-white text-[#252525]">
      {/* ── Banner ── */}
      <section className="relative flex h-[46vh] min-h-[360px] flex-col justify-end bg-[#141414] text-white">
        <BannerBackdrop image={null} />
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-10 md:px-8 md:pb-14">
          <div className="mb-4 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#EC6A6A]">
            <span className="h-px w-10 bg-[#E03A3A]" />
            Free · No obligation · Verified builders worldwide
          </div>
          <h1 className="font-light leading-[0.95] tracking-[-0.045em]">
            <MaskLine onLoad delay={0.1} className="text-[clamp(1.1rem,3vw,2rem)] tracking-[-0.02em] text-white/85">
              Tell us about your stand.
            </MaskLine>
            <MaskLine onLoad delay={0.22} className="mt-1 text-[clamp(2.4rem,7vw,5rem)]">
              Get matched, free.
            </MaskLine>
          </h1>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="mx-auto max-w-2xl px-5 py-14 md:px-8 md:py-20">
        {isSuccess ? (
          <div className="border border-[#E4E6E8] bg-white p-8 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)]">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-[#E03A3A]/30 bg-[#E03A3A]/5">
              <CheckCircle className="h-7 w-7 text-[#E03A3A]" />
            </span>
            <h2 className="mb-2 text-[1.3rem] font-light tracking-[-0.02em] text-[#252525]">Request sent successfully</h2>
            <p className="mb-6 text-[15px] text-[#5B5C5D]">
              You can expect a quotation from {matchingBuildersCount ?? 'multiple'} builders matching your requirements.
            </p>
            <div className="mb-6 border border-[#E4E6E8] bg-[#F5F6F7] p-4 text-left">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#CC2E2E]">What happens next</h3>
              <ul className="space-y-1 text-sm text-[#434444]">
                <li>• Qualified builders will review your requirements</li>
                <li>• You&apos;ll receive detailed quotations within 24-48 hours</li>
                <li>• Compare proposals and choose the best fit</li>
                <li>• All quotes are completely free with no obligation</li>
              </ul>
            </div>
            <Link href="/">
              <Button className="w-full rounded-none bg-[#252525] text-white hover:bg-[#E03A3A]">Back to home</Button>
            </Link>
          </div>
        ) : (
          <div className="border border-[#E4E6E8] bg-white p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)] md:p-9">
            <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#CC2E2E]">
              <Quote className="h-4 w-4" />
              Get free exhibition stand quotes
            </div>

            <div className="mb-6">
              <div className="mb-2 hidden items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A9B9C] sm:flex">
                {STEP_LABELS.map((label, i) => (
                  <span key={label} className={i + 1 <= currentStep ? 'text-[#CC2E2E]' : undefined}>
                    {String(i + 1).padStart(2, '0')} {label}
                  </span>
                ))}
              </div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A9B9C] sm:hidden">
                <span className="text-[#CC2E2E]">Step {currentStep} of {TOTAL_STEPS}</span>
              </div>
              <div className="h-[3px] w-full bg-[#E4E6E8]">
                <div className="h-full bg-[#E03A3A] transition-all duration-300" style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <StepHeading icon={Building} title="Company information" subtitle="Tell us about your company and where you need builders" />

                  <QuoteLocationFields
                    country={formData.country}
                    city={formData.city}
                    onCountryChange={(v) => handleInputChange('country', v)}
                    onCityChange={(v) => handleInputChange('city', v)}
                    cityRequired
                  />

                  <div>
                    <FieldLabel htmlFor="companyName">Company name *</FieldLabel>
                    <Input id="companyName" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} placeholder="Your company name" required className={fieldClass} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="email">Email address *</FieldLabel>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="your@email.com" required className={fieldClass} />
                  </div>
                  <div>
                    <FieldLabel htmlFor="phone">Phone number (with country code)</FieldLabel>
                    <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+1 234 567 8900" className={fieldClass} />
                    <p className="mt-1 text-xs text-[#9A9B9C]">Include country code (e.g., +1, +971, +44)</p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <StepHeading icon={Calendar} title="Exhibition details" subtitle={formData.city ? `Future exhibitions in ${formData.city}` : 'Select a city first'} />

                  <div>
                    <FieldLabel htmlFor="exhibition">Exhibition *</FieldLabel>
                    <Select value={formData.exhibitionName} onValueChange={(v) => handleInputChange('exhibitionName', v)} disabled={!formData.city || exhibitionStatus === 'loading'}>
                      <SelectTrigger className={fieldClass}><SelectValue placeholder={exhibitionStatus === 'loading' ? 'Loading exhibitions…' : 'Select exhibition'} /></SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        {exhibitions.map((ex) => (
                          <SelectItem key={ex.id || `${ex.name}-${ex.start_date || ''}`} value={ex.name} className={selectItemClass}>{exhibitionOptionLabel(ex)}</SelectItem>
                        ))}
                        <SelectItem value="Other Exhibition" className={selectItemClass}>Other / not listed</SelectItem>
                      </SelectContent>
                    </Select>
                    {exhibitionStatus === 'ready' && exhibitions.length === 0 && (
                      <p className="mt-1.5 text-xs text-[#5B5C5D]">No future listed exhibitions were found for {formData.city}. Choose “Other / not listed” to enter one manually.</p>
                    )}
                    {exhibitionStatus === 'error' && (
                      <p className="mt-1.5 text-xs text-[#CC2E2E]">The exhibition calendar could not be loaded. You can still choose “Other / not listed”.</p>
                    )}
                  </div>

                  {formData.exhibitionName === 'Other Exhibition' && (
                    <div>
                      <FieldLabel htmlFor="customExhibition">Exhibition name *</FieldLabel>
                      <Input id="customExhibition" value={formData.customExhibition} onChange={(e) => handleInputChange('customExhibition', e.target.value)} placeholder="Enter exhibition name" required className={fieldClass} />
                    </div>
                  )}

                  <div>
                    <FieldLabel htmlFor="standSize">Stand size</FieldLabel>
                    <Select value={formData.standSize} onValueChange={(v) => handleInputChange('standSize', v)}>
                      <SelectTrigger className={fieldClass}><SelectValue placeholder="Select stand size" /></SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        <SelectItem value="Small (3x3m)" className={selectItemClass}>Small (3x3m)</SelectItem>
                        <SelectItem value="Medium (6x6m)" className={selectItemClass}>Medium (6x6m)</SelectItem>
                        <SelectItem value="Large (9x9m)" className={selectItemClass}>Large (9x9m)</SelectItem>
                        <SelectItem value="Extra Large (12x12m+)" className={selectItemClass}>Extra Large (12x12m+)</SelectItem>
                        <SelectItem value="Custom Size" className={selectItemClass}>Custom Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FieldLabel htmlFor="timeline">Timeline</FieldLabel>
                    <Select value={formData.timeline} onValueChange={(v) => handleInputChange('timeline', v)}>
                      <SelectTrigger className={fieldClass}><SelectValue placeholder="When do you need this?" /></SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        <SelectItem value="1-2 months" className={selectItemClass}>1-2 months</SelectItem>
                        <SelectItem value="3-6 months" className={selectItemClass}>3-6 months</SelectItem>
                        <SelectItem value="6+ months" className={selectItemClass}>6+ months</SelectItem>
                        <SelectItem value="Just exploring" className={selectItemClass}>Just exploring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <StepHeading icon={DollarSign} title="Budget & requirements" subtitle="Help us match you with the right builders" />

                  <div>
                    <FieldLabel htmlFor="budget">Budget range</FieldLabel>
                    <Select value={formData.budget} onValueChange={(v) => handleInputChange('budget', v)}>
                      <SelectTrigger className={fieldClass}><SelectValue placeholder="Select budget range" /></SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        <SelectItem value="$10,000 - $25,000" className={selectItemClass}>$10,000 - $25,000</SelectItem>
                        <SelectItem value="$25,000 - $50,000" className={selectItemClass}>$25,000 - $50,000</SelectItem>
                        <SelectItem value="$50,000 - $100,000" className={selectItemClass}>$50,000 - $100,000</SelectItem>
                        <SelectItem value="$100,000+" className={selectItemClass}>$100,000+</SelectItem>
                        <SelectItem value="To be discussed" className={selectItemClass}>To be discussed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FieldLabel htmlFor="message">Additional requirements</FieldLabel>
                    <Textarea id="message" value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} placeholder="Brief description of your needs, design preferences, or special requirements..." rows={3} className={`${fieldClass} min-h-[120px]`} />
                  </div>

                  {formData.country && (
                    <div className="border border-[#E4E6E8] bg-[#F5F6F7] p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#CC2E2E]" />
                        <span className="font-medium text-[#252525]">Builders in {formData.city ? `${formData.city}, ${formData.country}` : formData.country}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <StepHeading icon={Upload} title="Design files (optional)" subtitle="Upload your existing designs or reference materials" />

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 rounded-none border border-[#E4E6E8] bg-[#FFFEFE] p-3">
                      <input type="checkbox" id="hasDesign" checked={formData.hasDesign} onChange={(e) => handleInputChange('hasDesign', e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#E03A3A]" />
                      <label htmlFor="hasDesign" className="cursor-pointer text-[13px] font-medium leading-snug text-[#252525]">
                        I have existing designs or reference materials <span className="font-normal text-[#5B5C5D]">(tick to highlight — you can still upload below)</span>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-slate-300 bg-white p-6 text-center transition-colors hover:border-[#E03A3A] hover:bg-[#FFFEFE]">
                        <input type="file" id="fileUpload" multiple accept=".pdf,.jpg,.jpeg,.png,.zip" onChange={handleFileUpload} className="hidden" />
                        <label htmlFor="fileUpload" className="flex cursor-pointer flex-col items-center gap-1">
                          <span className="flex h-10 w-10 items-center justify-center rounded-none border border-[#E03A3A]/20 bg-[#E03A3A]/5">
                            <Upload className="h-5 w-5 text-[#E03A3A]" />
                          </span>
                          <p className="text-sm font-semibold text-[#252525]">Click to upload files or drag and drop</p>
                          <p className="text-xs font-medium text-[#5B5C5D]">PDF, JPG, PNG, ZIP up to 10MB each — saved with your request</p>
                          <span className="mt-2 inline-flex items-center gap-2 rounded-none border border-[#252525] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#252525]">Choose Files</span>
                        </label>
                      </div>

                      {uploadedFiles.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#CC2E2E]">Uploaded files ({uploadedFiles.length}) — visible to admin</p>
                          {uploadedFiles.map((uploadedFile) => (
                            <div key={uploadedFile.id} className="flex items-center justify-between border border-[#E4E6E8] bg-[#F5F6F7] p-3">
                              <div className="flex min-w-0 items-center gap-2">
                                {uploadedFile.file.type.startsWith('image/') ? (
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E4E6E8] bg-white text-[#5B5C5D]"><ImageIcon className="h-4 w-4" /></span>
                                ) : (
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E4E6E8] bg-white text-[#CC2E2E]"><FileText className="h-4 w-4" /></span>
                                )}
                                <div className="min-w-0">
                                  <p className="max-w-[200px] truncate text-sm font-medium text-[#252525]">{uploadedFile.file.name}</p>
                                  <p className="text-xs text-[#5B5C5D]">
                                    {(uploadedFile.file.size / 1024 / 1024).toFixed(1)}MB ·{' '}
                                    {uploadedFile.status === 'uploading' && <span className="text-[#9A9B9C]">Uploading…</span>}
                                    {uploadedFile.status === 'done' && <span className="text-[#1E7D3A]">Saved</span>}
                                    {uploadedFile.status === 'error' && <span className="text-[#CC2E2E]">Failed — remove and retry</span>}
                                  </p>
                                </div>
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(uploadedFile.id)} className="ml-2 shrink-0 rounded-none border border-transparent bg-white px-3 py-1.5 text-[#CC2E2E] hover:border-[#E4E6E8] hover:text-[#252525]">
                                <X className="mr-1 h-4 w-4" /> Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-xs font-medium uppercase tracking-[0.08em] text-[#9A9B9C]">No files yet — choose files above to see them here before submit</p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 border border-[#E4E6E8] bg-[#F5F6F7] p-4">
                      <input type="checkbox" id="confirmDetails" checked={formData.confirmDetails} onChange={(e) => handleInputChange('confirmDetails', e.target.checked)} className="mt-1 h-4 w-4 accent-[#E03A3A]" />
                      <label htmlFor="confirmDetails" className="text-[14px] text-[#434444]">I confirm the details provided are accurate and I&apos;m ready to submit my quote request.</label>
                    </div>
                  </div>
                </div>
              )}

              {stepValidationHint && (
                <p className="text-xs text-[#CC2E2E]" role="status">{stepValidationHint}</p>
              )}
              <div className="flex flex-col gap-3 border-t border-[#E4E6E8] pt-4 sm:flex-row">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))} className="min-h-[44px] w-full rounded-none border-[#252525]/25 text-[#252525] hover:border-[#252525] hover:bg-transparent hover:text-[#252525] sm:w-auto">
                    Previous
                  </Button>
                )}
                {currentStep < TOTAL_STEPS ? (
                  <Button type="button" onClick={() => isStepValid && setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1))} disabled={!isStepValid} className="min-h-[44px] w-full flex-1 rounded-none bg-[#252525] text-white hover:bg-[#E03A3A] sm:w-auto">
                    Next Step
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting || !isStepValid} className="min-h-[44px] w-full flex-1 rounded-none bg-[#252525] text-white hover:bg-[#E03A3A] sm:w-auto">
                    {isSubmitting ? 'Sending Request...' : (<><Send className="mr-2 h-4 w-4" />Send Quote Request</>)}
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-[#5B5C5D]">
          <Globe className="h-4 w-4" /> Free · no obligation · matched with verified builders worldwide
        </p>
      </section>
    </div>
  );
}
