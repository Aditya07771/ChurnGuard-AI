import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { cn, getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/api/client";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
  compact?: boolean;
}

export function ErrorState({ error, onRetry, title, className, compact = false }: ErrorStateProps) {
  const message = getErrorMessage(error);
  const isOffline = error instanceof Error && (error as ApiError).status === 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-destructive text-sm p-3", className)}>
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="ml-auto h-7 px-2">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        {isOffline ? (
          <WifiOff className="h-8 w-8 text-destructive" />
        ) : (
          <AlertCircle className="h-8 w-8 text-destructive" />
        )}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        {title ?? (isOffline ? "Cannot connect to backend" : "Something went wrong")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
      {isOffline && (
        <p className="text-xs text-muted-foreground max-w-sm mb-4">
          Ensure the FastAPI server is running at{" "}
          <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
            {import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1"}
          </code>
        </p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
