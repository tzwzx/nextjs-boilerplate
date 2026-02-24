"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <p>{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} type="button">
        Try again
      </button>
    </main>
  );
}
