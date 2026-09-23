import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleBySlug, getAllSlugs, blogArticles } from '@/lib/blog-data';
import { Eyebrow, Reveal } from '@/components/home-v2/motion';

export async function generateStaticParams() {
    return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        return {
            title: 'Article Not Found',
        };
    }

    return {
        title: `${article.title} | StandsZone Insights`,
        description: article.metaDescription || article.excerpt,
        keywords: article.tags.join(', '),
        alternates: {
            canonical: `https://standszone.com/blog/${article.slug}`,
        },
        openGraph: {
            title: article.title,
            description: article.metaDescription || article.excerpt,
            type: 'article',
            publishedTime: article.date,
            modifiedTime: article.lastUpdated || article.date,
            authors: [article.author],
            tags: article.tags,
        }
    };
}

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const label = "text-[10px] font-semibold uppercase tracking-[0.25em] text-[#252525]/65";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    const relatedArticles = blogArticles
        .filter(a => a.category === article.category && a.slug !== article.slug)
        .slice(0, 3);

    const resources = [
        { title: 'Exhibition cities', items: article.relatedCities, base: '/exhibition-stands/' },
        { title: 'Countries', items: article.relatedCountries, base: '/exhibition-stands/' },
        { title: 'Trade shows', items: article.relatedTradeShows, base: '/exhibitions/' },
    ].filter((r) => r.items && r.items.length > 0);

    return (
        <main className="bg-white text-[#252525]">
            {/* Header */}
            <header className="relative overflow-hidden bg-[#141414] px-6 pb-14 pt-32 text-white md:px-10 md:pb-20 md:pt-44">
                <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-[#E03A3A]/25 blur-[140px]" />
                <div className="relative mx-auto max-w-[1100px]">
                    <Link href="/blog" className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white">← All guides</Link>
                    <div className="mt-10"><Eyebrow light>{article.category}</Eyebrow></div>
                    <h1 className="mt-6 text-[clamp(2.2rem,5.5vw,4.75rem)] font-light leading-[1.02] tracking-[-0.04em]">{article.title}</h1>
                    <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-sm text-white/70">
                        <span>By <span className="text-white">{article.author}</span></span>
                        <span>Published {fmt(article.date)}</span>
                        {article.lastUpdated && <span className="text-[#EC6A6A]">Updated {fmt(article.lastUpdated)}</span>}
                        <span>{article.readTime}</span>
                    </div>
                </div>
            </header>

            <article>
                {/* Summary */}
                <div className="bg-[#F0EDE8] px-6 py-12 md:px-10 md:py-16">
                    <div className="mx-auto max-w-[1100px] border-l-2 border-[#E03A3A] pl-6 md:pl-10">
                        <div className={label}>Summary</div>
                        <p className="mt-4 text-xl font-light leading-relaxed tracking-tight md:text-2xl">{article.excerpt}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-14 md:px-10 md:py-24">
                    <div
                        className="mx-auto max-w-[760px] text-[#252525] [&_a]:text-[#E03A3A] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#141414]
              [&_h2]:mb-5 [&_h2]:mt-14 [&_h2]:text-[clamp(1.6rem,3vw,2.25rem)] [&_h2]:font-light [&_h2]:leading-tight [&_h2]:tracking-[-0.03em]
              [&_h3]:mb-4 [&_h3]:mt-10 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:tracking-tight md:[&_h3]:text-2xl
              [&_p]:mb-6 [&_p]:text-base [&_p]:leading-[1.8] [&_p]:text-[#252525]/85 md:[&_p]:text-lg
              [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:leading-relaxed [&_li]:text-[#252525]/85 [&_li]:marker:text-[#E03A3A]
              [&_strong]:font-semibold [&_img]:h-auto [&_img]:max-w-full [&_table]:block [&_table]:overflow-x-auto [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-[#E03A3A] [&_blockquote]:pl-6 [&_blockquote]:text-xl [&_blockquote]:font-light"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                    <div className="mx-auto mt-14 flex max-w-[760px] flex-wrap gap-2 border-t border-[#252525]/15 pt-8">
                        {article.tags.map((tag) => (
                            <span key={tag} className="border border-[#252525]/20 px-3 py-1.5 text-xs text-[#252525]/75">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Related resources */}
                {resources.length > 0 && (
                    <div className="bg-[#141414] px-6 py-14 text-white md:px-10 md:py-24">
                        <div className="mx-auto max-w-[1100px]">
                            <Eyebrow light>Related resources</Eyebrow>
                            <div className="mt-10 grid gap-10 md:grid-cols-3">
                                {resources.map((r) => (
                                    <div key={r.title}>
                                        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#EC6A6A]">{r.title}</div>
                                        <nav className="mt-4 border-t border-white/20">
                                            {r.items!.map((item) => (
                                                <Link key={item} href={`${r.base}${item}`} className="group flex items-center justify-between border-b border-white/10 py-3 capitalize text-white/85 transition-colors hover:text-white">
                                                    {item.replace(/-/g, ' ')}
                                                    <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                                                </Link>
                                            ))}
                                        </nav>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA */}
                <div className="bg-[#E03A3A] px-6 py-14 text-white md:px-10 md:py-24">
                    <Reveal className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-[1fr_auto] md:items-end">
                        <div>
                            <h2 className="max-w-[18ch] text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.02] tracking-[-0.04em]">
                                {article.category === 'City Guides' ? 'Ready to exhibit?' : 'Planning your next exhibition?'}
                            </h2>
                            <p className="mt-5 max-w-xl text-white/90">
                                {article.category === 'City Guides'
                                    ? 'Connect with verified local stand builders who understand venue requirements and deliver exceptional results.'
                                    : 'Get free quotes from verified exhibition stand builders worldwide. Compare proposals and find the perfect partner.'}
                            </p>
                        </div>
                        <Link href="/quote" className="whitespace-nowrap bg-[#141414] px-8 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-[#252525]">
                            Get free quotes
                        </Link>
                    </Reveal>
                </div>
            </article>

            {/* Related articles */}
            {relatedArticles.length > 0 && (
                <section className="bg-[#F0EDE8] px-6 py-14 md:px-10 md:py-24">
                    <div className="mx-auto max-w-[1400px]">
                        <Eyebrow>Related guides</Eyebrow>
                        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
                            {relatedArticles.map((related, i) => (
                                <Reveal key={related.slug} delay={i * 0.06}>
                                    <Link href={`/blog/${related.slug}`} className="group flex h-full flex-col bg-white p-7 transition-shadow duration-500 hover:shadow-[0_16px_40px_rgba(37,37,37,0.08)]">
                                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E03A3A]">{related.category}</div>
                                        <h3 className="mt-5 text-xl font-light leading-snug tracking-tight">{related.title}</h3>
                                        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-[#252525]/70">{related.excerpt}</p>
                                        <div className="mt-6 flex items-center justify-between border-t border-[#252525]/10 pt-4 text-xs text-[#252525]/65">
                                            <span>{related.readTime} · {new Date(related.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                                        </div>
                                    </Link>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
