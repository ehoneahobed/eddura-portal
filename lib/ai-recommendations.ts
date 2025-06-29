/**
 * AI Recommendation Engine for Career Discovery Quiz
 * This module processes quiz responses and generates personalized recommendations
 */

import { QuizResponses } from '@/models/User';

export interface CareerInsight {
  category: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  strength: number; // 0-100
  reasoning: string;
}

export interface ProgramRecommendation {
  id: string;
  name: string;
  university: string;
  field: string;
  matchScore: number;
  duration: string;
  location: string;
  tuition: string;
  description: string;
  highlights: string[];
  reasoning: string;
}

export interface PersonalityProfile {
  workStyle: string;
  learningApproach: string;
  careerValues: string[];
  strengths: string[];
  growthAreas: string[];
  personalityType: string;
}

export interface CareerPath {
  title: string;
  description: string;
  matchScore: number;
  requirements: string[];
  opportunities: string[];
  salary: string;
}

/**
 * Helper function to ensure strength values are valid numbers between 0 and 100
 */
function validateStrength(strength: number): number {
  if (isNaN(strength) || !isFinite(strength)) {
    return 0;
  }
  return Math.max(0, Math.min(100, strength));
}

/**
 * Analyze quiz responses and generate career insights
 */
export function generateCareerInsights(responses: QuizResponses): CareerInsight[] {
  const insights: CareerInsight[] = [];

  // Analyze educational level and program interest
  const educationLevel = responses.educationLevel || [];
  const programInterest = responses.programInterest || [];
  const academicBackground = responses.academicBackground || [];
  const careerProgression = responses.careerProgression || [];
  const highSchoolSubjects = responses.highSchoolSubjects || [];
  const workExperience = responses.workExperience || [];

  // Educational Pathway Insight
  if (programInterest.includes('undergraduate')) {
    insights.push({
      category: 'Educational Pathway',
      title: 'Undergraduate Foundation Builder',
      description: 'You\'re seeking to build a strong academic foundation and explore different fields before specializing.',
      icon: 'GraduationCap',
      color: 'bg-blue-500',
      strength: validateStrength(85),
      reasoning: 'Focus on undergraduate education with strong academic background in multiple subjects'
    });
  } else if (programInterest.includes('postgraduate')) {
    insights.push({
      category: 'Educational Pathway',
      title: 'Advanced Specialization Seeker',
      description: 'You\'re ready to deepen your expertise and advance your career through specialized education.',
      icon: 'Target',
      color: 'bg-purple-500',
      strength: validateStrength(90),
      reasoning: 'Pursuing postgraduate education with clear career progression goals'
    });
  }

  // Academic Strengths Insight
  if (highSchoolSubjects.includes('mathematics') && highSchoolSubjects.includes('physics')) {
    insights.push({
      category: 'Academic Strengths',
      title: 'Quantitative Problem Solver',
      description: 'You excel in analytical and mathematical thinking, making you well-suited for technical fields.',
      icon: 'Calculator',
      color: 'bg-green-500',
      strength: validateStrength(88),
      reasoning: 'Strong performance in mathematics and physics subjects'
    });
  } else if (highSchoolSubjects.includes('english_literature') && highSchoolSubjects.includes('history')) {
    insights.push({
      category: 'Academic Strengths',
      title: 'Critical Thinker & Communicator',
      description: 'You have strong analytical and communication skills, valuable in humanities and social sciences.',
      icon: 'BookOpen',
      color: 'bg-orange-500',
      strength: validateStrength(82),
      reasoning: 'Strong performance in English literature and history'
    });
  }

  // Career Progression Insight
  if (careerProgression.includes('same_field_advancement')) {
    insights.push({
      category: 'Career Progression',
      title: 'Field Specialist',
      description: 'You want to deepen your expertise in your current field and advance to senior positions.',
      icon: 'TrendingUp',
      color: 'bg-indigo-500',
      strength: validateStrength(85),
      reasoning: 'Clear goal to advance within the same field'
    });
  } else if (careerProgression.includes('field_switch')) {
    insights.push({
      category: 'Career Progression',
      title: 'Career Transitioner',
      description: 'You\'re ready to pivot to a new field, bringing valuable transferable skills and experience.',
      icon: 'RefreshCw',
      color: 'bg-yellow-500',
      strength: validateStrength(78),
      reasoning: 'Interest in switching to a different career field'
    });
  }

  // Work Experience Insight
  if (workExperience.includes('management')) {
    insights.push({
      category: 'Professional Experience',
      title: 'Leadership Ready',
      description: 'You have management experience and are prepared for leadership roles in your field.',
      icon: 'Users',
      color: 'bg-red-500',
      strength: validateStrength(92),
      reasoning: 'Previous management and leadership experience'
    });
  } else if (workExperience.includes('research')) {
    insights.push({
      category: 'Professional Experience',
      title: 'Research-Oriented Professional',
      description: 'You have research experience and are well-suited for academic or research-focused roles.',
      icon: 'Microscope',
      color: 'bg-teal-500',
      strength: validateStrength(88),
      reasoning: 'Previous research experience and analytical skills'
    });
  }

  // Learning approach analysis
  const learningApproach = responses.learningApproach || [];
  if (learningApproach.includes('practical') && learningApproach.includes('creative')) {
    insights.push({
      category: 'Learning Style',
      title: 'Hands-on Innovator',
      description: 'You thrive in environments where you can apply theoretical knowledge to real-world challenges while being creative.',
      icon: 'Lightbulb',
      color: 'bg-yellow-500',
      strength: validateStrength(88),
      reasoning: 'Strong preference for practical application and creative problem-solving'
    });
  } else if (learningApproach.includes('theoretical')) {
    insights.push({
      category: 'Learning Style',
      title: 'Theoretical Thinker',
      description: 'You excel in understanding fundamental principles and building strong theoretical foundations.',
      icon: 'Brain',
      color: 'bg-purple-500',
      strength: validateStrength(85),
      reasoning: 'Preference for understanding fundamental theories and principles'
    });
  }

  // Work environment preferences
  const workEnvironment = responses.workEnvironment || [];
  if (workEnvironment.includes('collaborative') || workEnvironment.includes('team')) {
    insights.push({
      category: 'Work Environment',
      title: 'Collaborative Team Player',
      description: 'You excel in team settings where collaboration and shared goals drive success.',
      icon: 'Users',
      color: 'bg-blue-500',
      strength: validateStrength(92),
      reasoning: 'Strong preference for collaborative and team-based work environments'
    });
  }

  // Career values analysis
  const careerValues = responses.careerValues || [];
  if (careerValues.includes('impact') || careerValues.includes('helping_others')) {
    insights.push({
      category: 'Career Values',
      title: 'Impact-Driven Professional',
      description: 'You prioritize making a positive difference in society through your work.',
      icon: 'Target',
      color: 'bg-green-500',
      strength: validateStrength(78),
      reasoning: 'Strong focus on making impact and helping others'
    });
  }

  // Strengths analysis
  const strengths = responses.keyStrengths || [];
  if (strengths.includes('analytical_thinking') || strengths.includes('problem_solving')) {
    insights.push({
      category: 'Academic Strengths',
      title: 'Analytical Problem Solver',
      description: 'You have strong analytical and critical thinking skills that serve you well in complex problem-solving.',
      icon: 'Brain',
      color: 'bg-indigo-500',
      strength: validateStrength(88),
      reasoning: 'Strong analytical thinking and problem-solving capabilities'
    });
  }

  return insights;
}

