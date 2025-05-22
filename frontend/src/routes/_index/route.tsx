import App from '../../App';
import { Route } from './+types/route';
import { getAuth } from '@clerk/react-router/ssr.server';
import { redirect } from 'react-router';

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (userId) {
    return redirect('/dashboard');
  }
}

export default function Component() {
  return (
    <>
      <App />;
    </>
  );
}
