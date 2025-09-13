import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-6 py-10 rounded-2xl border bg-white/60 shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400" />
        <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90">
          Return home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