/**
 * Generate program recommendations based on quiz responses
 */
export function generateProgramRecommendations(responses: QuizResponses): ProgramRecommendation[] {
  const recommendations: ProgramRecommendation[] = [];
  
  // Analyze interest areas
  const interestAreas = responses.interestAreas || [];
  const careerValues = responses.careerValues || [];
  const workEnvironment = responses.workEnvironment || [];
  const programInterest = responses.programInterest || [];
  const academicBackground = responses.academicBackground || [];
  const careerProgression = responses.careerProgression || [];
  const highSchoolSubjects = responses.highSchoolSubjects || [];
  const workExperience = responses.workExperience || [];
  const researchInterests = responses.researchInterests || [];
  const specializationGoals = responses.specializationGoals || [];

  // Undergraduate Recommendations
  if (programInterest.includes('undergraduate')) {
    // Engineering track
    if (interestAreas.includes('engineering_technology') || 
        highSchoolSubjects.includes('mathematics') || 
        highSchoolSubjects.includes('physics')) {
      recommendations.push({
        id: 'ug_eng_1',
        name: 'Bachelor of Engineering in Computer Science',
        university: 'MIT',
        field: 'Engineering & Technology',
        matchScore: calculateMatchScore(responses, ['engineering_technology', 'computer_science_it', 'mathematics']),
        duration: '4 years',
        location: 'Cambridge, MA, USA',
        tuition: '$53,790/year',
        description: 'Comprehensive computer science program with strong foundation in software engineering and algorithms.',
        highlights: ['World-class faculty', 'Research opportunities', 'Industry partnerships', 'Career placement support'],
        reasoning: 'Strong interest in engineering and technology, excellent performance in mathematics and physics'
      });
    }

    // Business track
    if (interestAreas.includes('business_management') || 
        highSchoolSubjects.includes('business_studies') || 
        highSchoolSubjects.includes('economics')) {
      recommendations.push({
        id: 'ug_bus_1',
        name: 'Bachelor of Business Administration',
        university: 'University of Pennsylvania',
        field: 'Business & Management',
        matchScore: calculateMatchScore(responses, ['business_management']),
        duration: '4 years',
        location: 'Philadelphia, PA, USA',
        tuition: '$61,710/year',
        description: 'Comprehensive business education with focus on leadership, entrepreneurship, and global business.',
        highlights: ['Wharton School prestige', 'Global network', 'Entrepreneurship focus', 'Internship opportunities'],
        reasoning: 'Interest in business management and strong academic background in business studies'
      });
    }

    // Health Sciences track
    if (interestAreas.includes('health_sciences') || 
        highSchoolSubjects.includes('biology') || 
        highSchoolSubjects.includes('chemistry')) {
      recommendations.push({
        id: 'ug_health_1',
        name: 'Bachelor of Science in Nursing',
        university: 'Johns Hopkins University',
        field: 'Health Sciences',
        matchScore: calculateMatchScore(responses, ['health_sciences']),
        duration: '4 years',
        location: 'Baltimore, MD, USA',
        tuition: '$58,720/year',
        description: 'Preparing future nursing leaders with clinical excellence and research opportunities.',
        highlights: ['Top-ranked nursing program', 'Clinical rotations', 'Research opportunities', 'Career placement'],
        reasoning: 'Strong interest in health sciences and excellent performance in biology and chemistry'
      });
    }

    // Arts & Humanities track
    if (interestAreas.includes('arts_humanities') || 
        highSchoolSubjects.includes('english_literature') || 
        highSchoolSubjects.includes('history')) {
      recommendations.push({
        id: 'ug_arts_1',
        name: 'Bachelor of Arts in English Literature',
        university: 'Yale University',
        field: 'Arts & Humanities',
        matchScore: calculateMatchScore(responses, ['arts_humanities']),
        duration: '4 years',
        location: 'New Haven, CT, USA',
        tuition: '$59,950/year',
        description: 'Explore literature, culture, and critical thinking in a rigorous academic environment.',
        highlights: ['Ivy League education', 'Small class sizes', 'Research opportunities', 'Writing intensive'],
        reasoning: 'Strong interest in arts and humanities, excellent performance in English and history'
      });
    }
  }

  // Postgraduate Recommendations
  if (programInterest.includes('postgraduate')) {
    // MBA for career advancement
    if (careerProgression.includes('same_field_advancement') || 
        careerProgression.includes('leadership_management') ||
        workExperience.includes('management')) {
      recommendations.push({
        id: 'pg_mba_1',
        name: 'Master of Business Administration',
        university: 'Harvard Business School',
        field: 'Business & Management',
        matchScore: calculateMatchScore(responses, ['business_management', 'leadership_management']),
        duration: '2 years',
        location: 'Boston, MA, USA',
        tuition: '$73,440/year',
        description: 'Develop leadership skills and business acumen in a collaborative, case-based learning environment.',
        highlights: ['Global network', 'Case study method', 'Leadership development', 'Entrepreneurship focus'],
        reasoning: 'Career progression goals in leadership and management, relevant work experience'
      });
    }

    // Data Science for technical specialization
    if (interestAreas.includes('computer_science_it') || 
        interestAreas.includes('mathematics_statistics') ||
        researchInterests.includes('data_science') ||
        specializationGoals.includes('technical_expertise')) {
      recommendations.push({
        id: 'pg_ds_1',
        name: 'Master of Science in Data Science',
        university: 'Stanford University',
        field: 'Computer Science & Technology',
        matchScore: calculateMatchScore(responses, ['computer_science_it', 'mathematics_statistics', 'data_science']),
        duration: '2 years',
        location: 'Stanford, CA, USA',
        tuition: '$58,000/year',
        description: 'A comprehensive program combining statistical analysis, machine learning, and business applications.',
        highlights: ['Top-ranked program', 'Industry partnerships', 'Research opportunities', 'Career placement support'],
        reasoning: 'Strong interest in computer science and mathematics, focus on technical expertise'
      });
    }

    // Public Policy for social impact
    if (careerValues.includes('impact') || 
        interestAreas.includes('law_public_policy') ||
        careerProgression.includes('public_service') ||
        workExperience.includes('public_sector')) {
      recommendations.push({
        id: 'pg_policy_1',
        name: 'Master of Public Policy',
        university: 'University of Oxford',
        field: 'Public Policy & Administration',
        matchScore: calculateMatchScore(responses, ['law_public_policy', 'impact', 'public_service']),
        duration: '1 year',
        location: 'Oxford, UK',
        tuition: '£32,000/year',
        description: 'Analyze complex policy challenges and develop solutions for global impact.',
        highlights: ['International perspective', 'Policy analysis', 'Research opportunities', 'Government connections'],
        reasoning: 'Strong focus on making impact and interest in public policy, relevant work experience'
      });
    }

    // Engineering for technical advancement
    if (interestAreas.includes('engineering_technology') ||
        academicBackground.includes('engineering') ||
        specializationGoals.includes('technical_expertise')) {
      recommendations.push({
        id: 'pg_eng_1',
        name: 'Master of Engineering',
        university: 'MIT',
        field: 'Engineering & Technology',
        matchScore: calculateMatchScore(responses, ['engineering_technology', 'technical_expertise']),
        duration: '2 years',
        location: 'Cambridge, MA, USA',
        tuition: '$53,790/year',
        description: 'Advanced engineering program with focus on innovation and practical application.',
        highlights: ['World-class faculty', 'Research opportunities', 'Industry connections', 'Innovation focus'],
        reasoning: 'Strong interest in engineering and technology, focus on technical expertise'
      });
    }

    // Research-focused programs
    if (researchInterests.length > 0 ||
        specializationGoals.includes('research_methods') ||
        workExperience.includes('research')) {
      recommendations.push({
        id: 'pg_research_1',
        name: 'Master of Science in Artificial Intelligence',
        university: 'Carnegie Mellon University',
        field: 'Computer Science & Technology',
        matchScore: calculateMatchScore(responses, ['artificial_intelligence', 'research_methods']),
        duration: '2 years',
        location: 'Pittsburgh, PA, USA',
        tuition: '$49,000/year',
        description: 'Advanced AI research program with focus on machine learning and robotics.',
        highlights: ['Leading AI research', 'Industry partnerships', 'Research opportunities', 'Innovation focus'],
        reasoning: 'Research interests in AI and focus on research methods'
      });
    }
  }

  // Sort by match score and return top recommendations
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}

