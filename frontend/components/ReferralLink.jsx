import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Share2, Award } from "lucide-react";

const ReferralLink = ({ referralLink }) => {
  const [copied, setCopied] = useState(false);

  const legacyCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);
    return succeeded;
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralLink);
      } else if (!legacyCopy(referralLink)) {
        throw new Error("execCommand copy failed");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join NFT Scavenger Hunt!",
          text: "I'm playing this amazing NFT scavenger hunt game. Join me and earn exclusive rewards!",
          url: referralLink
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  return (
    <Card className="backdrop-blur-lg bg-white/10 border-white/20 p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Referral Link</h2>
        <p className="text-gray-300">Share this link with friends to earn rewards when they join!</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <Input
            value={referralLink}
            readOnly
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            onClick={shareReferral}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Reward Info */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <div className="flex items-center space-x-3">
          <Award className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-white font-medium">Rewards for each successful referral:</p>
            <p className="text-gray-300 text-sm">• 50 XP bonus • Rare NFT chance • Exclusive badge</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReferralLink; 