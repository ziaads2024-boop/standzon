
import { getCityPageUrl, getCountryPageUrl } from '@/lib/utils/slugUtils';

// Base organization schema for StandsZone
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "StandsZone",
  "description": "Global exhibition stand builders network connecting exhibitors with verified contractors worldwide",
  "url": "https://standszone.com",
  "logo": "https://standszone.com/logo.png",
  "foundingDate": "2023",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-800-STANDS",
    "contactType": "customer service",
    "availableLanguage": ["English", "German", "French", "Spanish", "Arabic"]
  },
  "sameAs": [
    "https://linkedin.com/company/standszone",
    "https://twitter.com/standszone",
    "https://facebook.com/standszone"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "Global",
    "addressLocality": "Worldwide"
  }
});

// Website schema
export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "StandsZone",
  "url": "https://standszone.com",
  "description": "Global exhibition stand builders network",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://standszone.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

// Builder profile schema
export const getBuilderSchema = (builder: any, serviceLocations: any[] = [], services: any[] = []) => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": builder.companyName,
    "description": builder.companyDescription || `Professional exhibition stand builder specializing in custom trade show displays and booth construction.`,
    "url": builder.website || `https://standszone.com/builders/${builder.slug}`,
    "telephone": builder.phone,
    "email": builder.primaryEmail,
    "foundingDate": builder.establishedYear?.toString(),
    "numberOfEmployees": builder.teamSize,
    "aggregateRating": builder.rating ? {
      "@type": "AggregateRating",
      "ratingValue": builder.rating,
      "reviewCount": builder.reviewCount || 1,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": builder.headquartersCity,
      "addressCountry": builder.headquartersCountry,
      "streetAddress": builder.headquartersAddress
    },
    "geo": builder.latitude && builder.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": builder.latitude,
      "longitude": builder.longitude
    } : undefined,
    "areaServed": serviceLocations.map(location => ({
      "@type": "City",
      "name": location.city,
      "addressCountry": location.country
    })),
    "serviceType": "Exhibition Stand Construction",
    "industry": "Trade Show Services",
    "keywords": [
      "exhibition stands",
      "trade show displays",
      "booth construction",
      "custom exhibits",
      builder.headquartersCountry?.toLowerCase(),
      builder.headquartersCity?.toLowerCase()
    ].filter(Boolean).join(", ")
  };

  // Add services if available
  if (services.length > 0) {
    schema.hasOfferCatalog = {
      "@type": "OfferCatalog",
      "name": "Exhibition Stand Services",
      "itemListElement": services.map((service, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "name": service.name,
        "description": service.description,
        "category": service.category,
        "price": service.priceFrom ? `${service.priceFrom} ${service.currency || 'USD'}` : undefined,
        "priceCurrency": service.currency || 'USD'
      }))
    };
  }

  // Add logo if available
  if (builder.logo) {
    schema.logo = builder.logo;
    schema.image = builder.logo;
  }

  return schema;
};

// Location page schema (Country/City)
export const getLocationSchema = (
  country: string,
  city?: string,
  builders: any[] = [],
  statistics?: any
) => {
  const locationName = city ? `${city}, ${country}` : country;
  const isCity = !!city;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": isCity ? "City" : "Country",
    "name": locationName,
    "description": `Professional exhibition stand builders in ${locationName}. Find verified contractors for trade shows, exhibitions, and custom booth construction.`,
    "url": `https://standszone.com${city ? getCityPageUrl(country, city) : getCountryPageUrl(country)}`,
    "containedInPlace": isCity ? {
      "@type": "Country",
      "name": country
    } : undefined,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `Exhibition Stand Services in ${locationName}`,
      "numberOfItems": builders.length,
      "itemListElement": builders.slice(0, 10).map((builder, index) => ({
        "@type": "LocalBusiness",
        "position": index + 1,
        "name": builder.companyName,
        "description": builder.companyDescription,
        "url": `https://standszone.com/builders/${builder.slug}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": builder.headquartersCity,
          "addressCountry": builder.headquartersCountry
        },
        "aggregateRating": builder.rating ? {
          "@type": "AggregateRating",
          "ratingValue": builder.rating,
          "reviewCount": builder.reviewCount || 1
        } : undefined
      }))
    }
  };

  // Add statistics if available
  if (statistics) {
    schema.additionalProperty = [
      {
        "@type": "PropertyValue",
        "name": "Total Builders",
        "value": statistics.totalBuilders
      },
      {
        "@type": "PropertyValue",
        "name": "Verified Builders",
        "value": statistics.verifiedBuilders
      },
      {
        "@type": "PropertyValue",
        "name": "Average Rating",
        "value": statistics.averageRating
      }
    ];
  }

  return schema;
};

// Exhibition/Trade Show schema
export const getExhibitionSchema = (exhibition: any) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": exhibition.name,
  "description": exhibition.description,
  "startDate": exhibition.startDate,
  "endDate": exhibition.endDate,
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": exhibition.venueName,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": exhibition.venueAddress,
      "addressLocality": exhibition.city,
      "addressCountry": exhibition.country
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": exhibition.organizerName,
    "url": exhibition.organizerWebsite
  },
  "url": exhibition.website || `https://standszone.com/exhibitions/${exhibition.slug}`,
  "image": exhibition.image,
  "offers": {
    "@type": "AggregateOffer",
    "description": "Exhibition stand construction services",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
});

// Service schema for specific services
export const getServiceSchema = (service: any, builder: any) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "LocalBusiness",
    "name": builder.companyName,
    "url": `https://standszone.com/builders/${builder.slug}`
  },
  "serviceType": service.category,
  "areaServed": {
    "@type": "Country",
    "name": builder.headquartersCountry
  },
  "offers": {
    "@type": "Offer",
    "price": service.priceFrom,
    "priceCurrency": service.currency || "USD",
    "availability": "https://schema.org/InStock"
  }
});

