"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import PuzzleProgressBar from "./PuzzleProgressBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
// puzzle data to simulate data coming in
const puzzleData = {
  title: "Simple Math",
  puzzleNumber: 3,
  level: "Easy",
  levelReward: "Starknet Beginner NFT",
  puzzle:
    "How many  confirmations are typically recommended for StarkNet transactions?",
  hint: "StarkNet has faster finality than most L1s",
  completedPuzzles: 2,
  totalPuzzles: 8,
};

const PuzzleComponent = () => {
  const [showHint, setShowHint] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleShowHint = () => {
    setShowHint((prev) => !prev);
  };

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
    if (error) setError("");
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError("Please enter an answer before submitting.");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    setConfirmOpen(false);
    // proceed with real submission once wired to the backend
  };
  return (
    <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="text-lg text-[#BA7FF4] font-semibold">
          {puzzleData.level} - Puzzle {puzzleData.puzzleNumber}:{" "}
          {puzzleData.title}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-gray-300">
          Level Reward: {puzzleData.levelReward}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PuzzleProgressBar
          completed={puzzleData.completedPuzzles}
          total={puzzleData.totalPuzzles}
        />
        <form className="space-y-6" onSubmit={handleSubmitClick}>
          <label htmlFor="puzzle">{puzzleData.puzzle}</label>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your answer"
              className="bg-white/5 border-white/20 text-white"
              value={answer}
              onChange={handleAnswerChange}
              aria-invalid={!!error}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Submit Answer
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/20 text-white bg-transparent hover:text-white hover:bg-white/10"
              onClick={handleShowHint}
            >
              Need a Hint?
            </Button>
          </div>

          {showHint && (
            <p className="flex items-center mx-auto text-center">
              {puzzleData.hint}
            </p>
          )}
        </form>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit this answer?</DialogTitle>
            <DialogDescription>
              You&apos;re about to submit &quot;{answer}&quot;. This can&apos;t be
              undone if it&apos;s correct.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSubmit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PuzzleComponent;
