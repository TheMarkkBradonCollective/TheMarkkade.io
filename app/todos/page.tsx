import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <main style={{ padding: "2rem", fontFamily: "Manrope, sans-serif" }}>
      <h1>Supabase todos</h1>
      <p>Connected via `@/utils/supabase/server`.</p>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
      {!todos?.length ? <p>No todos yet (or the table is empty / unavailable).</p> : null}
    </main>
  );
}
