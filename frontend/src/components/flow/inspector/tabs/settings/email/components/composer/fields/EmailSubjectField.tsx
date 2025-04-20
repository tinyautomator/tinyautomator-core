import { useEmailContext } from "../../../context/EmailContext";

export function EmailSubjectField() {
  const { subject, setSubject } = useEmailContext();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Subject</label>
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full border p-2 rounded-md text-sm"
        placeholder="Email subject"
      />
    </div>
  );
}
