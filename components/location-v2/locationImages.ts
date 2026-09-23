import type { BannerImage } from "./locMotion";

/**
 * Real, license-verified photos for country/city banners and hub cards on the
 * generalized `CountryLocationPage` / `CityLocationPage`. Every URL was
 * confirmed via the source Unsplash page to be `images.unsplash.com` (free
 * Unsplash License), never `plus.unsplash.com` (paid Unsplash+).
 *
 * Coverage is intentionally partial — both components already degrade
 * gracefully (gradient backdrop, plain colour hub panels) wherever a
 * country/city isn't listed here yet. Sourced in priority order by real
 * `builderCount` from `lib/data/globalExhibitionDatabase.ts`. UAE/Dubai are
 * NOT here — they have their own hand-tuned images in
 * `UaeLocationPage.tsx`/`DubaiLocationPage.tsx`.
 */

// One base Unsplash photo per city; square/vertical are two crops of the SAME
// licensed image via Unsplash's own crop params (still one verified photo,
// not two separate searches) — same technique as UAE's HUB_INFO where a
// single photo needed both an open- and collapsed-panel crop.
function crops(id: string) {
  return {
    square: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=1200&q=80`,
    vertical: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=1500&q=80`,
  };
}

// Country banners are reserved for a REAL exhibition venue — a convention
// centre, trade-fair ground, or the specific hall a famous show is held in —
// never a generic monument/skyline standing in for "the country". Named
// exhibition venues are genuinely rare on free stock (same story as GITEX for
// UAE: professionally shot, licensed by the organiser, not donated to
// Unsplash), so most countries below have NO entry yet and correctly fall
// back to the gradient backdrop rather than a wrong-category photo. Verified
// misses, not skipped: Messe Frankfurt, Tokyo Big Sight, Paris Expo Porte de
// Versailles, ExCeL London/NEC Birmingham, NECC Shanghai/Canton Fair Complex,
// Bharat Mandapam/Pragati Maidan, Austria Center Vienna — none exist as free,
// non-Unsplash+ photos actually showing the venue (a Vienna-skyline photo was
// briefly mislabeled as "Austria Center Vienna" here and caught on visual
// re-check — it's just a sunset shot of the Danube City towers, not the
// venue — so Austria is back on the gradient fallback like the rest).
export const COUNTRY_BANNER_IMAGES: Record<string, BannerImage> = {
  "united-states": {
    src: "https://images.unsplash.com/photo-1768590149213-8ab16aaf7511",
    alt: "CES West Hall at the Las Vegas Convention Center, one of the world's biggest trade shows",
    credit: "CES, Las Vegas Convention Center — Florian Schindler / Unsplash",
    focalMobile: "55% center",
  },
  canada: {
    // Confirmed by visual inspection — "CANADA PLACE" is legible on the building itself.
    src: "https://images.unsplash.com/photo-1772342494965-66bbd555b300",
    alt: "Canada Place, the sail-roofed convention centre on Vancouver's waterfront",
    credit: "Canada Place, Vancouver Convention Centre — QY Liu / Unsplash",
  },
};

