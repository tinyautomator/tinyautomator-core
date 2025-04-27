import { Textarea } from "@/components/ui/textarea";
import { useEmailContext } from "./context/EmailContext";

export function EmailBodyField() {
  const { body, setBody, maxBodyLength } = useEmailContext();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex justify-between">Body</label>

      <Textarea
        id="email-body"
        className="w-full min-h-[150px] text-sm font-mono"
        maxLength={maxBodyLength}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <p className="text-xs text-right text-muted-foreground">
        {maxBodyLength - body.length} characters remaining
      </p>
    </div>
  );
}
