import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for dynamic meta tags
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.keywords - Meta keywords
 * @param {string} props.image - Open Graph image URL
 * @param {string} props.url - Canonical URL
 * @param {string} props.type - Open Graph type (website, article, product)
 * @param {Object} props.structuredData - JSON-LD structured data
 */
const SEO = ({
  title = 'UniClips',
  description = 'Learn from top university scholars. Access premium educational content, video courses, and expert knowledge from verified academic professionals.',
  keywords = 'online courses, university education, academic videos, scholar courses, learn online, educational platform, video learning, UniClips',
  image = 'https://myuniclips.com/og-image.png',
  url = 'https://myuniclips.com',
  type = 'website',
  structuredData = null
}) => {
  const fullTitle = title === 'UniClips' ? title : `${title} | UniClips`;

  // Default structured data for the website
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "UniClips",
    "url": "https://myuniclips.com",
    "description": "Learn from top university scholars. Access premium educational content and video courses.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://myuniclips.com/teacher?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Organization structured data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "UniClips",
    "url": "https://myuniclips.com",
    "logo": "https://myuniclips.com/logo.png",
    "sameAs": [
      "https://twitter.com/myuniclips",
      "https://www.instagram.com/myuniclips",
      "https://www.linkedin.com/company/myuniclips"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@myuniclips.com"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="UniClips" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="UniClips" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@myuniclips" />
      <meta name="twitter:creator" content="@myuniclips" />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="UniClips" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
    </Helmet>
  );
};

export default SEO;

// Pre-configured SEO for common pages
export const HomeSEO = () => (
  <SEO
    title="UniClips - Learn from University Scholars"
    description="Access premium educational video courses from verified university scholars. Learn directly from academic experts and advance your knowledge with UniClips."
    keywords="online courses, university scholars, academic education, video courses, learn online, educational platform, expert teaching, UniClips"
    url="https://myuniclips.com"
  />
);

export const ScholarsSEO = () => (
  <SEO
    title="Browse Scholars"
    description="Discover expert university scholars on UniClips. Browse profiles, explore courses, and learn from verified academic professionals in various fields."
    keywords="university scholars, academic experts, course instructors, education professionals, online teachers"
    url="https://myuniclips.com/scholar"
  />
);

export const CoursesSEO = () => (
  <SEO
    title="Browse Courses"
    description="Explore our collection of premium video courses created by university scholars. Find courses in science, technology, arts, humanities, and more."
    keywords="video courses, online learning, academic courses, university courses, educational videos"
    url="https://myuniclips.com/teacher"
  />
);

export const AboutSEO = () => (
  <SEO
    title="About Us"
    description="Learn about UniClips - the platform connecting students with university scholars. Our mission is to make quality academic education accessible to everyone."
    keywords="about UniClips, educational platform, university education, academic mission, online learning company"
    url="https://myuniclips.com/aboutUs"
  />
);

export const LoginSEO = () => (
  <SEO
    title="Login"
    description="Sign in to your UniClips account to access your courses, track your progress, and continue learning from university scholars."
    keywords="login, sign in, UniClips account, student portal"
    url="https://myuniclips.com/login"
  />
);

export const LibrarySEO = () => (
  <SEO
    title="My Library"
    description="Access your purchased courses and continue learning. Your personal library of educational content from university scholars."
    keywords="my courses, course library, purchased courses, learning progress"
    url="https://myuniclips.com/my-library"
  />
);

// Dynamic SEO for course detail pages
export const CourseDetailSEO = ({ course }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course?.title || "Course",
    "description": course?.description || "Educational course on UniClips",
    "provider": {
      "@type": "Organization",
      "name": "UniClips",
      "sameAs": "https://myuniclips.com"
    },
    "offers": {
      "@type": "Offer",
      "price": course?.price || "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <SEO
      title={course?.title || "Course Details"}
      description={course?.description?.substring(0, 160) || "View course details and start learning on UniClips."}
      keywords={`${course?.title || 'course'}, ${course?.subject || 'education'}, online course, video learning`}
      url={`https://myuniclips.com/course/${course?.id || ''}`}
      type="product"
      structuredData={structuredData}
    />
  );
};

// Dynamic SEO for scholar profile pages
export const ScholarProfileSEO = ({ scholar }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": scholar?.name || "Scholar",
    "jobTitle": "University Scholar",
    "description": scholar?.bio || "Expert educator on UniClips",
    "worksFor": {
      "@type": "Organization",
      "name": scholar?.university || "University"
    }
  };

  return (
    <SEO
      title={scholar?.name || "Scholar Profile"}
      description={scholar?.bio?.substring(0, 160) || "View scholar profile and courses on UniClips."}
      keywords={`${scholar?.name || 'scholar'}, university professor, online courses, academic expert`}
      url={`https://myuniclips.com/scholar/${scholar?.id || ''}`}
      type="profile"
      structuredData={structuredData}
    />
  );
};
