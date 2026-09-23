'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Quote, Send, CheckCircle, Users, Shield, Globe, MapPin, Star, ArrowRight, ArrowLeft, Building, Calendar, DollarSign, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { fieldClass, selectContentClass, selectItemClass, FieldLabel, StepHeading } from '@/components/quoteFormShared';
import { QuoteLocationFields, countryCodeFromName, resolveQuoteLocation } from '@/components/QuoteLocationFields';

export { fieldClass, selectContentClass, selectItemClass, FieldLabel, StepHeading };

interface PublicQuoteRequestProps {
  location?: string;
  countryCode?: string;
  cityName?: string;
  builderId?: string;
  className?: string;
  buttonText?: string;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
}

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
  uploadedFiles: File[];
}

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  status: 'uploading' | 'done' | 'error';
  path?: string; // Supabase Storage path once uploaded — this is what actually reaches admin
}

interface ExhibitionOption {
  id?: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  venue?: string | null;
}

function exhibitionOptionLabel(exhibition: ExhibitionOption): string {
  if (!exhibition.start_date) return exhibition.name;
  const date = new Date(exhibition.start_date);
  if (Number.isNaN(date.getTime())) return exhibition.name;
  return `${exhibition.name} — ${new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)}`;
}

export function PublicQuoteRequest({
  location,
  countryCode,
  cityName,
  builderId,
  className = '',
  buttonText = 'Get Free Quote',
  size = 'lg'
}: PublicQuoteRequestProps) {
  const pageLocation = useMemo(
    () => resolveQuoteLocation({ location, countryCode, cityName }),
    [location, countryCode, cityName],
  );
  const hasPageCountry = !!pageLocation.country;
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [matchingBuildersCount, setMatchingBuildersCount] = useState<number | null>(null);
  const [countryBuildersCount, setCountryBuildersCount] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    email: '',
    phone: '',
    country: pageLocation.country,
    city: pageLocation.city,
    exhibitionName: '',
    customExhibition: '',
    standSize: '',
    timeline: '',
    budget: '',
    message: '',
    hasDesign: false,
    confirmDetails: false,
    uploadedFiles: []
  });
  const { toast } = useToast();

  // Determine if we should use default styling or custom className
  const useCustomStyle = className && className.includes('bg-');
  const buttonClassName = useCustomStyle
    ? className
    : `rounded-none bg-[#252525] text-white transition-colors duration-300 hover:bg-[#E03A3A] ${className}`;

  const detectedCountryCode = countryCodeFromName(formData.country) || pageLocation.countryCode;

  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const countryAliases: Record<string, string[]> = {
    'united-states': ['united-states', 'usa', 'us', 'united-states-of-america', 'u-s-a'],
    'united-kingdom': ['united-kingdom', 'uk', 'u-k', 'great-britain', 'britain'],
    'united-arab-emirates': ['united-arab-emirates', 'uae', 'u-a-e', 'dubai', 'abu-dhabi'],
    'germany': ['germany', 'deutschland'],
    'france': ['france'],
    'spain': ['spain', 'españa', 'espana'],
    'italy': ['italy', 'italia'],
    'netherlands': ['netherlands', 'holland'],
    'switzerland': ['switzerland', 'schweiz', 'suisse', 'svizzera'],
    'qatar': ['qatar'],
    'saudi-arabia': ['saudi-arabia', 'ksa', 'kingdom-of-saudi-arabia'],
    'australia': ['australia'],
    'canada': ['canada'],
    'india': ['india', 'bharat'],
  };

  async function fetchCountryBuilderCount(preferredCountryName?: string): Promise<number | null> {
    try {
      // First try aggregated endpoint
      const countriesRes = await fetch('/api/admin/builders?action=countries');
      const countriesJson = await countriesRes.json();
      const targetName = (preferredCountryName || pageLocation.country || location || '').toString().trim();
      const wantedA = targetName.toLowerCase();
      const wantedB = normalize(targetName);
      const aliasList = countryAliases[wantedB] || [wantedB];
      if (countriesRes.ok && Array.isArray(countriesJson?.data)) {
        const found = countriesJson.data.find((c: any) => {
          const n = typeof c?.name === 'string' ? c.name : '';
          const nA = n.toLowerCase();
          const nB = normalize(n);
          return nA === wantedA || nB === wantedB || aliasList.includes(nB);
        });
        if (found && typeof found.builderCount === 'number') {
          return found.builderCount;
        }
      }

      // Fallback: fetch builders and count locally by country match
      const buildersRes = await fetch('/api/admin/builders?limit=1000&prioritize_real=true');
      const buildersJson = await buildersRes.json();
      const builders = buildersJson?.data?.builders || buildersJson?.builders || [];
      const count = builders.filter((b: any) => {
        const n = (b?.headquarters?.country || '').toString();
        const nb = normalize(n);
        return nb === wantedB || aliasList.includes(nb);
      }).length;
      return Number.isFinite(count) ? count : null;
    } catch {
      return null;
    }
  }
  
  const [exhibitions, setExhibitions] = useState<ExhibitionOption[]>([]);
  const [exhibitionStatus, setExhibitionStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    const countryName = formData.country.trim();
    const cityValue = formData.city.trim();
    setExhibitions([]);

    if (!countryName || !cityValue) {
      setExhibitionStatus('idle');
      return;
    }

    const controller = new AbortController();
    const fetchExhibitions = async () => {
      setExhibitionStatus('loading');
      try {
        const params = new URLSearchParams({ country: countryName, city: cityValue });
        const response = await fetch(`/api/exhibitions?${params.toString()}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || !payload?.success) throw new Error(payload?.error || 'Failed to load exhibitions');
        setExhibitions(Array.isArray(payload.data) ? payload.data : []);
        setExhibitionStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Error fetching exhibitions:', error);
        setExhibitionStatus('error');
      }
    };

    fetchExhibitions();
    return () => controller.abort();
  }, [formData.country, formData.city]);

  const totalSteps = 4; // Added file upload step

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((previous) => {
      const next = { ...previous, [field]: value };
      if ((field === 'country' || field === 'city') && value !== previous[field]) {
        next.exhibitionName = '';
        next.customExhibition = '';
      }
      return next;
    });
  };

  // Uploads straight to Supabase Storage (via /api/leads/upload-attachment) as soon as a
  // file is chosen — not deferred to submit — so a real, persistent storage path is ready
  // by the time the lead is submitted. The old flow only ever tracked a File object in
  // memory and sent a bare count to the API; nothing was actually saved anywhere durable,
  // so "attached" files never reached admin.
  const uploadFile = async (uploadedFile: UploadedFile) => {
    try {
      const fd = new FormData();
      fd.append('file', uploadedFile.file);
      const res = await fetch('/api/leads/upload-attachment', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok || !result?.success) throw new Error(result?.error || 'Upload failed');
      setUploadedFiles(prev => prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'done', path: result.data.path } : f));
    } catch (error) {
      console.error('❌ Attachment upload failed:', error);
      setUploadedFiles(prev => prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'error' } : f));
      toast({
        title: "Upload Failed",
        description: `${uploadedFile.file.name} could not be uploaded. You can remove it and try again.`,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/zip'];
    const maxSize = 10 * 1024 * 1024; // 10MB per file

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type. Please upload PDF, JPG, PNG, or ZIP files.`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Please upload files smaller than 10MB.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'uploading',
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(uploadFile);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      console.log('➡️ Moving to step', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      console.log('⬅️ Moving back to step', currentStep - 1);
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!(formData.companyName && formData.email && formData.country && formData.city);
      case 2:
        return formData.exhibitionName === 'Other Exhibition'
          ? !!formData.customExhibition.trim()
          : !!formData.exhibitionName;
      case 3:
        return true; // Optional fields
      case 4:
        // Require user confirmation on final step; if they indicate they have a design,
        // require at least one file uploaded. Block submit while any file is still
        // mid-upload so we never submit a lead whose attachment isn't saved yet.
        if (formData.hasDesign && uploadedFiles.filter(f => f.status === 'done').length === 0) return false;
        if (uploadedFiles.some(f => f.status === 'uploading')) return false;
        return !!formData.confirmDetails;
      default:
        return false;
    }
  };

  // Surfaced next to the Next/Submit button whenever it's disabled, so "why can't I
  // continue" has a visible answer instead of a silently inert button.
  const stepValidationHint = (): string | null => {
    if (isStepValid()) return null;
    switch (currentStep) {
      case 1: {
        const missing = [
          !formData.companyName && 'company name',
          !formData.email && 'email',
          !formData.city && 'city',
        ].filter(Boolean);
        return `Enter your ${missing.join(', ')} to continue.`;
      }
      case 2:
        return 'Select an exhibition to continue.';
      case 4:
        if (uploadedFiles.some(f => f.status === 'uploading')) return 'Wait for your file(s) to finish uploading.';
        if (formData.hasDesign && uploadedFiles.filter(f => f.status === 'done').length === 0) return 'Upload at least one file, or untick "I have existing designs".';
        if (!formData.confirmDetails) return 'Confirm the details above to submit.';
        return null;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('🚀 Submitting unified quote request...', formData);

      const finalExhibitionName = formData.exhibitionName === 'Other Exhibition'
        ? formData.customExhibition
        : formData.exhibitionName;

      const attachments = uploadedFiles.filter(f => f.status === 'done' && f.path).map(f => f.path as string);

      const leadData = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        exhibitionName: finalExhibitionName,
        standSize: formData.standSize,
        timeline: formData.timeline,
        budget: formData.budget,
        message: formData.message,
        hasDesign: formData.hasDesign,
        uploadedFilesCount: attachments.length,
        attachments,
        builderId: builderId || 'public_request',
        builderName: 'Multiple Builders',
        builderLocation: formData.city ? `${formData.city}, ${formData.country}` : (formData.country || location || cityName || 'Global'),
        countryName: formData.country,
        countryCode: detectedCountryCode,
        cityName: formData.city || cityName,
        timestamp: new Date().toISOString(),
        status: 'new',
        source: 'unified_quote_request',
        urgency: formData.timeline.includes('1-2 months') ? 'high' : 
                formData.timeline.includes('3-6 months') ? 'medium' : 'low',
        leadScore: 85
      };

      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request');
      }

      console.log('✅ Unified quote request submitted:', result);
      // Capture number of matching builders from API
      const matched = typeof result?.data?.matchingBuilders === 'number'
        ? result.data.matchingBuilders
        : (typeof result?.notificationsSent === 'number' ? result.notificationsSent : null);
      setMatchingBuildersCount(matched);

      // Also fetch country-level builder count to display full availability
      let countryCount: number | null = null;
      countryCount = await fetchCountryBuilderCount(formData.country);
      if (countryCount !== null) setCountryBuildersCount(countryCount);
      setIsSuccess(true);

      toast({
        title: "Quote Request Sent!",
        description: `You can expect quotations from ${countryCount ?? matched ?? 'multiple'} verified builders matching your criteria. They will contact you within 24 hours with competitive quotes.`,
        duration: 5000,
      });

    } catch (error) {
      console.error('❌ Error submitting quote request:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error sending your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    setUploadedFiles([]);
    setFormData({
      companyName: '',
      email: '',
      phone: '',
      country: pageLocation.country,
      city: pageLocation.city,
      exhibitionName: '',
      customExhibition: '',
      standSize: '',
      timeline: '',
      budget: '',
      message: '',
      hasDesign: false,
      confirmDetails: false,
      uploadedFiles: []
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(resetForm, 300); // Reset after dialog closes
  };

  // Clean up file previews on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          <Button 
            className={buttonClassName}
            size={size}
          >
            <Quote className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md rounded-none border border-[#E4E6E8] bg-white p-8 text-[#252525] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] sm:rounded-none">
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-[#E03A3A]/30 bg-[#E03A3A]/5">
              <CheckCircle className="w-7 h-7 text-[#E03A3A]" />
            </span>
            <h3 className="mb-2 text-[1.3rem] font-light tracking-[-0.02em] text-[#252525]">Request sent successfully</h3>
            <p className="mb-6 text-[15px] text-[#5B5C5D]">
              You can expect a quotation from {countryBuildersCount ?? matchingBuildersCount ?? 'multiple'} builders matching your requirements.
            </p>
            <div className="mb-6 border border-[#E4E6E8] bg-[#F5F6F7] p-4 text-left">
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#CC2E2E]">What happens next</h4>
              <ul className="space-y-1 text-sm text-[#434444]">
                <li>• Qualified builders will review your requirements</li>
                <li>• You'll receive detailed quotations within 24-48 hours</li>
                <li>• Compare proposals and choose the best fit</li>
                <li>• All quotes are completely free with no obligation</li>
              </ul>
            </div>
            <Button onClick={handleClose} className="w-full rounded-none bg-[#252525] text-white hover:bg-[#E03A3A]">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Prevent dialog from closing unless explicitly closed after submission
  const handleDialogOpenChange = (open: boolean) => {
    // Only allow closing the dialog if:
    // 1. User explicitly wants to open it (open === true)
    // 2. Form was successfully submitted (isSuccess === true)
    // 3. User is not currently submitting (isSubmitting === false)
    if (open) {
      console.log('🔓 Dialog opened');
      setIsOpen(true);
    } else if (isSuccess) {
      // Allow closing after success
      console.log('✅ Dialog closing after success');
      setIsOpen(false);
    } else if (!isSubmitting) {
      // Prevent accidental closes - user must use Cancel button
      console.log('⚠️ Dialog close prevented at step:', currentStep, '- Use Cancel button to close');
      toast({
        title: "Use Cancel Button",
        description: "To close this form, please use the Cancel button at the bottom.",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className={`${buttonClassName} touch-active no-tap-highlight`}
          size={size}
        >
          <Quote className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto rounded-none border border-[#E4E6E8] bg-white p-7 text-[#252525] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] backdrop-blur-0 sm:rounded-none"
        onInteractOutside={(e) => {
          // Prevent closing when clicking on Select dropdowns or other portaled elements
          const target = e.target as HTMLElement;
          const isSelectDropdown = target.closest('[role="listbox"]') || target.closest('[data-radix-select-viewport]');
          if (isSelectDropdown) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent accidental Escape key closes
          if (!isSuccess) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#CC2E2E]">
            <Quote className="h-4 w-4" />
            Get free exhibition stand quotes
          </div>
          <DialogTitle className="text-[1.4rem] font-light leading-tight tracking-[-0.02em] text-[#252525]">
            {location ? (cityName ? `${cityName}, ${location}` : location) : 'Find your builder'}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#5B5C5D]">
            Free · no obligation · matched with verified builders
          </DialogDescription>
        </DialogHeader>

        {/* Progress — numbered steps, not just a bar, so it reads as a short process */}
        <div className="mb-6 mt-2">
          <div className="mb-2 hidden items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A9B9C] sm:flex">
            {['Company', 'Exhibition', 'Budget', 'Files'].map((label, i) => (
              <span key={label} className={i + 1 <= currentStep ? 'text-[#CC2E2E]' : undefined}>
                {String(i + 1).padStart(2, '0')} {label}
              </span>
            ))}
          </div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A9B9C] sm:hidden">
            <span className="text-[#CC2E2E]">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="h-[3px] w-full bg-[#E4E6E8]">
            <div
              className="h-full bg-[#E03A3A] transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <StepHeading icon={Building} title="Company information" subtitle="Tell us about your company and where you need builders" />

              <QuoteLocationFields
                country={formData.country}
                city={formData.city}
                onCountryChange={(v) => handleInputChange('country', v)}
                onCityChange={(v) => handleInputChange('city', v)}
                hideCountry={hasPageCountry}
                cityRequired
              />

              <div>
                <FieldLabel htmlFor="companyName">Company name *</FieldLabel>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Your company name"
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <FieldLabel htmlFor="email">Email address *</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className={fieldClass}
                />
              </div>

              <div>
                <FieldLabel htmlFor="phone">Phone number (with country code) *</FieldLabel>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                  className={fieldClass}
                />
                <p className="mt-1 text-xs text-[#9A9B9C]">Include country code (e.g., +1, +971, +44)</p>
              </div>
            </div>
          )}

          {/* Step 2: Exhibition Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <StepHeading
                icon={Calendar}
                title="Exhibition details"
                subtitle={formData.city ? `Future exhibitions in ${formData.city}` : 'Select a city first'}
              />

              <div>
                <FieldLabel htmlFor="exhibition">Exhibition *</FieldLabel>
                <Select
                  value={formData.exhibitionName}
                  onValueChange={(value) => handleInputChange('exhibitionName', value)}
                  disabled={!formData.city || exhibitionStatus === 'loading'}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder={exhibitionStatus === 'loading' ? 'Loading exhibitions…' : 'Select exhibition'} />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {exhibitions.map((exhibition) => (
                      <SelectItem key={exhibition.id || `${exhibition.name}-${exhibition.start_date || ''}`} value={exhibition.name} className={selectItemClass}>
                        {exhibitionOptionLabel(exhibition)}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other Exhibition" className={selectItemClass}>Other / not listed</SelectItem>
                  </SelectContent>
                </Select>
                {exhibitionStatus === 'ready' && exhibitions.length === 0 && (
                  <p className="mt-1.5 text-xs text-[#5B5C5D]">
                    No future listed exhibitions were found for {formData.city}. Choose “Other / not listed” to enter one manually.
                  </p>
                )}
                {exhibitionStatus === 'error' && (
                  <p className="mt-1.5 text-xs text-[#CC2E2E]">
                    The exhibition calendar could not be loaded. You can still choose “Other / not listed”.
                  </p>
                )}
              </div>

              {formData.exhibitionName === 'Other Exhibition' && (
                <div>
                  <FieldLabel htmlFor="customExhibition">Exhibition name *</FieldLabel>
                  <Input
                    id="customExhibition"
                    value={formData.customExhibition}
                    onChange={(e) => handleInputChange('customExhibition', e.target.value)}
                    placeholder="Enter exhibition name"
                    required
                    className={fieldClass}
                  />
                </div>
              )}

              <div>
                <FieldLabel htmlFor="standSize">Stand size</FieldLabel>
                <Select
                  value={formData.standSize}
                  onValueChange={(value) => handleInputChange('standSize', value)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select stand size" />
                  </SelectTrigger>
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
                <Select
                  value={formData.timeline}
                  onValueChange={(value) => handleInputChange('timeline', value)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="When do you need this?" />
                  </SelectTrigger>
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

          {/* Step 3: Budget & Requirements */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <StepHeading icon={DollarSign} title="Budget & requirements" subtitle="Help us match you with the right builders" />

              <div>
                <FieldLabel htmlFor="budget">Budget range</FieldLabel>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => handleInputChange('budget', value)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
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
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Brief description of your needs, design preferences, or special requirements..."
                  rows={3}
                  className={`${fieldClass} min-h-[120px]`}
                />
              </div>

              {/* Location Context — reflects the Country/City the user picked on step 1,
                  not just the page's own context, since they can change it there. */}
              {formData.country && (
                <div className="border border-[#E4E6E8] bg-[#F5F6F7] p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#CC2E2E]" />
                    <span className="font-medium text-[#252525]">
                      Builders in {formData.city ? `${formData.city}, ${formData.country}` : formData.country}
                    </span>
                    <Badge className="rounded-none border border-[#E03A3A]/30 bg-[#E03A3A]/10 text-[#CC2E2E]">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Design Files Upload */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <StepHeading icon={Upload} title="Design files (optional)" subtitle="Upload your existing designs or reference materials" />

              <div className="space-y-4">
                <div className="flex items-start space-x-3 rounded-none border border-[#E4E6E8] bg-[#FFFEFE] p-3">
                  <input
                    type="checkbox"
                    id="hasDesign"
                    checked={formData.hasDesign}
                    onChange={(e) => handleInputChange('hasDesign', e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#E03A3A]"
                  />
                  <Label htmlFor="hasDesign" className="cursor-pointer text-[13px] font-medium leading-snug text-[#252525]">I have existing designs or reference materials <span className="font-normal text-[#5B5C5D]">(tick to highlight — you can still upload below)</span></Label>
                </div>

                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-300 bg-white p-6 text-center transition-colors hover:border-[#E03A3A] hover:bg-[#FFFEFE]">
                    <input
                      type="file"
                      id="fileUpload"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.zip"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Label htmlFor="fileUpload" className="flex cursor-pointer flex-col items-center gap-1">
                      <span className="flex h-10 w-10 items-center justify-center rounded-none border border-[#E03A3A]/20 bg-[#E03A3A]/5">
                        <Upload className="h-5 w-5 text-[#E03A3A]" />
                      </span>
                      <p className="text-sm font-semibold text-[#252525]">Click to upload files or drag and drop</p>
                      <p className="text-xs font-medium text-[#5B5C5D]">PDF, JPG, PNG, ZIP up to 10MB each — saved with your request</p>
                      <span className="mt-2 inline-flex items-center gap-2 rounded-none border border-[#252525] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#252525]">Choose Files</span>
                    </Label>
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadedFile.id)}
                            className="ml-2 shrink-0 rounded-none border border-transparent bg-white px-3 py-1.5 text-[#CC2E2E] hover:border-[#E4E6E8] hover:text-[#252525]"
                          >
                            <X className="mr-1 h-4 w-4" /> Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-xs font-medium uppercase tracking-[0.08em] text-[#9A9B9C]">No files yet — choose files above to see them here before submit</p>
                  )}
                </div>

                {/* Required confirmation before submission */}
                <div className="flex items-start gap-3 border border-[#E4E6E8] bg-[#F5F6F7] p-4">
                  <input
                    type="checkbox"
                    id="confirmDetails"
                    checked={formData.confirmDetails}
                    onChange={(e) => handleInputChange('confirmDetails', e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#E03A3A]"
                  />
                  <Label htmlFor="confirmDetails" className="text-[14px] text-[#434444]">
                    I confirm the details provided are accurate and I'm ready to submit my quote request.
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {stepValidationHint() && (
            <p className="text-xs text-[#CC2E2E]" role="status">{stepValidationHint()}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E4E6E8]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="min-h-[44px] w-full rounded-none border-[#252525]/25 text-[#252525] hover:border-[#252525] hover:bg-transparent hover:text-[#252525] sm:w-auto"
            >
              Cancel
            </Button>

            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="flex min-h-[44px] w-full items-center gap-2 rounded-none border-[#252525]/25 text-[#252525] hover:border-[#252525] hover:bg-transparent hover:text-[#252525] sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className="min-h-[44px] w-full flex-1 rounded-none bg-[#252525] text-white hover:bg-[#E03A3A] sm:w-auto"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !isStepValid()}
                className="min-h-[44px] w-full flex-1 rounded-none bg-[#252525] text-white hover:bg-[#E03A3A] sm:w-auto"
              >
                {isSubmitting ? (
                  'Sending Request...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Quote Request
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PublicQuoteRequest;
