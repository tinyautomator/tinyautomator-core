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
        <title>Tiny Automator</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <Meta />
        <Links />
      </head>
      <body>
        {debouncedIsNavigating && <GlobalSpinner />}
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
