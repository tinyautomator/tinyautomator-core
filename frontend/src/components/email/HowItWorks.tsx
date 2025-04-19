// src/components/email/HowItWorks.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const HowItWorks = () => {
  const steps = [
    [
      "1",
      "Click the Connect Button",
      "Click the 'Connect' button on the provider card to start the authentication process",
    ],
    [
      "2",
      "Sign in to Your Account",
      "Sign in to your email account when prompted",
    ],
    [
      "3",
      "Grant Permissions",
      "Review and grant the necessary permissions for TinyAutomator",
    ],
    [
      "4",
      "Start Automating",
      "Once connected, you can start using your email account in automation workflows",
    ],
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