// FAQ schema for common questions
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Breadcrumb schema
export const getBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});

// Article schema for blog posts
export const getArticleSchema = (article: {
  title: string;
  description: string;
  content: string;
  author: string;
  publishDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "articleBody": article.content,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "StandsZone",
    "logo": {
      "@type": "ImageObject",
      "url": "https://standszone.com/logo.png"
    }
  },
  "datePublished": article.publishDate,
  "dateModified": article.modifiedDate || article.publishDate,
  "image": article.image,
  "url": article.url,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  }
});

// Product schema for premium services
export const getProductSchema = (product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  availability: string;
  brand: string;
  category: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "brand": {
    "@type": "Brand",
    "name": product.brand
  },
  "category": product.category,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": product.currency,
    "availability": `https://schema.org/${product.availability}`,
    "seller": {
      "@type": "Organization",
      "name": "StandsZone"
    }
  }
});

// Helper function to generate JSON-LD script tag
export const generateJSONLD = (schema: any): string => {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
};

// Helper function to inject structured data into page head
export const injectStructuredData = (schemas: any[]): void => {
  if (typeof window === 'undefined') return;

  // Remove existing structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => script.remove());

  // Add new structured data
  schemas.forEach(schema => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  });
};

// Generate location structured data (for city/country pages)
export const generateLocationStructuredData = (location: {
  name: string;
  description: string;
  address: {
    addressLocality: string;
    addressCountry: string;
  };
  url: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) => ({
  "@context": "https://schema.org",
  "@type": "Place",
  "name": location.name,
  "description": location.description,
  "url": location.url,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": location.address.addressLocality,
    "addressCountry": location.address.addressCountry
  },
  "aggregateRating": location.aggregateRating ? {
    "@type": "AggregateRating",
    "ratingValue": location.aggregateRating.ratingValue,
    "reviewCount": location.aggregateRating.reviewCount,
    "bestRating": 5,
    "worstRating": 1
  } : undefined
});

// Generate organization structured data (for builder profiles)
export const generateOrganizationStructuredData = (organization: {
  name: string;
  description: string;
  url: string;
  telephone?: string;
  email?: string;
  address: {
    addressLocality: string;
    addressCountry: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": organization.name,
  "description": organization.description,
  "url": organization.url,
  "telephone": organization.telephone,
  "email": organization.email,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": organization.address.addressLocality,
    "addressCountry": organization.address.addressCountry
  },
  "aggregateRating": organization.aggregateRating ? {
    "@type": "AggregateRating",
    "ratingValue": organization.aggregateRating.ratingValue,
    "reviewCount": organization.aggregateRating.reviewCount,
    "bestRating": 5,
    "worstRating": 1
  } : undefined,
  "serviceType": "Exhibition Stand Construction",
  "industry": "Trade Show Services"
});

// Common FAQ data for exhibition stands
export const COMMON_EXHIBITION_FAQS = [
  {
    question: "How much does an exhibition stand cost?",
    answer: "Exhibition stand costs vary widely depending on size, complexity, and location. Basic modular stands start from $5,000, while custom-built stands can range from $15,000 to $200,000 or more. Factors include stand size, design complexity, materials, graphics, technology integration, and labor costs in different countries."
  },
  {
    question: "How far in advance should I book an exhibition stand builder?",
    answer: "We recommend booking your exhibition stand builder 3-6 months before your event. Popular builders and prime exhibition dates book up quickly, especially for major trade shows. Early booking also allows more time for design development, approvals, and production."
  },
  {
    question: "What services do exhibition stand builders provide?",
    answer: "Professional exhibition stand builders offer comprehensive services including custom design, 3D visualization, construction, graphics production, furniture rental, AV integration, installation, dismantling, storage, and project management. Many also provide additional services like logistics, electrical work, and on-site support."
  },
  {
    question: "Do exhibition stand builders work internationally?",
    answer: "Yes, many exhibition stand builders work internationally or have partner networks worldwide. StandsZone connects you with local builders in over 20 countries, ensuring you get local expertise while maintaining quality standards. This approach often reduces costs and simplifies logistics."
  },
  {
    question: "What's the difference between modular and custom exhibition stands?",
    answer: "Modular stands use pre-fabricated components that can be reconfigured for different events, making them cost-effective and reusable. Custom stands are built specifically for your brand and requirements, offering unique design possibilities but typically at higher cost. The choice depends on your budget, frequency of exhibitions, and branding needs."
  }
];

export default {
  getOrganizationSchema,
  getWebsiteSchema,
  getBuilderSchema,
  getLocationSchema,
  getExhibitionSchema,
  getServiceSchema,
  getFAQSchema,
  getBreadcrumbSchema,
  getArticleSchema,
  getProductSchema,
  generateJSONLD,
  injectStructuredData,
  COMMON_EXHIBITION_FAQS,
  generateLocationStructuredData,
  generateOrganizationStructuredData
};
