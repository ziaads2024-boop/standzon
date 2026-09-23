import Link from 'next/link';
import { getFeaturedArticles, blogArticles, categories } from '@/lib/blog-data';
import { Eyebrow, Reveal, WordReveal } from '@/components/home-v2/motion';

export const metadata = {
  title: "Exhibition Industry Insights, Guides & Trade Show Intelligence | StandsZone",
  description: "Professional knowledge hub for exhibitors, brands, and event professionals. Expert guides on stand design, city insights, costs, trends, and contractor selection across 40+ countries.",
  keywords: "exhibition guides, trade show insights, stand design trends, exhibition costs, contractor selection, city guides, trade show planning",
  alternates: {
    canonical: "https://standszone.com/blog",
  },
};

const pad = (i: number) => String(i + 1).padStart(2, '0');
const h2 = "mt-6 text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.04em]";

export default function BlogPage() {
  const featuredArticles = getFeaturedArticles();
  const recentArticles = blogArticles.slice(0, 6);

  return (
    <main className="bg-white text-[#252525]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#141414] px-6 pb-16 pt-32 text-white md:px-10 md:pb-24 md:pt-44">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[560px] w-[560px] rounded-full bg-[#E03A3A]/25 blur-[140px]" />
        <div className="relative mx-auto max-w-[1400px]">
          <Eyebrow light>Insights</Eyebrow>
          <WordReveal as="h1" onLoad text="Exhibition industry insights & guides" className="mt-8 max-w-4xl text-[clamp(2.5rem,6vw,5.5rem)] font-light leading-[1] tracking-[-0.04em]" />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-white/70 md:text-lg">
              A knowledge hub for exhibitors, brands, and event professionals — stand design, city insights, costs and contractor selection.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Topics */}
      <section className="bg-[#F0EDE8] px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>Browse topics</Eyebrow>
          <div className="mt-10 grid border-t border-[#252525] sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, i) => (
              <Reveal key={category.slug} delay={Math.min(i, 4) * 0.04} y={16}>
                <div className="h-full border-b border-[#252525]/15 py-7 sm:pr-6">
                  <div className="text-xs font-semibold tabular-nums tracking-[0.2em] text-[#E03A3A]">{pad(i)}</div>
                  <h3 className="mt-4 text-xl font-light tracking-tight">{category.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#252525]/70">{category.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Essential guides */}
      <section className="bg-[#141414] px-6 py-16 text-white md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow light>Essential guides</Eyebrow>
          <WordReveal text="Start with the essentials" className={h2} />
          <div className="mt-12 grid gap-4 md:mt-16 md:gap-6 lg:grid-cols-3">
            {featuredArticles.map((article, i) => (
              <Reveal key={article.slug} delay={i * 0.06}>
                <Link href={`/blog/${article.slug}`} className="group flex h-full flex-col border border-white/15 bg-white/[0.03] p-7 transition-colors duration-500 hover:border-[#E03A3A] md:p-9">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em]">
                    <span className="text-[#EC6A6A]">{article.category}</span>
                    <span className="text-white/60">{pad(i)}</span>
                  </div>
                  <h3 className="mt-8 text-2xl font-light leading-tight tracking-tight md:text-3xl">{article.title}</h3>
                  <p className="mt-5 flex-1 text-sm leading-relaxed text-white/70">{article.excerpt}</p>
                  <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    <span>{article.readTime}</span>
                    <span className="transition-transform duration-500 group-hover:translate-x-1">Read →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="bg-white px-6 py-16 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Eyebrow>Latest insights</Eyebrow>
          <WordReveal text="Recent articles" className={h2} />
          <div className="mt-12 border-t border-[#252525] md:mt-16">
            {recentArticles.map((article, i) => (
              <Reveal key={article.slug} y={16} delay={Math.min(i, 4) * 0.04}>
                <Link href={`/blog/${article.slug}`} className="group grid gap-3 border-b border-[#252525]/10 py-7 transition-colors duration-500 hover:bg-[#F5F6F7] md:grid-cols-12 md:items-center md:gap-6">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E03A3A] md:col-span-2">{article.category}</div>
                  <h3 className="text-xl font-light tracking-tight md:col-span-6 md:text-2xl">{article.title}</h3>
                  <div className="text-sm text-[#252525]/65 md:col-span-3">
                    {article.readTime} · {new Date(article.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="hidden text-right transition-transform duration-500 group-hover:translate-x-1 md:col-span-1 md:block">→</div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="bg-[#F0EDE8] px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>City guides</Eyebrow>
            <nav className="mt-8 border-t border-[#252525]">
              {['cologne', 'berlin', 'hamburg', 'dubai', 'las-vegas'].map((city) => (
                <Link
                  key={city}
                  href={`/exhibition-stands/${city === 'dubai' ? 'united-arab-emirates/' : city === 'las-vegas' ? 'united-states/' : 'germany/'}${city}`}
                  className="group flex items-center justify-between border-b border-[#252525]/10 py-4 capitalize transition-colors hover:text-[#E03A3A]"
                >
                  {city.replace(/-/g, ' ')} exhibition stands
                  <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <Eyebrow>By country</Eyebrow>
            <nav className="mt-8 border-t border-[#252525]">
              {[
                { slug: 'germany', label: 'Germany' },
                { slug: 'united-states', label: 'United States' },
                { slug: 'united-arab-emirates', label: 'United Arab Emirates' },
                { slug: 'united-kingdom', label: 'United Kingdom' },
                { slug: 'france', label: 'France' },
              ].map((country) => (
                <Link
                  key={country.slug}
                  href={`/exhibition-stands/${country.slug}`}
                  className="group flex items-center justify-between border-b border-[#252525]/10 py-4 transition-colors hover:text-[#E03A3A]"
                >
                  {country.label} exhibition stands
                  <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#E03A3A] px-6 py-16 text-white md:px-10 md:py-28">
        <Reveal className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="max-w-[16ch] text-[clamp(2.25rem,5vw,4.5rem)] font-light leading-[1] tracking-[-0.04em]">Planning an exhibition?</h2>
            <p className="mt-5 max-w-xl text-white/90">Get free quotes from verified exhibition stand builders worldwide.</p>
          </div>
          <Link href="/quote" className="whitespace-nowrap bg-[#141414] px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-[#252525]">
            Get free quotes
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
