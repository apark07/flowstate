import { useState, useEffect } from 'react';

interface ExerciseImageProps {
  exerciseId: string;
  gifUrl: string; // Now directly passed from exercise data
  alt: string;
  className?: string;
}

export default function ExerciseImage({ exerciseId, gifUrl, alt, className }: ExerciseImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(gifUrl);
  const [loading, setLoading] = useState(!gifUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!gifUrl) {
      setError(true);
      setLoading(false);
      return;
    }

    setImageSrc(gifUrl);
    setLoading(false);
    setError(false);
  }, [gifUrl, exerciseId]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200`}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🏋️</div>
          <p className="text-sm text-gray-600">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        setError(true);
      }}
    />
  );
}