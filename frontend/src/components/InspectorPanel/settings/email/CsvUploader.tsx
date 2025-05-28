import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { parseEmailCsv } from "./utils/csvParser";
import { ControllerRenderProps } from "react-hook-form";
import { EmailFormValues } from "./utils/emailValidation";

interface CsvUploaderProps
  extends ControllerRenderProps<EmailFormValues, "recipients"> {}

export function CsvUploader({ ...field }: CsvUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCsvFile(file);
  };

  const handleCsvFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const { emails, error } = await parseEmailCsv(file);

      if (error) {
        throw new Error(error);
      }

      field.onChange([...field.value, ...emails]);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Failed to parse CSV.");
      }
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
          isDragging ? "border-primary" : "border-muted"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleCsvFile(file);
        }}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Click to upload</span> or drag and
            drop
          </div>
          <div className="text-xs text-muted-foreground">
            CSV file with email addresses
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing CSV file...
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center text-sm text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
