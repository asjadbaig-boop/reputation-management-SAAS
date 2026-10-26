export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <p className="text-lg">
        Review Engine — admin at <a href="/admin" className="underline">/admin</a>, client login at{" "}
        <a href="/dashboard" className="underline">/dashboard</a>
      </p>
    </main>
  );
}
