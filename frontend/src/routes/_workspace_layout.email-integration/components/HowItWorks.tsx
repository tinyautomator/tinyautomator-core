import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const HowItWorks = () => {
  const steps = [
    ["1", "Click the Connect Button", "AND CLICK ACCEPT LIL BITCH"],
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>How It Works</CardTitle>
        <CardDescription>
          Follow these steps to connect your email account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map(([step, title, description]) => (
            <div key={step} className="flex">
              <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                <span className="text-sm font-medium">{step}</span>
              </div>
              <div>
                <h4 className="font-medium">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