// City hub-card photos: a real, geo-tagged skyline/landmark per city (same
// convention as UAE's HUB_INFO) — these represent the CITY, not an exhibition,
// which is the right register for a small collapsed/open hub card.
export const CITY_IMAGES: Record<string, { square: string; vertical: string; credit: string }> = {
  "united-states/las-vegas": { ...crops("1768590149213-8ab16aaf7511"), credit: "CES, Las Vegas Convention Center — Florian Schindler / Unsplash" },
  "united-states/chicago": { ...crops("1745872262717-69c8951b5c49"), credit: "Chicago skyline — Ruben Mavarez / Unsplash" },
  "united-states/orlando": { ...crops("1601051297657-39a9b2ce2cdc"), credit: "Downtown Orlando — Talia / Unsplash" },
  "united-states/new-york": { ...crops("1781033966124-3539e5a3c2d1"), credit: "Manhattan skyline — Ana Soares / Unsplash" },
  "united-states/atlanta": { ...crops("1753744402410-44319f72f8c5"), credit: "Downtown Atlanta — Joao Costa / Unsplash" },
  "united-states/los-angeles": { ...crops("1756679643031-e45437df44e7"), credit: "Downtown Los Angeles skyline — Sam / Unsplash" },

  "china/shanghai": { ...crops("1748078096034-46086f5b87da"), credit: "The Bund, Shanghai — Kushagra Dhall / Unsplash" },
  "china/beijing": { ...crops("1611416517780-eff3a13b0359"), credit: "Beijing skyline — Henry Chen / Unsplash" },
  "china/guangzhou": { ...crops("1753172115293-32b2a08f0798"), credit: "Canton Tower, Guangzhou — Billy Xue / Unsplash" },

  "germany/frankfurt": { ...crops("1577185816322-21f2a92b1342"), credit: "Frankfurt — Igor Flek / Unsplash" },
  "germany/berlin": { ...crops("1573906208264-0cc0b5e4f0e8"), credit: "Fernsehturm, Berlin — J M / Unsplash" },
  "germany/munich": { ...crops("1577462282244-b58c2816d686"), credit: "Marienplatz, Munich — Daniel Seßler / Unsplash" },
  "germany/cologne": { ...crops("1742157940890-66cd19edc618"), credit: "Cologne Cathedral — Soroush H. Zargarbashi / Unsplash" },
  "germany/dusseldorf": { ...crops("1600081926664-b4224c1abc0d"), credit: "Düsseldorf skyline — Nicolas Peyrol / Unsplash" },
  "germany/hamburg": { ...crops("1748355267925-ffa48ccc1c31"), credit: "Hamburg aerial — Valentin / Unsplash" },

  "united-kingdom/london": { ...crops("1513635269975-59663e0ac1ad"), credit: "London skyline — Benjamin Davies / Unsplash" },
  "united-kingdom/manchester": { ...crops("1724135869739-6055627ba5df"), credit: "Manchester skyline — Mylo Kaye / Unsplash" },
  "united-kingdom/birmingham": { ...crops("1628280436322-81afcb6e6a15"), credit: "Birmingham — Tom W / Unsplash" },

  "canada/montreal": { ...crops("1659482513037-950fea76794c"), credit: "Montreal — Grant Van Cleemput / Unsplash" },
  "canada/calgary": { ...crops("1680488736383-6e890a804b50"), credit: "Calgary skyline at sunset — Ryunosuke Kikuno / Unsplash" },
  "canada/ottawa": { ...crops("1656424709170-2ab309b6aeab"), credit: "Parliament Hill, Ottawa — Sarah Baxter / Unsplash" },

  "india/new-delhi": { ...crops("1762526217288-a783242270dc"), credit: "India Gate, New Delhi — Ravi Sharma / Unsplash" },
  "india/hyderabad": { ...crops("1753068863517-a38273f2d7bd"), credit: "Charminar, Hyderabad — Keshav S / Unsplash" },
  "india/kolkata": { ...crops("1742325646212-f917ba1feeaa"), credit: "Howrah Bridge, Kolkata — Paras Verma / Unsplash" },
  // india/ahmedabad deliberately skipped — the only candidate found was GIFT
  // City, Gandhinagar (a different city ~25km away), not Ahmedabad itself.

  "italy/milan": { ...crops("1742148186848-8b257455009b"), credit: "Milan skyline — Onnos A. / Unsplash" },
  "italy/bologna": { ...crops("1598814828588-53e86798baa7"), credit: "Bologna skyline and towers — Sterling Lanier / Unsplash" },
  "italy/rome": { ...crops("1555992828-ca4dbe41d294"), credit: "The Colosseum, Rome — Spencer Davis / Unsplash" },
  // italy/genoa skipped — the only "Genoa" candidate found was actually Naples.

  "spain/madrid": { ...crops("1612694882907-80f21c0e2bb7"), credit: "Gran Vía, Madrid — Andres Garcia / Unsplash" },
  "spain/barcelona": { ...crops("1507619579562-f2e10da1ec86"), credit: "Sagrada Família, Barcelona — Erwan Hesry / Unsplash" },
  "spain/valencia": { ...crops("1577990432593-6bf35f43beed"), credit: "City of Arts and Sciences, Valencia — Diego Olguin / Unsplash" },
  "spain/seville": { ...crops("1688404808709-681acec3684b"), credit: "Plaza de España, Seville — Taisia Karaseva / Unsplash" },

  "australia/perth": { ...crops("1582224266049-4e6839d9aa45"), credit: "Perth, WA — Buddhika Dissanayake / Unsplash" },

  "south-korea/seoul": { ...crops("1783257483216-3f815fbaeb35"), credit: "Seoul skyline — Daryan Shamkhali / Unsplash" },

  "netherlands/amsterdam": { ...crops("1745600016217-d93f94619b85"), credit: "Amsterdam canal — Omar Ramadan / Unsplash" },
  "netherlands/utrecht": { ...crops("1505515888495-c1897b0b5740"), credit: "Utrecht — Alex / Unsplash" },

  "saudi-arabia/riyadh": { ...crops("1674822858255-fcc093a1ef43"), credit: "Riyadh — Mohammed Alqarni / Unsplash" },
  "saudi-arabia/jeddah": { ...crops("1622274421175-87b87bde7fca"), credit: "Jeddah Corniche — Maher Helmi / Unsplash" },
  // saudi-arabia/dammam not yet attempted.

  "south-africa/johannesburg": { ...crops("1577948000111-9c970dfe3743"), credit: "Johannesburg — Clodagh Da Paixao / Unsplash" },
  "south-africa/cape-town": { ...crops("1744604030401-b24c5975a574"), credit: "Table Mountain, Cape Town — Vimal Joseph / Unsplash" },
  // south-africa/durban, port-elizabeth not yet attempted (no clean candidate found for Durban).
  // south-africa/pretoria: only real candidate found was Unsplash+ (paid) — skipped, not free.

  "nigeria/lagos": { ...crops("1744907895363-d351aa6019ef"), credit: "Lekki-Ikoyi Link Bridge, Lagos — Tunde Buremo / Unsplash" },
  "nigeria/abuja": { ...crops("1721076685541-2739cb6ba9fc"), credit: "World Trade Centre, Abuja — Chizon / Unsplash" },
  // nigeria/port-harcourt not yet attempted (no clean candidate found).

  "turkey/izmir": { ...crops("1758404196311-70c62a445e9c"), credit: "Izmir skyline — Aykan Nakus / Unsplash" },

  "thailand/bangkok": { ...crops("1704872656367-aab145fdee7f"), credit: "Bangkok skyline, Chao Phraya River — David Gardiner / Unsplash" },

  "norway/oslo": { ...crops("1754408380043-2ce9062603b4"), credit: "Oslo Opera House — Jimmy Hu / Unsplash" },

  "peru/lima": { ...crops("1491941111517-426644ca2827"), credit: "Miraflores, Lima — Daniel Eloi Pedroso Oliveira / Unsplash" },
  "peru/cusco": { ...crops("1578594903885-51d6d8bcdbb7"), credit: "Plaza de Armas & Cathedral, Cusco — Raul Varela / Unsplash" },
  // peru/arequipa not yet attempted (no clean candidate found).

  "bahrain/manama": { ...crops("1748066768504-99532da7d1e9"), credit: "Bahrain World Trade Center, Manama — Ondrej Bocek / Unsplash" },
  // bahrain/muharraq not yet attempted (candidates found were all actually Manama).

  "oman/muscat": { ...crops("1599743777555-e362a2feab39"), credit: "Muttrah Corniche Mosque, Muscat — Anfal Shamsudeen / Unsplash" },
  // oman/salalah, sohar not yet attempted (no clean candidate found).

  // argentina/rosario, bangladesh/chittagong+sylhet, indonesia/surabaya,
  // saudi-arabia/dammam: no clean candidate found this round either — the
  // Surabaya one found was a close-up ornamental detail, not a city/skyline
  // shot, so it didn't meet the same bar as the entries above.

  "austria/vienna": { ...crops("1457974947974-1d290928d5c7"), credit: "Vienna skyline — Stefan Steinbauer / Unsplash" },

  "argentina/buenos-aires": { ...crops("1764066531610-5457f1bc5419"), credit: "Obelisco, Buenos Aires — Chalo Gallardo / Unsplash" },
  // argentina/rosario not yet attempted.

  "spain/zaragoza": { ...crops("1612072451833-bb858853aaf5"), credit: "Zaragoza at sunset — Pedro Sanz / Unsplash" },
  // indonesia/surabaya, saudi-arabia/dammam not yet attempted (no clean candidate found).

  "pakistan/karachi": { ...crops("1721988277528-06a27beb1811"), credit: "New Memon Masjid, Karachi — Muhammad Amir / Unsplash" },
  "pakistan/lahore": { ...crops("1603491656337-3b491147917c"), credit: "Badshahi Mosque, Lahore — Dr Muhammad Amer / Unsplash" },
  "pakistan/islamabad": { ...crops("1706708081520-fd755a62fd4d"), credit: "Faisal Mosque, Islamabad — Danish Rasool / Unsplash" },

  "malaysia/kuala-lumpur": { ...crops("1666531826321-b20cbe8f37ae"), credit: "Petronas Towers, Kuala Lumpur — Irfan AnNaufal / Unsplash" },

  "bangladesh/dhaka": { ...crops("1653932133705-851f4547eb2b"), credit: "Dhaka City — Md Arafat Ul Alam / Unsplash" },
  // bangladesh/chittagong, sylhet not yet attempted.

  "belgium/brussels": { ...crops("1572886071978-7c60b5b3e506"), credit: "Grand Place, Brussels — Alex Vasey / Unsplash" },

  "switzerland/zurich": { ...crops("1742626301055-a140b7cfad6b"), credit: "Zürich — Tomi Blasic / Unsplash" },
  "switzerland/geneva": { ...crops("1667758682790-c58fa23dc76f"), credit: "Jet d'Eau, Geneva — Meizhi Lang / Unsplash" },
  "switzerland/basel": { ...crops("1657123843551-3417f3057d2c"), credit: "Basel — Eryk Piotr Munk / Unsplash" },
};
