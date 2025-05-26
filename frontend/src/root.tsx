import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import type { Route } from "./+types/root";
import { ClerkProvider } from "@clerk/react-router";
import { useNavigation } from "react-router";
import GlobalSpinner from "./components/shared/GlobalSpinner";
import { useDebounce } from "use-debounce";

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args);
}

export function Layout({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();

  const [debouncedIsNavigating] = useDebounce(
    Boolean(navigation.location),
    300,
  );

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
        <Meta />
        <Links />
      </head>
      <body>
        {debouncedIsNavigating && <GlobalSpinner size="large" />}
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider loaderData={loaderData} afterSignOutUrl={"/"}>
      <Outlet />
    </ClerkProvider>
  );
}
