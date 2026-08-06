"use client";

import { useEffect } from "react";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    // エラーをレポートサービスへ記録する
    console.error(error);
  }, [error]);

  return (
    <>
      <h1>Something went wrong</h1>
      <p>{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} type="button">
        Try again
      </button>
    </>
  );
};

export default ErrorPage;
