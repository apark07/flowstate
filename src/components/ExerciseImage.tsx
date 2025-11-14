import { useState, useEffect } from 'react';

interface ExerciseImageProps {
  exerciseId: string;
  alt: string;
  className?: string;
}

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export default function ExerciseImage({ exerciseId, alt, className }: ExerciseImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);
        const url = `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseId}&resolution=180`;
        
        const response = await fetch(url, {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
        setLoading(false);
      }
    };

    if (exerciseId) {
      fetchImage();
    }

    // Cleanup: revoke object URL when component unmounts
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [exerciseId]);

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
    />
  );
}