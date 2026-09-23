"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eyebrow, Reveal, WordReveal } from "./motion";

const BUDGETS = ["$10k – $25k", "$25k – $50k", "$50k – $100k", "$100k+"];
const field =
  "w-full border-0 border-b border-[#252525]/20 bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-[#252525]/65 focus:border-[#E03A3A]";
const label = "block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#252525]/65";

export default function ContactV2({ initialContact }: { initialContact?: any }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState<any>(initialContact || null);
  const [f, setF] = useState({ name: "", email: "", event: "", budget: "", message: "", _hp: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (initialContact) return; // already have SSR data; only refetch if it was missing
    let on = true;
    fetch(`/api/admin/footer?ts=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => on && setContact(j?.data?.contact || null))
      .catch(() => {});
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const c = contact || {};
  const info = [
    { k: "Call", v: c.phone || "+1 (555) 123-4567", href: c.phoneLink },
    { k: "Email", v: c.email || "hello@standszone.com", href: c.emailLink },
    { k: "Visit", v: c.address || "123 Exhibition Ave, NYC", href: c.addressLink },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name,
          email: f.email,
          eventName: f.event,
          budget: f.budget,
          message: f.message,
          _hp: f._hp,
          source: "home-contact",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast({ title: "Request received", description: "We'll get back to you within 24 hours." });
      setF({ name: "", email: "", event: "", budget: "", message: "", _hp: "" });
    } catch {
      toast({ title: "Couldn't send your request", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="bg-[#F5F6F7] px-6 py-24 text-[#252525] md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-12 lg:pr-20">
        <div className="lg:col-span-5">
          <Eyebrow>Contact</Eyebrow>
          <WordReveal
            text="Let's create something extraordinary"
            className="mt-6 text-[clamp(2.25rem,4.6vw,4.25rem)] font-light leading-[1] tracking-[-0.04em]"
          />
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-[#252525]/80">
              Our global team is ready to help with technical specifications and local market insight.
            </p>
            <dl className="mt-14 space-y-8">
              {info.map((i) => (
                <div key={i.k} className="border-t border-[#252525]/15 pt-5">
                  <dt className={label}>{i.k}</dt>
                  <dd className="mt-2 text-xl font-light">
                    {i.href ? (
                      <a href={i.href} className="transition-colors hover:text-[#E03A3A]">
                        {i.v}
                      </a>
                    ) : (
                      i.v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-7" delay={0.1}>
          <form onSubmit={submit} className="grid gap-x-10 gap-y-9 bg-white p-8 md:grid-cols-2 md:p-14">
            <input type="text" name="_hp" tabIndex={-1} autoComplete="off" value={f._hp} onChange={set("_hp")} className="hidden" aria-hidden />
            <div>
              <label className={label} htmlFor="c-name">Full name</label>
              <input id="c-name" required value={f.name} onChange={set("name")} placeholder="John Doe" className={field} />
            </div>
            <div>
              <label className={label} htmlFor="c-email">Company email</label>
              <input id="c-email" type="email" required value={f.email} onChange={set("email")} placeholder="john@company.com" className={field} />
            </div>
            <div>
              <label className={label} htmlFor="c-event">Event name</label>
              <input id="c-event" value={f.event} onChange={set("event")} placeholder="e.g. Arab Health 2026" className={field} />
            </div>
            <div>
              <span className={label}>Budget</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setF((p) => ({ ...p, budget: b }))}
                    aria-pressed={f.budget === b}
                    className={`border px-3 py-2 text-xs transition-colors ${
                      f.budget === b ? "border-[#252525] bg-[#252525] text-white" : "border-[#252525]/20 hover:border-[#252525]"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="c-msg">Project brief</label>
              <textarea id="c-msg" rows={3} value={f.message} onChange={set("message")} placeholder="Tell us about your stand…" className={`${field} resize-none`} />
            </div>
            <div className="md:col-span-2">
              <button
                disabled={busy}
                className="group flex w-full items-center justify-between bg-[#E03A3A] px-8 py-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#252525] disabled:opacity-60"
              >
                {busy ? "Sending…" : "Request a consultation"}
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
