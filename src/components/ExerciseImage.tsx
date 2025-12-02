import { useState, useEffect } from 'react';

interface ExerciseImageProps {
  exerciseId: string;
  alt: string;
  className?: string;
  gifUrl: string; // ADDED: Now accepts the image URL directly
}

// Removed RAPIDAPI_KEY and direct API fetch

export default function ExerciseImage({ exerciseId, alt, className, gifUrl }: ExerciseImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // We now assume the gifUrl is a direct link (either to a real image or a placeholder)
  useEffect(() => {
    // Basic image loading check logic for loading/error states
    if (!gifUrl) {
      setError(true);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(false);

    const img = new Image();
    img.onload = () => setLoading(false);
    img.onerror = () => {
      console.error(`Error loading image for ID ${exerciseId} at URL: ${gifUrl}`);
      setError(true);
      setLoading(false);
    };
    img.src = gifUrl;
    
    // NOTE: Object URL cleanup is no longer needed since we are using a direct URL.
    // If you were generating a new URL (like createObjectURL), you would include a cleanup.

  }, [gifUrl, exerciseId]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !gifUrl) {
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
      src={gifUrl}
      alt={alt}
      className={className}
    />
  );
}