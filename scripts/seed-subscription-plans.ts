import { connectToDatabase } from '../lib/mongodb';
import { SubscriptionPlan } from '../models/Subscription';

async function seedSubscriptionPlans() {
  try {
    await connectToDatabase();

    const plans = [
      {
        planId: 'free',
        name: 'Free Plan',
        description: 'Basic access to the platform with limited features',
        planType: 'free',
        monthlyPrice: 0,
        quarterlyPrice: 0,
        yearlyPrice: 0,
        currency: 'USD',
        features: {
          maxApplications: 3,
          maxDocuments: 5,
          maxRecommendations: 2,
          aiFeatures: false,
          prioritySupport: false,
          customBranding: false,
          advancedAnalytics: false,
          apiAccess: false,
        },
        limits: {
          storageGB: 1,
          apiCallsPerMonth: 100,
          teamMembers: 1,
        },
        isActive: true,
        isPopular: false,
      },
      {
        planId: 'basic',
        name: 'Basic Plan',
        description: 'Perfect for individual students and professionals',
        planType: 'basic',
        monthlyPrice: 9.99,
        quarterlyPrice: 26.99, // 10% discount
        yearlyPrice: 99.99, // 17% discount
        currency: 'USD',
        features: {
          maxApplications: 10,
          maxDocuments: 20,
          maxRecommendations: 5,
          aiFeatures: true,
          prioritySupport: false,
          customBranding: false,
          advancedAnalytics: false,
          apiAccess: false,
        },
        limits: {
          storageGB: 5,
          apiCallsPerMonth: 500,
          teamMembers: 1,
        },
        isActive: true,
        isPopular: true,
      },
      {
        planId: 'premium',
        name: 'Premium Plan',
        description: 'Advanced features for serious applicants and professionals',
        planType: 'premium',
        monthlyPrice: 19.99,
        quarterlyPrice: 53.99, // 10% discount
        yearlyPrice: 199.99, // 17% discount
        currency: 'USD',
        features: {
          maxApplications: 50,
          maxDocuments: 100,
          maxRecommendations: 15,
          aiFeatures: true,
          prioritySupport: true,
          customBranding: false,
          advancedAnalytics: true,
          apiAccess: false,
        },
        limits: {
          storageGB: 20,
          apiCallsPerMonth: 2000,
          teamMembers: 3,
        },
        isActive: true,
        isPopular: false,
      },
      {
        planId: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Full-featured plan for institutions and large organizations',
        planType: 'enterprise',
        monthlyPrice: 49.99,
        quarterlyPrice: 134.99, // 10% discount
        yearlyPrice: 499.99, // 17% discount
        currency: 'USD',
        features: {
          maxApplications: -1, // Unlimited
          maxDocuments: -1, // Unlimited
          maxRecommendations: -1, // Unlimited
          aiFeatures: true,
          prioritySupport: true,
          customBranding: true,
          advancedAnalytics: true,
          apiAccess: true,
        },
        limits: {
          storageGB: 100,
          apiCallsPerMonth: 10000,
          teamMembers: 10,
        },
        isActive: true,
        isPopular: false,
      },
      // African market plans with local currencies
      {
        planId: 'basic-ngn',
        name: 'Basic Plan (Nigeria)',
        description: 'Perfect for Nigerian students and professionals',
        planType: 'basic',
        monthlyPrice: 5000, // NGN
        quarterlyPrice: 13500, // 10% discount
        yearlyPrice: 50000, // 17% discount
        currency: 'NGN',
        features: {
          maxApplications: 10,
          maxDocuments: 20,
          maxRecommendations: 5,
          aiFeatures: true,
          prioritySupport: false,
          customBranding: false,
          advancedAnalytics: false,
          apiAccess: false,
        },
        limits: {
          storageGB: 5,
          apiCallsPerMonth: 500,
          teamMembers: 1,
        },
        isActive: true,
        isPopular: true,
      },
      {
        planId: 'premium-ngn',
        name: 'Premium Plan (Nigeria)',
        description: 'Advanced features for serious Nigerian applicants',
        planType: 'premium',
        monthlyPrice: 10000, // NGN
        quarterlyPrice: 27000, // 10% discount
        yearlyPrice: 100000, // 17% discount
        currency: 'NGN',
        features: {
          maxApplications: 50,
          maxDocuments: 100,
          maxRecommendations: 15,
          aiFeatures: true,
          prioritySupport: true,
          customBranding: false,
          advancedAnalytics: true,
          apiAccess: false,
        },
        limits: {
          storageGB: 20,
          apiCallsPerMonth: 2000,
          teamMembers: 3,
        },
        isActive: true,
        isPopular: false,
      },
      {
        planId: 'basic-ghs',
        name: 'Basic Plan (Ghana)',
        description: 'Perfect for Ghanaian students and professionals',
        planType: 'basic',
        monthlyPrice: 120, // GHS
        quarterlyPrice: 324, // 10% discount
        yearlyPrice: 1200, // 17% discount
        currency: 'GHS',
        features: {
          maxApplications: 10,
          maxDocuments: 20,
          maxRecommendations: 5,
          aiFeatures: true,
          prioritySupport: false,
          customBranding: false,
          advancedAnalytics: false,
          apiAccess: false,
        },
        limits: {
          storageGB: 5,
          apiCallsPerMonth: 500,
          teamMembers: 1,
        },
        isActive: true,
        isPopular: true,
      },
      {
        planId: 'premium-ghs',
        name: 'Premium Plan (Ghana)',
        description: 'Advanced features for serious Ghanaian applicants',
        planType: 'premium',
        monthlyPrice: 240, // GHS
        quarterlyPrice: 648, // 10% discount
        yearlyPrice: 2400, // 17% discount
        currency: 'GHS',
        features: {
          maxApplications: 50,
          maxDocuments: 100,
          maxRecommendations: 15,
          aiFeatures: true,
          prioritySupport: true,
          customBranding: false,
          advancedAnalytics: true,
          apiAccess: false,
        },
        limits: {
          storageGB: 20,
          apiCallsPerMonth: 2000,
          teamMembers: 3,
        },
        isActive: true,
        isPopular: false,
      },
    ];

    for (const planData of plans) {
      const existingPlan = await SubscriptionPlan.findOne({ planId: planData.planId });
      
      if (existingPlan) {
        console.log(`Plan ${planData.planId} already exists, updating...`);
        await SubscriptionPlan.findOneAndUpdate(
          { planId: planData.planId },
          planData,
          { new: true }
        );
      } else {
        console.log(`Creating plan ${planData.planId}...`);
        const plan = new SubscriptionPlan(planData);
        await plan.save();
      }
    }

    console.log('✅ Subscription plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    process.exit(1);
  }
}

seedSubscriptionPlans();