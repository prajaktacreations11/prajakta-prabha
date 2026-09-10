import { Link } from 'wouter';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import PostGrid from '@/components/PostGrid';
import TagCloud from '@/components/TagCloud';
import AboutSection from '@/components/AboutSection';
import SocialMediaSection from '@/components/SocialMediaSection';
import SiteFooter from '@/components/SiteFooter';
import { getAllPosts } from '@/lib/content';
import { useDocumentMeta } from '@/hooks/use-document-meta';
import { resolveAssetPath, type Post } from '@/lib/posts';

const FEATURED_COUNT = 3;

/**
 * The 3 most recent posts, not a `featured: true` frontmatter flag (see
 * spec.md Phase 12) — no new authoring concept, and "most recent" already
 * surfaces her latest work. Skips a post whose thumbnail exactly matches the
 * previously-picked slide's, since two same-category posts with no thumbnail
 * of their own otherwise fall back to the same category default image and
 * render as visually-identical adjacent slides; falls back to allowing a
 * repeat rather than shrinking the carousel if there aren't enough posts with
 * distinct thumbnails.
 */
function getFeaturedPosts(posts: Post[], count: number): Post[] {
  const featured: Post[] = [];
  const skipped: Post[] = [];

  for (const post of posts) {
    if (featured.length >= count) break;
    const previous = featured[featured.length - 1];
    if (previous && previous.thumbnail === post.thumbnail) {
      skipped.push(post);
    } else {
      featured.push(post);
    }
  }

  for (const post of skipped) {
    if (featured.length >= count) break;
    featured.push(post);
  }

  return featured;
}

const profileImage = resolveAssetPath('/blog-images/about_section_portrait.png', import.meta.env.BASE_URL);

export default function HomePage() {
  const allPosts = getAllPosts();
  const carouselSlides = getFeaturedPosts(allPosts, FEATURED_COUNT).map((post) => ({
    image: post.thumbnail,
    caption: post.title,
    href: `/post/${post.id}`,
  }));

  useDocumentMeta({
    title: 'Home',
    description: 'प्राजक्तप्रभा - A creative blog showcasing Marathi poetry, dance, and cultural expression. Explore original काव्य, articles, and उखाणे.',
  });

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-height, 200px)' }}>
      <Header />

      <main>
        <section className="max-w-3xl mx-auto px-6 md:px-8 pt-12 md:pt-16">
          <HeroCarousel slides={carouselSlides} />
        </section>

        <section className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16" data-testid="browse-section">
          <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6 text-center" data-testid="browse-heading">
            विषयानुसार शोधा (Browse by Tag)
          </h2>
          <TagCloud />
          <p className="text-center mt-8">
            <Link href="/archive" className="text-primary hover:underline font-medium" data-testid="link-view-archive">
              पूर्ण संग्रह वर्षानुसार पहा (View the full archive by year) →
            </Link>
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 md:px-8 pb-12 md:pb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-8" data-testid="latest-content-heading">
            Latest Content
          </h2>

          <PostGrid
            posts={allPosts}
            emptyState={
              <p className="text-muted-foreground text-lg">
                No posts yet. Add a .md file to the content folder to get started.
              </p>
            }
          />
        </section>

        <AboutSection
          image={profileImage}
          bioMarathi="नमस्कार, मी प्राजक्ता. लेखन, नृत्य आणि गायन हे माझ्या मनाजवळचे छंद. शब्दांमधून भावना व्यक्त करणं आणि कवितेतून आयुष्याचे विविध रंग टिपणं मला मनापासून आवडतं. 
          नृत्य तर माझ्या आयुष्याचा अविभाज्य भागच आहे. 
          माझ्या या ब्लॉगच्या माध्यमातून माझ्या कविता, आयुष्यातले अनुभव आणि विचार तुमच्यापर्यंत पोहोचवण्याचा हा छोटासा प्रयत्न आहे. इथे तुम्हाला कविता, विविध विषयांवरील लेख आणि आपल्या मराठी संस्कृतीची सुंदर परंपरा जपणारे उखाणे वाचायला मिळतील. माझे शब्द आणि माझ्या भावना तुमच्या मनाला कुठेतरी स्पर्शून जाव्यात, एवढीच मनापासून इच्छा."
          bioEnglish="I'm Prajakta, a passionate writer, dancer, and creative soul. Through my poetry, I express the various emotions and experiences of life. Dance is an integral part of who I am, and I'm trained in classical Indian dance forms. This blog is my platform to share my thoughts, experiences, and creativity with you. Here you'll find poetry that touches the heart, articles about life's moments, and traditional Marathi verses (ukhane). I hope my writing resonates with you and that you'll join me on this creative journey."
          onContact={() => window.location.href = 'mailto:contact@example.com'}
        />

        <SocialMediaSection />
      </main>

      <SiteFooter />
    </div>
  );
}
