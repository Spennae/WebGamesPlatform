import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-8xl font-bold text-accent-blue">404</span>
        </div>
        <h1 className="text-2xl font-semibold text-text-primary mb-4">
          Page Not Found
        </h1>
        <p className="text-text-secondary mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
