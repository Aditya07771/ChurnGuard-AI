import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="rounded-full bg-destructive/10 p-5 w-fit mx-auto">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">404 — Page Not Found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The route you navigated to does not exist in ChurnGuard AI or was moved to another section.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" /> Landing Page
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link to="/dashboard/overview">
              <ArrowLeft className="h-4 w-4" /> Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
