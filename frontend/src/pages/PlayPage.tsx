import { useParams } from 'react-router-dom';

export function PlayPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-center">
        {slug === 'typeracer' ? 'TypeRacer' : slug}
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Game coming soon...
      </p>
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-lg">
          The {slug} game engine is not yet implemented.
        </p>
        <p className="text-gray-500 mt-2">
          Check back later!
        </p>
      </div>
    </div>
  );
}
