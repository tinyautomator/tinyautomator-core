import App from "../App";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/react-router";
import { Route } from "./+types/_index";
import { getAuth } from "@clerk/react-router/ssr.server";
import { redirect } from "react-router";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (userId) {
    return redirect("/dashboard");
  }
}

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