/**
 * Generate personality profile based on quiz responses
 */
export function generatePersonalityProfile(responses: QuizResponses): PersonalityProfile {
  const workApproach = responses.workApproach || [];
  const learningApproach = responses.learningApproach || [];
  const careerValues = responses.careerValues || [];
  const strengths = responses.keyStrengths || [];
  const interestAreas = responses.interestAreas || [];

  let workStyle = 'Adaptive Professional';
  if (workApproach.includes('collaborative') && workApproach.includes('problem_solving')) {
    workStyle = 'Collaborative Problem Solver';
  } else if (workApproach.includes('independent')) {
    workStyle = 'Independent Achiever';
  } else if (workApproach.includes('leadership')) {
    workStyle = 'Natural Leader';
  }

  let learningApproachType = 'Balanced Learner';
  if (learningApproach.includes('practical') && learningApproach.includes('theoretical')) {
    learningApproachType = 'Hands-on with Theoretical Foundation';
  } else if (learningApproach.includes('practical')) {
    learningApproachType = 'Practical Application Focused';
  } else if (learningApproach.includes('theoretical')) {
    learningApproachType = 'Theoretical Foundation Builder';
  }

  const topValues = careerValues.slice(0, 4).map(value => {
    const valueMap: Record<string, string> = {
      'impact': 'Making Impact',
      'financial_reward': 'Financial Success',
      'work_life_balance': 'Work-Life Balance',
      'innovation': 'Innovation',
      'autonomy': 'Independence',
      'creativity_expression': 'Creative Expression',
      'stability_security': 'Stability',
      'continuous_learning': 'Continuous Learning',
      'collaboration_teamwork': 'Collaboration',
      'recognition_prestige': 'Recognition',
      'problem_solving_challenges': 'Problem Solving',
      'helping_others': 'Helping Others',
      'travel_exploration': 'Travel & Exploration'
    };
    return valueMap[value] || value;
  });

  const topStrengths = strengths.slice(0, 4).map(strength => {
    const strengthMap: Record<string, string> = {
      'analytical_thinking': 'Analytical Thinking',
      'problem_solving': 'Problem Solving',
      'creativity': 'Creativity',
      'verbal_communication': 'Verbal Communication',
      'written_communication': 'Written Communication',
      'leadership': 'Leadership',
      'teamwork': 'Teamwork',
      'attention_detail': 'Attention to Detail',
      'time_management': 'Time Management',
      'technical_proficiency': 'Technical Proficiency',
      'adaptability': 'Adaptability',
      'research': 'Research Skills',
      'empathy': 'Empathy',
      'critical_thinking': 'Critical Thinking',
      'mathematical': 'Mathematical Skills',
      'artistic_design': 'Artistic/Design Skills',
      'practical_hands_on': 'Practical Skills'
    };
    return strengthMap[strength] || strength;
  });

  const growthAreas = [
    'Public Speaking',
    'Technical Skills',
    'Industry Knowledge',
    'Networking',
    'Project Management',
    'Cross-cultural Communication'
  ];

  // Determine personality type based on responses
  let personalityType = 'Balanced Professional';
  if (workApproach.includes('collaborative') && careerValues.includes('impact')) {
    personalityType = 'Social Impact Leader';
  } else if (strengths.includes('analytical_thinking') && interestAreas.includes('computer_science_it')) {
    personalityType = 'Analytical Technologist';
  } else if (careerValues.includes('financial_reward') && workApproach.includes('results_oriented')) {
    personalityType = 'Results-Driven Professional';
  }

  return {
    workStyle,
    learningApproach: learningApproachType,
    careerValues: topValues,
    strengths: topStrengths,
    growthAreas,
    personalityType
  };
}

