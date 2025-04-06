import type { Route } from "../routes/+types/posts.ssr";

type Post = {
  id: number;
  title: string;
  body: string;
};

export async function loader(): Promise<Post[]> {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=5",
  );
  const data = await res.json();
  return data;
}

export default function PostsPage({ loaderData }: Route.ComponentProps) {
  const posts = loaderData;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Latest Posts! (SSR)</h1>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id} className="p-3 border rounded shadow">
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="text-sm text-gray-700">{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
