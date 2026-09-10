import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import AboutSection from '@/components/AboutSection';
import SocialMediaSection from '@/components/SocialMediaSection';
import SiteFooter from '@/components/SiteFooter';
import { useDocumentMeta } from '@/hooks/use-document-meta';
import { resolveAssetPath } from '@/lib/posts';

// From `/blog-images/`, not a Vite asset import — see the same note in
// HomePage.tsx (Phase 6: one image location, compressed by one build step).
const profileImage = resolveAssetPath('/blog-images/about_section_portrait.png', import.meta.env.BASE_URL);

export default function AboutPage() {
  const [, setLocation] = useLocation();

  useDocumentMeta({
    title: 'माझ्याबद्दल (About)',
    description: 'नमस्कार, मी प्राजक्ता. लेखन, नृत्य आणि गायन हे माझे आवडते छंद आहेत — माझ्याबद्दल अधिक जाणून घ्या.',
  });

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-height, 200px)' }}>
      <Header />

      <main>
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-8"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <AboutSection
          image={profileImage}
          bioMarathi="मी प्राजक्ता प्रभा. लेखन, नृत्य आणि गायन हे माझ्या मनाजवळचे छंद. शब्दांमधून भावना व्यक्त करणं आणि कवितेतून आयुष्याचे विविध रंग टिपणं मला मनापासून आवडतं. नृत्य तर माझ्या आयुष्याचा अविभाज्य भागच आहे. माझ्या या ब्लॉगच्या माध्यमातून माझ्या कविता, आयुष्यातले अनुभव आणि विचार तुमच्यापर्यंत पोहोचवण्याचा हा छोटासा प्रयत्न आहे. इथे तुम्हाला कविता, विविध विषयांवरील लेख आणि आपल्या मराठी संस्कृतीची सुंदर परंपरा जपणारे उखाणे वाचायला मिळतील. माझे शब्द आणि माझ्या भावना तुमच्या मनाला कुठेतरी स्पर्शून जाव्यात, एवढीच मनापासून इच्छा."
          bioEnglish="I'm Prajakta Prabha, a passionate writer, dancer, and creative soul. Through my poetry, I express the various emotions and experiences of life. Dance is an integral part of who I am, and I'm trained in classical Indian dance forms. This blog is my platform to share my thoughts, experiences, and creativity with you. Here you'll find poetry that touches the heart, articles about life's moments, and traditional Marathi verses (ukhane). I hope my writing resonates with you and that you'll join me on this creative journey."
          onContact={() => window.location.href = 'mailto:contact@example.com'}
        />

        <SocialMediaSection />
      </main>

      <SiteFooter />
    </div>
  );
}
