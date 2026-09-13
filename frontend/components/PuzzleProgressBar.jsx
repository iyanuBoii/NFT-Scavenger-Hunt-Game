"use client";

/**
 * Shows how many puzzles a player has completed out of the total available,
 * as a labelled progress bar.
 */
const PuzzleProgressBar = ({ completed, total }) => {
  const safeTotal = total > 0 ? total : 0;
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal || completed);
  const percentage = safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  const isComplete = safeTotal > 0 && safeCompleted >= safeTotal;

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between text-xs md:text-sm text-gray-300 mb-1">
        <span>Progress</span>
        <span aria-live="polite">
          {isComplete
            ? `All ${safeTotal} puzzles completed!`
            : `${safeCompleted} / ${safeTotal} puzzles completed`}
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full bg-white/10 overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Puzzles completed"
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${
            isComplete
              ? "from-green-400 to-emerald-500"
              : "from-purple-500 to-pink-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default PuzzleProgressBar;
