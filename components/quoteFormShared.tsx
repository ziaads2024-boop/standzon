import React from 'react';
import { Label } from '@/components/ui/label';

// The shared ui/input.tsx, ui/select.tsx and ui/textarea.tsx primitives default to a
// dark admin-dashboard theme (dark backgrounds, light text) — fine for the admin
// screens that use them, wrong for these public-facing forms. Override locally.
// Shared between PublicQuoteRequest.tsx (the modal), QuoteRequestContent.tsx (the
// standalone /quote page) and QuoteLocationFields.tsx (the country/city picker both
// of those embed) — kept in its own file so none of the three has to import another.
export const fieldClass =
  "mt-1 min-h-[44px] rounded-none border-[#E4E6E8] bg-white text-[#252525] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E03A3A]/30 focus-visible:ring-offset-0 focus-visible:border-[#E03A3A]";
export const selectContentClass = "rounded-none border-[#E4E6E8] bg-white text-[#252525]";
// ui/select.tsx's SelectItem hardcodes near-white text (built for the same dark
// admin theme as the other primitives) — invisible on the white SelectContent
// above until the dark hover/focus state kicks in. Override per item.
export const selectItemClass = "text-[#252525] focus:bg-[#F5F6F7] focus:text-[#252525] data-[state=checked]:text-[#CC2E2E]";

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B5C5D]">
      {children}
    </Label>
  );
}

export function StepHeading({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#E03A3A]/30 bg-[#E03A3A]/5 text-[#CC2E2E]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h3 className="text-[1.05rem] font-medium tracking-[-0.01em] text-[#252525]">{title}</h3>
        <p className="text-[13px] text-[#5B5C5D]">{subtitle}</p>
      </div>
    </div>
  );
}
