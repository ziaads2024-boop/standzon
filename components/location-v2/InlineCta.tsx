import PublicQuoteRequest from "@/components/PublicQuoteRequest";

/** Contextual conversion band dropped between sections, so a quote request is never far away. */
export default function InlineCta({
  eyebrow,
  heading,
  body,
  buttonText,
  location,
  countryCode,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  buttonText: string;
  location: string;
  countryCode?: string;
}) {
  return (
    <div className="mt-10 flex flex-col items-start justify-between gap-6 border border-[#E4E6E8] bg-[#F5F6F7] px-6 py-6 md:flex-row md:items-center md:px-9 md:py-7">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#CC2E2E]">{eyebrow}</div>
        <p className="mt-2 text-lg font-medium tracking-[-0.01em] text-[#252525]">{heading}</p>
        <p className="mt-1 text-sm text-[#5B5C5D]">{body}</p>
      </div>
      <PublicQuoteRequest
        location={location}
        countryCode={countryCode}
        buttonText={buttonText}
        className="h-auto w-full max-w-full shrink-0 whitespace-normal rounded-none border-0 bg-[#E03A3A] px-7 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#252525] md:w-auto"
      />
    </div>
  );
}
