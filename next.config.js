/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ PERFORMANCE: Enable image optimization
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Set device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add allowed domains for image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'standsbay.com',
      },
      {
        protocol: 'https',
        hostname: 'standszone.com',
      },
    ],
    qualities: [25, 50, 75, 85, 90, 100],
  },
  // ✅ PERFORMANCE: Enable modern features
  serverExternalPackages: ['@react-email/render'],
  experimental: {
    // Enable SWC transforms
    // swcPlugins: [
    //   ['next-superjson-plugin', {}]
    // ],
    // ✅ PERFORMANCE: Enable modern features
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'react-icons',
      'lodash',
      'date-fns'
    ],
    // Reduce build time by limiting concurrent operations
    workerThreads: false,
    cpus: 2, // Limit CPU usage to prevent resource contention
  },
  turbopack: {},
  devIndicators: false,
  // ✅ PERFORMANCE: Enable compression and optimization
  compress: true,
  poweredByHeader: false,
  // ✅ PERFORMANCE: Optimize webpack configuration
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 3000,
        aggregateTimeout: 1000,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
      config.cache = false;
    }

    // Add performance optimizations
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };

    // ✅ PERFORMANCE: Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Create separate chunks for heavy libraries
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          lucide: {
            name: 'lucide',
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          ui: {
            name: 'ui',
            test: /[\\/]components[\\/]ui[\\/]/,
            chunks: 'all',
            priority: 15,
          },
          admin: {
            name: 'admin',
            test: /[\\/]components[\\/].*[Aa]dmin.*[\\/]/,
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
          // Optimize CSS chunks
          styles: {
            name: 'styles',
            type: 'css/mini-extract',
            chunks: 'all',
            enforce: true,
            priority: 30,
          },
        },
      };
    }

    // 🔥 BUILD OPTIMIZATION: Additional performance optimizations for faster builds
    if (!dev) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.providedExports = true;
      
      // Enable minimizer for production
      if (Array.isArray(config.optimization.minimizer)) {
        config.optimization.minimizer = config.optimization.minimizer.filter(
          (minimizer) => minimizer && typeof minimizer !== 'string'
        );
      }
    }

    return config;
  },

  // ✅ PERFORMANCE: Additional performance optimizations
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'], // Keep error and warn logs
    },
    reactRemoveProperties: false, // Keep React properties for compatibility
    relay: undefined, // No relay integration
    styledComponents: false, // We're using Tailwind, not styled-components
  },
  // Enable output standalone for optimized Docker builds
  output: 'standalone',
  // Enable compression for production builds
  compress: true,
  // 🔥 BUILD OPTIMIZATION: Reduce static page generation time
  staticPageGenerationTimeout: 120, // 2 minutes instead of default 60
  // 🔥 BUILD OPTIMIZATION: Faster builds
  trailingSlash: false,
  // ✅ PERFORMANCE: Enable caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Performance headers
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'font/woff2',
          },
        ],
      },
    ];
  },
  // ✅ SEO: consolidate legacy URL patterns onto the canonical routes with a
  // real 308 (handled at the routing layer — more reliable than page-level
  // permanentRedirect()).
  async redirects() {
    return [
      {
        source: '/companies/:slug',
        destination: '/builders/:slug',
        permanent: true,
      },
      {
        source: '/locations/:country',
        destination: '/exhibition-stands/:country',
        permanent: true,
      },
      {
        source: '/locations/:country/:city',
        destination: '/exhibition-stands/:country/:city',
        permanent: true,
      },
      // ✅ Retired the old hand-built country-code pages under
      // /exhibition-stands/{2-letter-code}[/{city}] (e.g. /de, /gb/london) —
      // they duplicated the CMS-managed /exhibition-stands/{country-name}
      // pages built from lib/data/globalCities.ts, and for 7 countries whose
      // code happened to equal the canonical slug (hong-kong, india, israel,
      // jordan, lebanon, new-zealand, taiwan) they silently shadowed the real
      // page instead of just duplicating it. 301s preserve any inbound links
      // / search equity instead of just 404ing.
      { source: '/exhibition-stands/at', destination: '/exhibition-stands/austria', permanent: true },
      { source: '/exhibition-stands/au', destination: '/exhibition-stands/australia', permanent: true },
      { source: '/exhibition-stands/be', destination: '/exhibition-stands/belgium', permanent: true },
      { source: '/exhibition-stands/be/kortrijk', destination: '/exhibition-stands/belgium/kortrijk', permanent: true },
      { source: '/exhibition-stands/ca', destination: '/exhibition-stands/canada', permanent: true },
      { source: '/exhibition-stands/ca/calgary', destination: '/exhibition-stands/canada/calgary', permanent: true },
      { source: '/exhibition-stands/ca/ottawa', destination: '/exhibition-stands/canada/ottawa', permanent: true },
      { source: '/exhibition-stands/ch', destination: '/exhibition-stands/switzerland', permanent: true },
      { source: '/exhibition-stands/de', destination: '/exhibition-stands/germany', permanent: true },
      { source: '/exhibition-stands/de/berlin', destination: '/exhibition-stands/germany/berlin', permanent: true },
      { source: '/exhibition-stands/de/cologne', destination: '/exhibition-stands/germany/cologne', permanent: true },
      { source: '/exhibition-stands/de/frankfurt', destination: '/exhibition-stands/germany/frankfurt', permanent: true },
      { source: '/exhibition-stands/de/stuttgart', destination: '/exhibition-stands/germany/stuttgart', permanent: true },
      { source: '/exhibition-stands/dk', destination: '/exhibition-stands/denmark', permanent: true },
      { source: '/exhibition-stands/es', destination: '/exhibition-stands/spain', permanent: true },
      { source: '/exhibition-stands/fi', destination: '/exhibition-stands/finland', permanent: true },
      { source: '/exhibition-stands/fr', destination: '/exhibition-stands/france', permanent: true },
      { source: '/exhibition-stands/fr/strasbourg', destination: '/exhibition-stands/france/strasbourg', permanent: true },
      { source: '/exhibition-stands/gb', destination: '/exhibition-stands/united-kingdom', permanent: true },
      { source: '/exhibition-stands/gb/birmingham', destination: '/exhibition-stands/united-kingdom/birmingham', permanent: true },
      { source: '/exhibition-stands/gb/glasgow', destination: '/exhibition-stands/united-kingdom/glasgow', permanent: true },
      { source: '/exhibition-stands/gb/london', destination: '/exhibition-stands/united-kingdom/london', permanent: true },
      { source: '/exhibition-stands/gb/manchester', destination: '/exhibition-stands/united-kingdom/manchester', permanent: true },
      { source: '/exhibition-stands/hk', destination: '/exhibition-stands/hong-kong', permanent: true },
      { source: '/exhibition-stands/jp', destination: '/exhibition-stands/japan', permanent: true },
      { source: '/exhibition-stands/jp/chiba', destination: '/exhibition-stands/japan/chiba', permanent: true },
      { source: '/exhibition-stands/nl', destination: '/exhibition-stands/netherlands', permanent: true },
      { source: '/exhibition-stands/nl/maastricht', destination: '/exhibition-stands/netherlands/maastricht', permanent: true },
      { source: '/exhibition-stands/nl/rotterdam', destination: '/exhibition-stands/netherlands/rotterdam', permanent: true },
      { source: '/exhibition-stands/nl/vijfhuizen', destination: '/exhibition-stands/netherlands/vijfhuizen', permanent: true },
      { source: '/exhibition-stands/no', destination: '/exhibition-stands/norway', permanent: true },
      { source: '/exhibition-stands/nz', destination: '/exhibition-stands/new-zealand', permanent: true },
      { source: '/exhibition-stands/pl', destination: '/exhibition-stands/poland', permanent: true },
      { source: '/exhibition-stands/pl/kielce', destination: '/exhibition-stands/poland/kielce', permanent: true },
      { source: '/exhibition-stands/pl/poznan', destination: '/exhibition-stands/poland/poznan', permanent: true },
      { source: '/exhibition-stands/pl/warsaw', destination: '/exhibition-stands/poland/warsaw', permanent: true },
      { source: '/exhibition-stands/se', destination: '/exhibition-stands/sweden', permanent: true },
      { source: '/exhibition-stands/th', destination: '/exhibition-stands/thailand', permanent: true },
      { source: '/exhibition-stands/th/khon-kaen', destination: '/exhibition-stands/thailand/khon-kaen', permanent: true },
      { source: '/exhibition-stands/tw', destination: '/exhibition-stands/taiwan', permanent: true },
      { source: '/exhibition-stands/us', destination: '/exhibition-stands/united-states', permanent: true },
      { source: '/exhibition-stands/us/alaska', destination: '/exhibition-stands/united-states/alaska', permanent: true },
      { source: '/exhibition-stands/us/anaheim', destination: '/exhibition-stands/united-states/anaheim', permanent: true },
      { source: '/exhibition-stands/us/austin', destination: '/exhibition-stands/united-states/austin', permanent: true },
      { source: '/exhibition-stands/us/boston', destination: '/exhibition-stands/united-states/boston', permanent: true },
      { source: '/exhibition-stands/us/denver', destination: '/exhibition-stands/united-states/denver', permanent: true },
      { source: '/exhibition-stands/us/detroit', destination: '/exhibition-stands/united-states/detroit', permanent: true },
      { source: '/exhibition-stands/us/florida', destination: '/exhibition-stands/united-states/florida', permanent: true },
      { source: '/exhibition-stands/us/georgia', destination: '/exhibition-stands/united-states/georgia', permanent: true },
      { source: '/exhibition-stands/us/houston', destination: '/exhibition-stands/united-states/houston', permanent: true },
      { source: '/exhibition-stands/us/long-beach', destination: '/exhibition-stands/united-states/long-beach', permanent: true },
      { source: '/exhibition-stands/us/louisville', destination: '/exhibition-stands/united-states/louisville', permanent: true },
      { source: '/exhibition-stands/us/miami', destination: '/exhibition-stands/united-states/miami', permanent: true },
      { source: '/exhibition-stands/us/michigan', destination: '/exhibition-stands/united-states/michigan', permanent: true },
      { source: '/exhibition-stands/us/new-orleans', destination: '/exhibition-stands/united-states/new-orleans', permanent: true },
      { source: '/exhibition-stands/us/palm-beach', destination: '/exhibition-stands/united-states/palm-beach', permanent: true },
      { source: '/exhibition-stands/us/pittsburgh', destination: '/exhibition-stands/united-states/pittsburgh', permanent: true },
      { source: '/exhibition-stands/us/san-antonio', destination: '/exhibition-stands/united-states/san-antonio', permanent: true },
      { source: '/exhibition-stands/us/san-diego', destination: '/exhibition-stands/united-states/san-diego', permanent: true },
      { source: '/exhibition-stands/us/san-francisco', destination: '/exhibition-stands/united-states/san-francisco', permanent: true },
      { source: '/exhibition-stands/us/san-jose', destination: '/exhibition-stands/united-states/san-jose', permanent: true },
      { source: '/exhibition-stands/us/tallahassee', destination: '/exhibition-stands/united-states/tallahassee', permanent: true },
      { source: '/exhibition-stands/us/texas', destination: '/exhibition-stands/united-states/texas', permanent: true },
      { source: '/exhibition-stands/us/utah', destination: '/exhibition-stands/united-states/utah', permanent: true },
      { source: '/exhibition-stands/vn', destination: '/exhibition-stands/vietnam', permanent: true },
    ];
  },
  // ✅ PERFORMANCE: Optimize CSS preloading
  async rewrites() {
    return [
      {
        source: '/_next/static/chunks/main-app.js',
        destination: '/api/static/main-app.js',
      },
      {
        source: '/.well-known/:path*',
        destination: '/api/static/.well-known/:path*',
      },
    ];
  },
  allowedDevOrigins: [
    "*.macaly.dev",
    "*.macaly.app",
    "*.macaly-app.com",
    "*.macaly-user-data.dev",
  ],
};

module.exports = nextConfig;