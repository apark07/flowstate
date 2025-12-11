interface LandingPageCardProps {
  image: string;
  text: string;
  subtext: string;
}
    
export default function LandingPageCard({image, text, subtext}: LandingPageCardProps) {
  return (
<div className="flex flex-col rounded-lg overflow-hidden border border-gray-100">
              <div className="h-80 w-full">
                <img src={image} alt={text} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{text}</h3>
                <p className="mt-2 text-sm text-gray-600">{subtext}</p>
              </div>
    </div>
  )
}
