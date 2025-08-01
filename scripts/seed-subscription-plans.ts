import { connectToDatabase } from '../lib/mongodb';
import { SubscriptionPlan } from '../models/Subscription';

async function seedSubscriptionPlans() {
  try {
    await connectToDatabase();

    const plans = [
      {
        planId: 'free',
        name: 'Free Plan',
        description: 'Basic access to the platform with essential features',
        planType: 'free',
        monthlyPrice: 0,
        quarterlyPrice: 0,
        yearlyPrice: 0,
        currency: 'USD',
        features: {
          // Core Platform Features
          maxApplications: 3,
          maxDocuments: 5,
          maxRecommendations: 2,
          maxScholarships: 10,
          maxPrograms: 5,
          maxSchools: 5,
          
          // Document Management
          documentLibrary: true,
          documentTemplates: false,
          documentSharing: false,
          documentFeedback: false,
          documentRating: false,
          documentCloning: false,
          
          // AI Features
          aiFeatures: false,
          aiContentRefinement: false,
          aiReview: false,
          aiRecommendations: false,
          
          // Advanced Features
          prioritySupport: false,
          customBranding: false,
          advancedAnalytics: false,
          apiAccess: false,
          bulkOperations: false,
          exportFeatures: false,
          
          // Communication
          messaging: false,
          emailNotifications: true,
          telegramBot: false,
          
          // Content Management
          contentManagement: false,
          applicationTemplates: false,
          requirementsTemplates: false,
          
          // Task Management
          taskManagement: false,
          progressTracking: false,
          
          // Quiz & Assessment
          careerQuiz: true,
          aiAnalysis: false,
          personalizedInsights: false,
        },
        limits: {
          storageGB: 1,
          apiCallsPerMonth: 100,
          teamMembers: 1,
          documentSizeMB: 10,
          searchQueriesPerMonth: 50,
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
          // Core Platform Features
          maxApplications: 10,
          maxDocuments: 20,
          maxRecommendations: 5,
          maxScholarships: 50,
          maxPrograms: 20,
          maxSchools: 20,
          
          // Document Management
          documentLibrary: true,
          documentTemplates: true,
          documentSharing: true,
          documentFeedback: true,
          documentRating: true,
          documentCloning: true,
          
          // AI Features
          aiFeatures: true,
          aiContentRefinement: true,
          aiReview: false,
          aiRecommendations: true,
          
          // Advanced Features
          prioritySupport: false,
          customBranding: false,
          advancedAnalytics: false,
          apiAccess: false,
          bulkOperations: true,
          exportFeatures: true,
          
          // Communication
          messaging: true,
          emailNotifications: true,
          telegramBot: false,
          
          // Content Management
          contentManagement: false,
          applicationTemplates: true,
          requirementsTemplates: true,
          
          // Task Management
          taskManagement: true,
          progressTracking: true,
          
          // Quiz & Assessment
          careerQuiz: true,
          aiAnalysis: true,
          personalizedInsights: true,
        },
        limits: {
          storageGB: 5,
          apiCallsPerMonth: 500,
          teamMembers: 1,
          documentSizeMB: 25,
          searchQueriesPerMonth: 200,
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
          // Core Platform Features
          maxApplications: 50,
          maxDocuments: 100,
          maxRecommendations: 15,
          maxScholarships: 200,
          maxPrograms: 100,
          maxSchools: 100,
          
          // Document Management
          documentLibrary: true,
          documentTemplates: true,
          documentSharing: true,
          documentFeedback: true,
          documentRating: true,
          documentCloning: true,
          
          // AI Features
          aiFeatures: true,
          aiContentRefinement: true,
          aiReview: true,
          aiRecommendations: true,
          
          // Advanced Features
          prioritySupport: true,
          customBranding: false,
          advancedAnalytics: true,
          apiAccess: false,
          bulkOperations: true,
          exportFeatures: true,
          
          // Communication
          messaging: true,
          emailNotifications: true,
          telegramBot: true,
          
          // Content Management
          contentManagement: true,
          applicationTemplates: true,
          requirementsTemplates: true,
          
          // Task Management
          taskManagement: true,
          progressTracking: true,
          
          // Quiz & Assessment
          careerQuiz: true,
          aiAnalysis: true,
          personalizedInsights: true,
        },
        limits: {
          storageGB: 20,
          apiCallsPerMonth: 2000,
          teamMembers: 3,
          documentSizeMB: 50,
          searchQueriesPerMonth: 1000,
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
          // Core Platform Features
          maxApplications: -1, // Unlimited
          maxDocuments: -1, // Unlimited
          maxRecommendations: -1, // Unlimited
          maxScholarships: -1, // Unlimited
          maxPrograms: -1, // Unlimited
          maxSchools: -1, // Unlimited
          
          // Document Management
          documentLibrary: true,
          documentTemplates: true,
          documentSharing: true,
          documentFeedback: true,
          documentRating: true,
          documentCloning: true,
          
          // AI Features
          aiFeatures: true,
          aiContentRefinement: true,
          aiReview: true,
          aiRecommendations: true,
          
          // Advanced Features
          prioritySupport: true,
          customBranding: true,
          advancedAnalytics: true,
          apiAccess: true,
          bulkOperations: true,
          exportFeatures: true,
          
          // Communication
          messaging: true,
          emailNotifications: true,
          telegramBot: true,
          
          // Content Management
          contentManagement: true,
          applicationTemplates: true,
          requirementsTemplates: true,
          
          // Task Management
          taskManagement: true,
          progressTracking: true,
          
          // Quiz & Assessment
          careerQuiz: true,
          aiAnalysis: true,
          personalizedInsights: true,
        },
        limits: {
          storageGB: 100,
          apiCallsPerMonth: 10000,
          teamMembers: 10,
          documentSizeMB: 100,
          searchQueriesPerMonth: -1, // Unlimited
        },
        isActive: true,
        isPopular: false,
      },
      // Regional plans with local currencies
      {
        planId: 'basic-ngn',
        name: 'Basic Plan (NGN)',
        description: 'Perfect for students and professionals in Nigeria',
        planType: 'basic',
        monthlyPrice: 5000, // NGN
        quarterlyPrice: 13500, // 10% discount
        yearlyPrice: 50000, // 17% discount
        currency: 'NGN',
        features: {
          // Core Platform Features
          maxApplications: 10,
          maxDocuments: 20,
          maxRecommendations: 5,
          maxScholarships: 50,
          maxPrograms: 20,
          maxSchools: 20,
          
          // Document Management
          documentLibrary: true,
          documentTemplates: true,
          documentSharing: true,
          documentFeedback: true,
          documentRating: true,
          documentCloning: true,
          
          // AI Features
          aiFeatures: true,
          aiContentRefinement: true,
          aiReview: false,
          aiRecommendations: true,
          
          // Advanced Features
          prioritySupport: false,
          customBranding: false,
          advancedAnalytics: false,
          apiAccess: false,
          bulkOperations: true,
          exportFeatures: true,
          
          // Communication
          messaging: true,
          emailNotifications: true,
          telegramBot: false,
          
          // Content Management
          contentManagement: false,
          applicationTemplates: true,
          requirementsTemplates: true,
          
          // Task Management
          taskManagement: true,
          progressTracking: true,
          
          // Quiz & Assessment
          careerQuiz: true,
          aiAnalysis: true,
          personalizedInsights: true,
        },
        limits: {
          storageGB: 5,
          apiCallsPerMonth: 500,
          teamMembers: 1,
          documentSizeMB: 25,
          searchQueriesPerMonth: 200,
        },
        isActive: true,
        isPopular: true,
      },
      {
        planId: 'premium-ngn',
        name: 'Premium Plan (NGN)',
        description: 'Advanced features for serious applicants',
        planType: 'premium',
        monthlyPrice: 10000, // NGN
        quarterlyPrice: 27000, // 10% discount
        yearlyPrice: 100000, // 17% discount
        currency: 'NGN',
        features: {
          // Core Platform Features
          maxApplications: 50,
          maxDocuments: 100,
          maxRecommendations: 15,
          maxScholarships: 200,
          maxPrograms: 100,
          maxSchools: 100,
          
          // Document Management
          documentLibrary: true,
          documentTemplates: true,
          documentSharing: true,
          documentFeedback: true,
          documentRating: true,
          documentCloning: true,
          
          // AI Features
          aiFeatures: true,
          aiContentRefinement: true,
          aiReview: true,
          aiRecommendations: true,
          
          // Advanced Features
          prioritySupport: true,
          customBranding: false,
          advancedAnalytics: true,
          apiAccess: false,
          bulkOperations: true,
          exportFeatures: true,
          
          // Communication
          messaging: true,
          emailNotifications: true,
          telegramBot: true,
          
          // Content Management
          contentManagement: true,
          applicationTemplates: true,
          requirementsTemplates: true,
          
          // Task Management
          taskManagement: true,
          progressTracking: true,
          
          // Quiz & Assessment
          careerQuiz: true,
          aiAnalysis: true,
          personalizedInsights: true,
        },
        limits: {
          storageGB: 20,
          apiCallsPerMonth: 2000,
          teamMembers: 3,
          documentSizeMB: 50,
          searchQueriesPerMonth: 1000,
        },
        isActive: true,
        isPopular: false,
      },
      {
        planId: 'basic-ghs',
        name: 'Basic Plan (GHS)',
        description: 'Perfect for students and professionals in Ghana',
        planType: 'basic',
        monthlyPrice: 120, // GHS
        quarterlyPrice: 324, // 10% discount
        yearlyPrice: 1200, // 17% discount
        currency: 'GHS',
        features: {
          // Core Platform Features
          maxApplications: 10,
          maxDocuments: 20,
          maxRecommendations: 5,
          maxScholarships: 50,
          maxPrograms: 20,
          maxSchools: 20,
          
          // Document Management
          documentLibrary: true,
          documentTemplates: true,
          documentSharing: true,
          documentFeedback: true,
          documentRating: true,
          documentCloning: true,
          
          // AI Features
          aiFeatures: true,
          aiContentRefinement: true,
          aiReview: false,
          aiRecommendations: true,
          
          // Advanced Features
          prioritySupport: false,
          customBranding: false,
          advancedAnalytics: false,
          apiAccess: false,
          bulkOperations: true,
          exportFeatures: true,
          
          // Communication
          messaging: true,
          emailNotifications: true,
          telegramBot: false,
          
          // Content Management
          contentManagement: false,
          applicationTemplates: true,
          requirementsTemplates: true,
          
          // Task Management
          taskManagement: true,
          progressTracking: true,
          
          // Quiz & Assessment
          careerQuiz: true,
          aiAnalysis: true,
          personalizedInsights: true,
        },
        limits: {
          storageGB: 5,
          apiCallsPerMonth: 500,
          teamMembers: 1,
          documentSizeMB: 25,
          searchQueriesPerMonth: 200,
        },
        isActive: true,
        isPopular: true,
      },
      {
        planId: 'premium-ghs',
        name: 'Premium Plan (GHS)',
        description: 'Advanced features for serious applicants',
        planType: 'premium',
        monthlyPrice: 240, // GHS
        quarterlyPrice: 648, // 10% discount
        yearlyPrice: 2400, // 17% discount
        currency: 'GHS',
        features: {
          // Core Platform Features
          maxApplications: 50,
          maxDocuments: 100,
          maxRecommendations: 15,
          maxScholarships: 200,
          maxPrograms: 100,
          maxSchools: 100,
          
          // Document Management
          documentLibrary: true,
          documentTemplates: true,
          documentSharing: true,
          documentFeedback: true,
          documentRating: true,
          documentCloning: true,
          
          // AI Features
          aiFeatures: true,
          aiContentRefinement: true,
          aiReview: true,
          aiRecommendations: true,
          
          // Advanced Features
          prioritySupport: true,
          customBranding: false,
          advancedAnalytics: true,
          apiAccess: false,
          bulkOperations: true,
          exportFeatures: true,
          
          // Communication
          messaging: true,
          emailNotifications: true,
          telegramBot: true,
          
          // Content Management
          contentManagement: true,
          applicationTemplates: true,
          requirementsTemplates: true,
          
          // Task Management
          taskManagement: true,
          progressTracking: true,
          
          // Quiz & Assessment
          careerQuiz: true,
          aiAnalysis: true,
          personalizedInsights: true,
        },
        limits: {
          storageGB: 20,
          apiCallsPerMonth: 2000,
          teamMembers: 3,
          documentSizeMB: 50,
          searchQueriesPerMonth: 1000,
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