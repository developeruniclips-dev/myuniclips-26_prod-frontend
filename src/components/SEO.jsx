import { useEffect } from 'react';

/**
 * SEO Component for dynamic meta tags using native React
 * Works with React 19 without external dependencies
 */
const SEO = ({
  title = 'UniClips',
  description = 'Learn from top university scholars. Access premium educational content, video courses, and expert knowledge from verified academic professionals.',
  keywords = 'online courses, university education, academic videos, scholar courses, learn online, educational platform, video learning, UniClips',
  image = 'https://myuniclips.com/og-image.png',
  url = 'https://myuniclips.com',
  type = 'website'
}) => {
  const fullTitle = title === 'UniClips' ? title : `${title} | UniClips`;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const updateLink = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Primary Meta Tags
    updateMeta('title', fullTitle);
    updateMeta('description', description);
    updateMeta('keywords', keywords);

    // Canonical URL
    updateLink('canonical', url);

    // Open Graph / Facebook
    updateMeta('og:type', type, true);
    updateMeta('og:url', url, true);
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:url', url);
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

  }, [fullTitle, description, keywords, image, url, type]);

  return null; // This component doesn't render anything
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
export const CourseDetailSEO = ({ course }) => (
  <SEO
    title={course?.title || "Course Details"}
    description={course?.description?.substring(0, 160) || "View course details and start learning on UniClips."}
    keywords={`${course?.title || 'course'}, ${course?.subject || 'education'}, online course, video learning`}
    url={`https://myuniclips.com/course/${course?.id || ''}`}
    type="product"
  />
);

// Dynamic SEO for scholar profile pages
export const ScholarProfileSEO = ({ scholar }) => (
  <SEO
    title={scholar?.name || "Scholar Profile"}
    description={scholar?.bio?.substring(0, 160) || "View scholar profile and courses on UniClips."}
    keywords={`${scholar?.name || 'scholar'}, university professor, online courses, academic expert`}
    url={`https://myuniclips.com/scholar/${scholar?.id || ''}`}
    type="profile"
  />
);
