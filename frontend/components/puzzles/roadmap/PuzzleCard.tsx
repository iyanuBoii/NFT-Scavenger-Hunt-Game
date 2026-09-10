import Image from 'next/image';
import { format } from 'date-fns';
import { Puzzle } from './PuzzleTimeline';

type Props = {
  puzzle: Puzzle;
};

export default function PuzzleCard({ puzzle }: Props) {
  const { title, description, imageUrl, releaseDate } = puzzle;
  const isUpcoming = new Date(releaseDate) > new Date();

  return (
    <div className="bg-white text-gray-900 rounded-2xl shadow-lg w-[min(85vw,280px)] sm:w-[320px] p-4 flex flex-col items-center hover:scale-105 transition-transform duration-300">
      <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 85vw, 320px"
          className="rounded-xl object-cover"
        />
      </div>
      <h2 className="text-xl font-semibold mb-1 text-center">{title}</h2>
      <p className="text-sm text-center mb-2">{description}</p>
      <div className="text-xs text-gray-600">
        {isUpcoming
          ? `Coming on ${format(new Date(releaseDate), 'PPP')}`
          : 'Released'}
      </div>
    </div>
  );
}
