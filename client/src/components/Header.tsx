import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SOCIAL_LINKS } from '@/lib/social';
import { CATEGORIES as categories } from '@/lib/categories';

export default function Header() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          '--header-height',
          `${headerRef.current.offsetHeight}px`
        );
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 60) {
        setVisible(true);
      } else if (delta > 6) {
        setVisible(false);
        setMobileMenuOpen(false);
      } else if (delta < -6) {
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep the box in sync with the URL: /search?q=… shows what was searched
  // (including after a refresh or a shared link), and navigating elsewhere
  // clears it. Typing doesn't change the location, so this won't fight the user.
  useEffect(() => {
    const query = new URLSearchParams(searchString).get('q') ?? '';
    setSearchQuery(location === '/search' ? query : '');
  }, [location, searchString]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setLocation(`/search?q=${encodeURIComponent(query)}`);
    setMobileMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-background border-b transition-transform duration-300 ease-in-out"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
      data-testid="site-header"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative pt-6 pb-4 px-6 md:px-8 text-center border-b">
          <div className="absolute top-2 right-4 md:right-6 flex items-center gap-2 md:gap-3" data-testid="social-links">
            {SOCIAL_LINKS.map(({ id, name, icon: Icon, url }) => (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-elevate rounded-full p-2"
                aria-label={name}
                data-testid={`link-${id}`}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </a>
            ))}
          </div>

          <Link href="/">
            <h1 className="text-4xl md:text-6xl font-bold font-serif tracking-tight text-primary cursor-pointer hover-elevate inline-block px-4 py-2 rounded-lg" data-testid="site-title">
              प्राजक्तप्रभा
            </h1>
          </Link>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-4xl mx-auto leading-relaxed px-4" data-testid="site-tagline">
            Welcome to my blog!
            <br />
            काही विचार, काही भावना, काही शब्द…
            आयुष्यात भेटलेल्या क्षणांना आणि अनुभवांना शब्दांत जपण्याचा हा एक मनापासून केलेला प्रयत्न.
          </p>
        </div>

        <div className="px-6 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <nav className="hidden md:flex items-center gap-1" data-testid="navigation">
              <Link href="/">
                <Button
                  variant={location === '/' ? 'secondary' : 'ghost'}
                  className="font-medium"
                  data-testid="nav-home"
                >
                  Home
                </Button>
              </Link>
              <Link href="/archive">
                <Button
                  variant={location === '/archive' ? 'secondary' : 'ghost'}
                  className="font-medium"
                  data-testid="nav-archive"
                >
                  संग्रह
                </Button>
              </Link>
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.id}`}>
                  <Button 
                    variant={location === `/category/${category.id}` ? 'secondary' : 'ghost'}
                    className="font-medium"
                    data-testid={`nav-${category.id}`}
                  >
                    {category.label}
                  </Button>
                </Link>
              ))}
              <Link href="/about">
                <Button 
                  variant={location === '/about' ? 'secondary' : 'ghost'}
                  className="font-medium"
                  data-testid="nav-about"
                >
                  About
                </Button>
              </Link>
            </nav>

            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-xs ml-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </form>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-2" data-testid="mobile-menu">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant={location === '/' ? 'secondary' : 'ghost'} className="w-full justify-start" data-testid="mobile-nav-home">
                  Home
                </Button>
              </Link>
              <Link href="/archive" onClick={() => setMobileMenuOpen(false)}>
                <Button variant={location === '/archive' ? 'secondary' : 'ghost'} className="w-full justify-start" data-testid="mobile-nav-archive">
                  संग्रह
                </Button>
              </Link>
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.id}`} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={location === `/category/${category.id}` ? 'secondary' : 'ghost'} className="w-full justify-start" data-testid={`mobile-nav-${category.id}`}>
                    {category.label}
                  </Button>
                </Link>
              ))}
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                <Button variant={location === '/about' ? 'secondary' : 'ghost'} className="w-full justify-start" data-testid="mobile-nav-about">
                  About
                </Button>
              </Link>
              <form onSubmit={handleSearch} className="pt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="mobile-input-search"
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
