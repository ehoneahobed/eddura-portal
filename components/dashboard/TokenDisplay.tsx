"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, TrendingUp, TrendingDown } from 'lucide-react';

interface TokenDisplayProps {
  tokens: number;
  totalTokensEarned: number;
  totalTokensSpent: number;
}

export default function TokenDisplay({ tokens, totalTokensEarned, totalTokensSpent }: TokenDisplayProps) {
  const net = Math.max(0, totalTokensEarned - totalTokensSpent);
  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-[var(--eddura-primary)] to-[var(--eddura-primary-600)] dark:from-[var(--eddura-primary-800)] dark:to-[var(--eddura-primary-700)]">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.6), transparent 30%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.4), transparent 35%)' }} />
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-white" />
          Token Balance
        </CardTitle>
        <CardDescription className="text-white/80">
          Your Eddura rewards and earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-5">
        <div className="text-center">
          <div className="inline-flex items-baseline gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg">
            <span className="text-4xl font-extrabold text-white tracking-tight">{tokens}</span>
            <span className="text-sm text-white/80">Available Tokens</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-white/10 border border-white/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-white" />
              <span className="text-lg font-semibold text-white">{totalTokensEarned}</span>
            </div>
            <p className="text-xs text-white/80">Total Earned</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/10 border border-white/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-white" />
              <span className="text-lg font-semibold text-white">{totalTokensSpent}</span>
            </div>
            <p className="text-xs text-white/80">Total Spent</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/10 border border-white/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-white" />
              <span className="text-lg font-semibold text-white">{net}</span>
            </div>
            <p className="text-xs text-white/80">Net</p>
          </div>
        </div>

        <div className="text-center">
          <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">
            Earn tokens by completing tasks and referring friends
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}