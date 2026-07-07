'use client';

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="home-page home-page--error">
      <p>{error.message || "Couldn't load the page content."}</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