/**
 * Generate career paths based on quiz responses
 */
export function generateCareerPaths(responses: QuizResponses): CareerPath[] {
  const careerPaths: CareerPath[] = [];
  const interestAreas = responses.interestAreas || [];
  const careerValues = responses.careerValues || [];

  if (interestAreas.includes('computer_science_it')) {
    careerPaths.push({
      title: 'Data Scientist',
      description: 'Analyze complex data to help organizations make informed decisions.',
      matchScore: 90,
      requirements: ['Statistics', 'Programming', 'Machine Learning', 'Business Acumen'],
      opportunities: ['Tech Companies', 'Consulting', 'Research', 'Startups'],
      salary: '$95,000 - $150,000'
    });
  }

  if (interestAreas.includes('business_management')) {
    careerPaths.push({
      title: 'Business Consultant',
      description: 'Help organizations improve their performance and solve business challenges.',
      matchScore: 85,
      requirements: ['Business Strategy', 'Analytical Skills', 'Communication', 'Problem Solving'],
      opportunities: ['Consulting Firms', 'Corporations', 'Non-profits', 'Entrepreneurship'],
      salary: '$80,000 - $130,000'
    });
  }

  if (careerValues.includes('impact') && interestAreas.includes('health_sciences')) {
    careerPaths.push({
      title: 'Public Health Professional',
      description: 'Improve community health through research, policy, and program development.',
      matchScore: 88,
      requirements: ['Epidemiology', 'Biostatistics', 'Health Policy', 'Research Methods'],
      opportunities: ['Government', 'NGOs', 'Healthcare Organizations', 'Research Institutions'],
      salary: '$60,000 - $100,000'
    });
  }

  return careerPaths.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculate match score based on quiz responses and target criteria
 */
function calculateMatchScore(responses: QuizResponses, targetCriteria: string[]): number {
  let score = 0;
  let totalCriteria = targetCriteria.length;

  // Check interest areas
  const interestAreas = responses.interestAreas || [];
  targetCriteria.forEach(criteria => {
    if (interestAreas.includes(criteria)) {
      score += 30;
    }
  });

  // Check career values alignment
  const careerValues = responses.careerValues || [];
  if (careerValues.includes('impact') || careerValues.includes('continuous_learning')) {
    score += 20;
  }

  // Check work style alignment
  const workApproach = responses.workApproach || [];
  if (workApproach.includes('problem_solving') || workApproach.includes('analytical')) {
    score += 20;
  }

  // Check strengths alignment
  const strengths = responses.keyStrengths || [];
  if (strengths.includes('analytical_thinking') || strengths.includes('problem_solving')) {
    score += 20;
  }

  // Add some randomness for variety (but keep it reasonable)
  score += Math.random() * 10;

  return Math.min(Math.round(score), 100);
}

/**
 * Main function to generate all recommendations
 */
export function generateAllRecommendations(responses: QuizResponses) {
  return {
    careerInsights: generateCareerInsights(responses),
    programRecommendations: generateProgramRecommendations(responses),
    personalityProfile: generatePersonalityProfile(responses),
    careerPaths: generateCareerPaths(responses)
  };
} 