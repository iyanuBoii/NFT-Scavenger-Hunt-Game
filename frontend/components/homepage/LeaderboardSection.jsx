import React from "react";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Crown,
  Medal,
  ArrowRight,
  Sparkles,
  Flame,
  Star,
} from "lucide-react";
import Link from "next/link";
import PlayerCard from '@/components/leaderboard/PlayerCard';

const LeaderboardSection = () => {
  const topPlayers = [
    {
      name: "CryptoMaster",
      score: 156750,
      level: 42,
      challenges: 156,
      nfts: 23,
      streak: 15,
    },
    {
      name: "BlockNinja",
      score: 142300,
      level: 38,
      challenges: 143,
      nfts: 19,
      streak: 7,
    },
    {
      name: "StarkHunter",
      score: 138900,
      level: 35,
      challenges: 128,
      nfts: 17,
      streak: 12,
    },
    {
      name: "Web3Explorer",
      score: 125400,
      level: 31,
      challenges: 115,
      nfts: 15,
      streak: 0,
    },
    {
      name: "RiddleSolver",
      score: 118200,
      level: 29,
      challenges: 108,
      nfts: 14,
      streak: 5,
    },
  ];
  
  const rankings = [
    {
      position: "1st Place",
      reward: "5,000 STARK + Legendary NFT",
      status: "Top Global Ranking",
      icon: <Crown className="w-8 h-8 text-yellow-400 mb-4" />,
      bgFrom: "from-yellow-500/10",
      bgTo: "to-amber-500/10",
      border: "border-yellow-500/20",
      textColor: "text-yellow-400",
    },
    {
      position: "2nd Place",
      reward: "3,000 STARK + Epic NFT",
      status: "Elite Hunter Status",
      icon: <Medal className="w-8 h-8 text-slate-400 mb-4" />,
      bgFrom: "from-slate-500/10",
      bgTo: "to-slate-400/10",
      border: "border-slate-400/20",
      textColor: "text-slate-400",
    },
    {
      position: "3rd Place",
      reward: "2,000 STARK + Rare NFT",
      status: "Master Hunter Badge",
      icon: <Medal className="w-8 h-8 text-amber-700 mb-4" />,
      bgFrom: "from-amber-900/10",
      bgTo: "to-amber-700/10",
      border: "border-amber-700/20",
      textColor: "text-amber-700",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto my-24 px-6">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            Top Hunters
          </h2>
          <p className="text-gray-400">
            The most skilled treasure hunters in the StarkNet realm
          </p>
        </div>
        <Button
          asChild
          className="hidden sm:flex items-center space-x-2 bg-white/10 hover:bg-white/20"
        >
          <Link href="/leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            View Full Leaderboard
          </Link>
        </Button>
      </div>

      {/* Prize Pool Banner */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Monthly Prize Pool
              </h3>
              <p className="text-gray-400">
                Top hunters share rewards each month
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
              10,000 STARK
            </div>
            <div className="text-sm text-gray-400">≈ $5,000 USD</div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        {topPlayers.length > 0 ? (
          topPlayers.map((player, index) => (
            <PlayerCard key={index} player={player} rank={index + 1} />
          ))
        ) : (
          <div className="text-center py-12 px-6 rounded-lg bg-white/5 border border-white/10">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-500" />
            <p className="text-white font-medium">No rankings yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Complete a puzzle to claim the top spot on this leaderboard.
            </p>
          </div>
        )}
      </div>

      {/* Mobile CTA */}
      <div className="mt-8 sm:hidden">
        <Button className="w-full bg-white/10 hover:bg-white/20">
          <Trophy className="w-4 h-4 mr-2" />
          View Full Leaderboard
        </Button>
      </div>

      {/* Rank Rewards */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
      {rankings.map((rank, index) => (
        <div
          key={index}
          className={`p-6 rounded-xl bg-gradient-to-r ${rank.bgFrom} ${rank.bgTo} border ${rank.border}`}
        >
          {rank.icon}
          <h3 className="text-lg font-bold text-white mb-2">{rank.position}</h3>
          <p className="text-gray-400 mb-4">{rank.reward}</p>
          <div className={`text-sm ${rank.textColor}`}>{rank.status}</div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default LeaderboardSection;
