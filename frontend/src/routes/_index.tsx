import App from "../App";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/react-router";

export default function Component() {
  return (
    <>
      <SignInButton mode="modal">
        <Button variant="outline">Sign In</Button>
      </SignInButton>
      <App />;
    </>
  );
}
