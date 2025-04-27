import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorAlertProps {
  title?: string;
  message: string;
  centered?: boolean;
}

export const ErrorAlert = ({
  title = "Something went wrong",
  message,
  centered = false,
}: ErrorAlertProps) => {
  return (
    <Alert
      variant="destructive"
      className={`mb-6 ${
        centered ? "flex flex-col items-center text-center space-y-1.5" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive font-semibold">
          {title}
        </AlertTitle>
      </div>
      <AlertDescription className="text-destructive/80 text-sm">
        {message}
      </AlertDescription>
    </Alert>
  );
};
