'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, TrendingUp } from 'lucide-react';

interface TokenDisplayProps {
  tokens: number;
  totalTokensEarned: number;
  totalTokensSpent: number;
}

export default function TokenDisplay({ tokens, totalTokensEarned, totalTokensSpent }: TokenDisplayProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-yellow-600" />
          Token Balance
        </CardTitle>
        <CardDescription>
          Your current token balance and earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {tokens}
          </div>
          <p className="text-sm text-muted-foreground">Available Tokens</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {totalTokensEarned}
            </div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">
              {totalTokensSpent}
            </div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Earn tokens through activities
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}