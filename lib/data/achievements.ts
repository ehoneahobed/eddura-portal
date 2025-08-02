import { IAchievement } from '@/models/Achievement';

export const predefinedAchievements: Omit<IAchievement, '_id' | 'createdAt' | 'updatedAt'>[] = [
  // Squad Achievements
  {
    name: 'Squad Pioneer',
    description: 'Create your first squad and start collaborating with peers',
    category: 'squad',
    icon: '🏆',
    color: '#FFD700',
    requirements: {
      type: 'count',
      target: 1,
      metric: 'squads_created',
      timeframe: 'all_time'
    },
    rewards: {
      points: 100,
      badges: ['squad_pioneer'],
      tokens: 50,
      specialAccess: []
    },
    isActive: true,
    isHidden: false,
    rarity: 'common'
  },
  {
    name: 'Squad Leader',
    description: 'Lead a squad to complete 5 goals successfully',
    category: 'squad',
    icon: '👑',
    color: '#C0C0C0',
    requirements: {
      type: 'count',
      target: 5,
      metric: 'squad_goals_completed',
      timeframe: 'all_time'
    },
    rewards: {
      points: 250,
      badges: ['squad_leader'],
      tokens: 100,
      specialAccess: ['squad_analytics']
    },
    isActive: true,
    isHidden: false,
    rarity: 'uncommon'
  },
  {
    name: 'Squad Master',
    description: 'Achieve 100% completion on all squad goals for 3 consecutive months',
    category: 'squad',
    icon: '💎',
    color: '#FF6B6B',
    requirements: {
      type: 'streak',
      target: 3,
      metric: 'squad_perfect_months',
      timeframe: 'monthly'
    },
    rewards: {
      points: 500,
      badges: ['squad_master'],
      tokens: 200,
      specialAccess: ['premium_squad_features']
    },
    isActive: true,
    isHidden: false,
    rarity: 'rare'
  },

  // Document Achievements
  {
    name: 'Document Creator',
    description: 'Create your first document on the platform',
    category: 'document',
    icon: '📄',
    color: '#4CAF50',
    requirements: {
      type: 'count',
      target: 1,
      metric: 'documents_created',
      timeframe: 'all_time'
    },
    rewards: {
      points: 50,
      badges: ['document_creator'],
      tokens: 25,
      specialAccess: []
    },
    isActive: true,
    isHidden: false,
    rarity: 'common'
  },
  {
    name: 'Document Expert',
    description: 'Create 10 documents and help others with 5 peer reviews',
    category: 'document',
    icon: '📚',
    color: '#2196F3',
    requirements: {
      type: 'completion',
      target: 1,
      metric: 'document_expert_combo',
      timeframe: 'all_time'
    },
    rewards: {
      points: 300,
      badges: ['document_expert'],
      tokens: 150,
      specialAccess: ['advanced_document_tools']
    },
    isActive: true,
    isHidden: false,
    rarity: 'uncommon'
  },
  {
    name: 'Document Master',
    description: 'Create 50 documents and provide 25 peer reviews',
    category: 'document',
    icon: '🏛️',
    color: '#9C27B0',
    requirements: {
      type: 'completion',
      target: 1,
      metric: 'document_master_combo',
      timeframe: 'all_time'
    },
    rewards: {
      points: 750,
      badges: ['document_master'],
      tokens: 300,
      specialAccess: ['document_analytics', 'priority_support']
    },
    isActive: true,
    isHidden: false,
    rarity: 'epic'
  },

  // Application Achievements
  {
    name: 'Application Starter',
    description: 'Start your first application',
    category: 'application',
    icon: '📝',
    color: '#FF9800',
    requirements: {
      type: 'count',
      target: 1,
      metric: 'applications_started',
      timeframe: 'all_time'
    },
    rewards: {
      points: 75,
      badges: ['application_starter'],
      tokens: 40,
      specialAccess: []
    },
    isActive: true,
    isHidden: false,
    rarity: 'common'
  },
  {
    name: 'Application Pro',
    description: 'Start 10 applications and complete 5 of them',
    category: 'application',
    icon: '🎯',
    color: '#E91E63',
    requirements: {
      type: 'completion',
      target: 1,
      metric: 'application_pro_combo',
      timeframe: 'all_time'
    },
    rewards: {
      points: 400,
      badges: ['application_pro'],
      tokens: 200,
      specialAccess: ['application_templates']
    },
    isActive: true,
    isHidden: false,
    rarity: 'uncommon'
  },
  {
    name: 'Application Master',
    description: 'Start 25 applications and complete 15 of them',
    category: 'application',
    icon: '🏆',
    color: '#FF5722',
    requirements: {
      type: 'completion',
      target: 1,
      metric: 'application_master_combo',
      timeframe: 'all_time'
    },
    rewards: {
      points: 1000,
      badges: ['application_master'],
      tokens: 500,
      specialAccess: ['premium_application_features', 'priority_support']
    },
    isActive: true,
    isHidden: false,
    rarity: 'legendary'
  },

  // Review Achievements
  {
    name: 'Helpful Peer',
    description: 'Provide your first peer review',
    category: 'review',
    icon: '🤝',
    color: '#4CAF50',
    requirements: {
      type: 'count',
      target: 1,
      metric: 'peer_reviews_provided',
      timeframe: 'all_time'
    },
    rewards: {
      points: 100,
      badges: ['helpful_peer'],
      tokens: 50,
      specialAccess: []
    },
    isActive: true,
    isHidden: false,
    rarity: 'common'
  },
  {
    name: 'Review Expert',
    description: 'Provide 10 peer reviews with an average rating of 4.5+ stars',
    category: 'review',
    icon: '⭐',
    color: '#FFC107',
    requirements: {
      type: 'completion',
      target: 1,
      metric: 'review_expert_combo',
      timeframe: 'all_time'
    },
    rewards: {
      points: 500,
      badges: ['review_expert'],
      tokens: 250,
      specialAccess: ['review_analytics']
    },
    isActive: true,
    isHidden: false,
    rarity: 'uncommon'
  },
  {
    name: 'Review Master',
    description: 'Provide 50 peer reviews with an average rating of 4.8+ stars',
    category: 'review',
    icon: '👑',
    color: '#9C27B0',
    requirements: {
      type: 'completion',
      target: 1,
      metric: 'review_master_combo',
      timeframe: 'all_time'
    },
    rewards: {
      points: 1500,
      badges: ['review_master'],
      tokens: 750,
      specialAccess: ['premium_review_features', 'review_mentor']
    },
    isActive: true,
    isHidden: false,
    rarity: 'legendary'
  },

  // Streak Achievements
  {
    name: 'Week Warrior',
    description: 'Stay active for 7 consecutive days',
    category: 'streak',
    icon: '🔥',
    color: '#FF5722',
    requirements: {
      type: 'streak',
      target: 7,
      metric: 'days_active',
      timeframe: 'daily'
    },
    rewards: {
      points: 200,
      badges: ['week_warrior'],
      tokens: 100,
      specialAccess: []
    },
    isActive: true,
    isHidden: false,
    rarity: 'common'
  },
  {
    name: 'Month Master',
    description: 'Stay active for 30 consecutive days',
    category: 'streak',
    icon: '🔥🔥',
    color: '#E91E63',
    requirements: {
      type: 'streak',
      target: 30,
      metric: 'days_active',
      timeframe: 'daily'
    },
    rewards: {
      points: 750,
      badges: ['month_master'],
      tokens: 350,
      specialAccess: ['streak_analytics']
    },
    isActive: true,
    isHidden: false,
    rarity: 'uncommon'
  },
  {
    name: 'Streak Legend',
    description: 'Stay active for 100 consecutive days',
    category: 'streak',
    icon: '🔥🔥🔥',
    color: '#9C27B0',
    requirements: {
      type: 'streak',
      target: 100,
      metric: 'days_active',
      timeframe: 'daily'
    },
    rewards: {
      points: 2000,
      badges: ['streak_legend'],
      tokens: 1000,
      specialAccess: ['legendary_features', 'priority_support']
    },
    isActive: true,
    isHidden: false,
    rarity: 'legendary'
  },

  // Milestone Achievements
  {
    name: 'First Steps',
    description: 'Complete your first quiz and create your first document',
    category: 'milestone',
    icon: '👣',
    color: '#4CAF50',
    requirements: {
      type: 'completion',
      target: 1,
      metric: 'first_steps_combo',
      timeframe: 'all_time'
    },
    rewards: {
      points: 150,
      badges: ['first_steps'],
      tokens: 75,
      specialAccess: []
    },
    isActive: true,
    isHidden: false,
    rarity: 'common'
  },
  {
    name: 'Platform Explorer',
    description: 'Use all major platform features: quiz, documents, applications, reviews, and squads',
    category: 'milestone',
    icon: '🗺️',
    color: '#2196F3',
    requirements: {
      type: 'completion',
      target: 1,
      metric: 'platform_explorer_combo',
      timeframe: 'all_time'
    },
    rewards: {
      points: 600,
      badges: ['platform_explorer'],
      tokens: 300,
      specialAccess: ['advanced_features']
    },
    isActive: true,
    isHidden: false,
    rarity: 'uncommon'
  },
  {
    name: 'Eddura Master',
    description: 'Achieve excellence in all platform areas and maintain high activity for 6 months',
    category: 'milestone',
    icon: '🏆',
    color: '#FFD700',
    requirements: {
      type: 'completion',
      target: 1,
      metric: 'eddura_master_combo',
      timeframe: 'all_time'
    },
    rewards: {
      points: 5000,
      badges: ['eddura_master'],
      tokens: 2500,
      specialAccess: ['master_features', 'exclusive_content', 'priority_support']
    },
    isActive: true,
    isHidden: false,
    rarity: 'legendary'
  }
];

export const getAchievementByMetric = (metric: string) => {
  return predefinedAchievements.find(achievement => 
    achievement.requirements.metric === metric
  );
};

export const getAchievementsByCategory = (category: string) => {
  return predefinedAchievements.filter(achievement => 
    achievement.category === category
  );
};

export const getAchievementsByRarity = (rarity: string) => {
  return predefinedAchievements.filter(achievement => 
    achievement.rarity === rarity
  );
};