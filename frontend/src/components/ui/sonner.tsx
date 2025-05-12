import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      position="bottom-right"
      expand
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast flex flex-row items-center gap-2 w-full p-3 rounded-md shadow-md border border-solid max-w-[280px] text-sm bg-background  text-foreground",
          title: "font-medium",
          description:
            "text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap break-words",

          actionButton:
            "bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium",
          cancelButton:
            "bg-muted text-muted-foreground text-xs px-2 py-1 rounded-md font-medium",
          closeButton:
            "absolute top-1.5 right-1.5 p-0.5 rounded-md text-foreground/50 hover:text-foreground",

          error: "bg-rose-50 text-rose-800 border-rose-100",
          success: "bg-green-50 text-green-800 border-green-100",
          warning: "bg-amber-50 text-amber-800 border-amber-100",
          info: "bg-sky-50 text-sky-800 border-sky-100",
        },
      }}
      closeButton
    />
  );
};

export { Toaster };
