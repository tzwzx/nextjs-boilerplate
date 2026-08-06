"use client";

const GlobalError = ({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <html lang="ja">
    <body>
      <main>
        <h1>Something went wrong</h1>
        <button onClick={reset} type="button">
          Try again
        </button>
      </main>
    </body>
  </html>
);

export default GlobalError;
