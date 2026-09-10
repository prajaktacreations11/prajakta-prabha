import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import PostPage from "@/pages/PostPage";
import SearchPage from "@/pages/SearchPage";
import TagPage from "@/pages/TagPage";
import ArchivePage from "@/pages/ArchivePage";
import AboutPage from "@/pages/AboutPage";
import NotFound from "@/pages/not-found";
import ScrollToTop from "@/components/ScrollToTop";

// import.meta.env.BASE_URL matches vite.config.ts's `base` ("/" in dev, "/marathi-bytes/" in prod)
// so routing works correctly whether the app is served at the domain root or a GitHub Pages subpath.
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/category/:category" component={CategoryPage} />
      <Route path="/post/:id" component={PostPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/tag/:tag" component={TagPage} />
      <Route path="/archive" component={ArchivePage} />
      <Route path="/about" component={AboutPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// wouter doesn't reset scroll position on navigation the way a full page
// load would — without this, clicking a nav link while scrolled down on the
// previous page lands the new page at that same scroll offset, showing its
// content cut off under the fixed header instead of from the top.
function ScrollRestoration() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ScrollRestoration />
      <ScrollToTop />
      <AppRoutes />
    </WouterRouter>
  );
}

export default App;
