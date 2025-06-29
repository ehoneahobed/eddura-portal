/**
 * Career Discovery Quiz Configuration
 * This file contains all the questions, options, and structure for the Eddura career discovery quiz
 * The quiz is now adaptive based on educational level and program interest
 */

export interface QuizQuestion {
  id: string;
  type: 'multiselect' | 'singleselect' | 'text' | 'textarea';
  title: string;
  description?: string;
  options?: QuizOption[];
  placeholder?: string;
  required: boolean;
  maxSelections?: number;
  minSelections?: number;
  helpText?: string;
  // New adaptive properties
  showFor?: {
    educationLevel?: string[];
    programInterest?: string[];
  };
  conditionalLogic?: {
    dependsOn: string; // question ID this depends on
    showWhen: string[]; // values that trigger this question
  };
}

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
}

export interface QuizSection {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  estimatedTime: number; // in minutes
  icon: string;
  // New adaptive properties
  showFor?: {
    educationLevel?: string[];
    programInterest?: string[];
  };
}

export const QUIZ_SECTIONS: QuizSection[] = [
  {
    id: 'education-aspirations',
    title: 'Education & Aspirations',
    description: 'Let\'s start by understanding your current educational background and what you\'re looking to achieve.',
    estimatedTime: 3,
    icon: '🎓',
    questions: [
      {
        id: 'educationLevel',
        type: 'singleselect',
        title: 'What is your current highest level of education completed or in progress?',
        description: 'Select all that apply to your current situation.',
        required: true,
        options: [
          { value: 'high_school', label: 'High School Diploma / Secondary School Certificate' },
          { value: 'some_college', label: 'Some College/University (No Degree)' },
          { value: 'associates', label: 'Associate\'s Degree / College Diploma' },
          { value: 'bachelors', label: 'Bachelor\'s Degree / Undergraduate Degree' },
          { value: 'masters', label: 'Master\'s Degree / Postgraduate Degree' },
          { value: 'doctorate', label: 'Doctorate (Ph.D.) / Professional Degree (e.g., MD, JD)' },
          { value: 'vocational', label: 'Vocational/Technical Certification' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'programInterest',
        type: 'singleselect',
        title: 'What type of university program are you primarily interested in pursuing?',
        description: 'Choose the program types that align with your goals.',
        required: true,
        options: [
          { value: 'undergraduate', label: 'Undergraduate Degree (e.g., Bachelor\'s)' },
          { value: 'postgraduate', label: 'Postgraduate Degree (e.g., Master\'s, Ph.D., MBA)' },
          { value: 'diploma', label: 'Diploma/Certificate Program' },
          { value: 'undecided', label: 'Undecided' }
        ]
      },
      {
        id: 'academicBackground',
        type: 'multiselect',
        title: 'What subjects or fields have you studied in your previous education?',
        description: 'Select the subjects you have experience with, as this helps us understand your academic foundation.',
        required: true,
        conditionalLogic: {
          dependsOn: 'programInterest',
          showWhen: ['undergraduate', 'postgraduate']
        },
        options: [
          // High school subjects (for undergraduates)
          { value: 'mathematics', label: 'Mathematics (Algebra, Calculus, Statistics)', description: 'Core mathematical concepts' },
          { value: 'sciences', label: 'Sciences (Biology, Chemistry, Physics)', description: 'Natural and physical sciences' },
          { value: 'languages', label: 'Languages (English, Literature, Foreign Languages)', description: 'Communication and linguistic skills' },
          { value: 'social_studies', label: 'Social Studies (History, Geography, Economics)', description: 'Humanities and social sciences' },
          { value: 'arts', label: 'Arts (Visual Arts, Music, Drama)', description: 'Creative and performing arts' },
          { value: 'technology', label: 'Technology (Computer Science, IT)', description: 'Digital and technical skills' },
          { value: 'business', label: 'Business Studies', description: 'Commerce and business concepts' },
          { value: 'physical_education', label: 'Physical Education & Health', description: 'Health and wellness' },
          
          // University subjects (for postgraduates)
          { value: 'engineering', label: 'Engineering (Any discipline)', description: 'Technical and applied sciences' },
          { value: 'medicine_health', label: 'Medicine & Health Sciences', description: 'Clinical and healthcare fields' },
          { value: 'law', label: 'Law & Legal Studies', description: 'Legal and regulatory frameworks' },
          { value: 'education', label: 'Education & Teaching', description: 'Pedagogy and learning sciences' },
          { value: 'psychology', label: 'Psychology & Behavioral Sciences', description: 'Human behavior and mental processes' },
          { value: 'environmental', label: 'Environmental Sciences', description: 'Sustainability and ecology' },
          { value: 'agriculture', label: 'Agriculture & Food Sciences', description: 'Agricultural and food systems' },
          { value: 'architecture', label: 'Architecture & Design', description: 'Built environment and design' }
        ]
      },
      {
        id: 'careerProgression',
        type: 'multiselect',
        title: 'What are your career progression goals?',
        description: 'Select the options that best describe your career aspirations.',
        required: true,
        conditionalLogic: {
          dependsOn: 'programInterest',
          showWhen: ['postgraduate']
        },
        options: [
          { value: 'same_field_advancement', label: 'Advance in the same field', description: 'Deepen expertise and move to senior positions' },
          { value: 'field_switch', label: 'Switch to a different field', description: 'Pursue a new career path or industry' },
          { value: 'specialization', label: 'Specialize in a niche area', description: 'Focus on a specific subfield or specialization' },
          { value: 'research_academia', label: 'Enter research or academia', description: 'Pursue teaching or research positions' },
          { value: 'entrepreneurship', label: 'Start my own business', description: 'Become an entrepreneur or consultant' },
          { value: 'leadership_management', label: 'Move into leadership/management', description: 'Take on managerial or executive roles' },
          { value: 'international_career', label: 'Pursue international opportunities', description: 'Work abroad or in global organizations' },
          { value: 'public_service', label: 'Enter public service or non-profit', description: 'Work in government or social impact' }
        ]
      },
      {
        id: 'previousDegreeField',
        type: 'multiselect',
        title: 'What was your previous degree field of study?',
        description: 'Select the field(s) you studied in your most recent degree.',
        required: true,
        conditionalLogic: {
          dependsOn: 'programInterest',
          showWhen: ['postgraduate']
        },
        options: [
          { value: 'arts_humanities', label: 'Arts & Humanities', description: 'Literature, History, Philosophy, Languages' },
          { value: 'business_management', label: 'Business & Management', description: 'Marketing, Finance, Accounting, HR' },
          { value: 'computer_science_it', label: 'Computer Science & IT', description: 'Software, Data Science, Cybersecurity' },
          { value: 'education', label: 'Education', description: 'Teaching, Educational Leadership' },
          { value: 'engineering_technology', label: 'Engineering & Technology', description: 'Civil, Mechanical, Electrical, etc.' },
          { value: 'health_sciences', label: 'Health Sciences', description: 'Medicine, Nursing, Pharmacy, Public Health' },
          { value: 'law_public_policy', label: 'Law & Public Policy', description: 'Law, Political Science, International Relations' },
          { value: 'natural_sciences', label: 'Natural Sciences', description: 'Biology, Chemistry, Physics, Environmental' },
          { value: 'social_sciences', label: 'Social Sciences', description: 'Sociology, Anthropology, Economics, Psychology' },
          { value: 'mathematics_statistics', label: 'Mathematics & Statistics', description: 'Pure Math, Applied Math, Statistics' },
          { value: 'communications_media', label: 'Communications & Media', description: 'Journalism, PR, Film, Broadcasting' },
          { value: 'creative_arts_design', label: 'Creative Arts & Design', description: 'Graphic Design, Fashion, Architecture' },
          { value: 'other', label: 'Other', description: 'Other field of study' }
        ]
      }
    ]
  },
  {
    id: 'academic-preparation',
    title: 'Academic Preparation',
    description: 'Understanding your academic background helps us recommend the right programs for your level.',
    estimatedTime: 3,
    icon: '📚',
    showFor: {
      programInterest: ['undergraduate']
    },
    questions: [
      {
        id: 'highSchoolSubjects',
        type: 'multiselect',
        title: 'Which subjects did you excel in or enjoy most during high school?',
        description: 'Select the subjects where you performed well or had a strong interest.',
        required: true,
        maxSelections: 6,
        options: [
          { value: 'mathematics', label: 'Mathematics', description: 'Algebra, Calculus, Statistics, Geometry' },
          { value: 'physics', label: 'Physics', description: 'Mechanics, Electricity, Thermodynamics' },
          { value: 'chemistry', label: 'Chemistry', description: 'Organic, Inorganic, Physical Chemistry' },
          { value: 'biology', label: 'Biology', description: 'Cell Biology, Genetics, Ecology' },
          { value: 'english_literature', label: 'English & Literature', description: 'Reading, Writing, Analysis' },
          { value: 'history', label: 'History', description: 'World History, Political History' },
          { value: 'geography', label: 'Geography', description: 'Physical Geography, Human Geography' },
          { value: 'economics', label: 'Economics', description: 'Microeconomics, Macroeconomics' },
          { value: 'computer_science', label: 'Computer Science', description: 'Programming, Web Development' },
          { value: 'art_design', label: 'Art & Design', description: 'Visual Arts, Graphic Design' },
          { value: 'music', label: 'Music', description: 'Performance, Theory, Composition' },
          { value: 'physical_education', label: 'Physical Education', description: 'Sports, Health, Fitness' },
          { value: 'languages', label: 'Foreign Languages', description: 'Spanish, French, German, etc.' },
          { value: 'business_studies', label: 'Business Studies', description: 'Accounting, Marketing, Management' }
        ]
      },
      {
        id: 'academicAchievements',
        type: 'multiselect',
        title: 'What academic achievements or activities are you most proud of?',
        description: 'Select the achievements that best represent your academic strengths.',
        required: true,
        maxSelections: 4,
        options: [
          { value: 'high_gpa', label: 'High GPA/Academic Excellence', description: 'Consistently high grades' },
          { value: 'honors_advanced', label: 'Honors/Advanced Placement Courses', description: 'Challenging coursework' },
          { value: 'science_fair', label: 'Science Fair/Research Projects', description: 'Independent research' },
          { value: 'debate_competition', label: 'Debate/Public Speaking', description: 'Communication skills' },
          { value: 'math_competition', label: 'Math/Science Competitions', description: 'Problem-solving skills' },
          { value: 'student_government', label: 'Student Government/Leadership', description: 'Leadership experience' },
          { value: 'clubs_activities', label: 'Academic Clubs/Activities', description: 'Extracurricular involvement' },
          { value: 'community_service', label: 'Community Service/Volunteering', description: 'Social responsibility' },
          { value: 'sports_athletics', label: 'Sports/Athletics', description: 'Teamwork and discipline' },
          { value: 'arts_performance', label: 'Arts/Performance', description: 'Creative expression' },
          { value: 'entrepreneurship', label: 'Entrepreneurship/Innovation', description: 'Business mindset' },
          { value: 'internships', label: 'Internships/Work Experience', description: 'Real-world experience' }
        ]
      }
    ]
  },
  {
    id: 'postgraduate-background',
    title: 'Postgraduate Background',
    description: 'Understanding your previous academic and professional experience helps us recommend the right advanced programs.',
    estimatedTime: 4,
    icon: '🎯',
    showFor: {
      programInterest: ['postgraduate']
    },
    questions: [
      {
        id: 'workExperience',
        type: 'multiselect',
        title: 'What type of work experience do you have?',
        description: 'Select the types of experience that are relevant to your career goals.',
        required: true,
        maxSelections: 5,
        options: [
          { value: 'entry_level', label: 'Entry-level professional', description: '0-2 years in professional role' },
          { value: 'mid_level', label: 'Mid-level professional', description: '3-7 years of experience' },
          { value: 'senior_level', label: 'Senior-level professional', description: '8+ years of experience' },
          { value: 'management', label: 'Management/Leadership', description: 'Supervising teams or projects' },
          { value: 'research', label: 'Research experience', description: 'Academic or industry research' },
          { value: 'teaching', label: 'Teaching/Training', description: 'Educating others' },
          { value: 'consulting', label: 'Consulting/Advisory', description: 'Providing expert advice' },
          { value: 'entrepreneurship', label: 'Entrepreneurship', description: 'Starting or running businesses' },
          { value: 'public_sector', label: 'Public sector/Government', description: 'Working in government' },
          { value: 'non_profit', label: 'Non-profit/Social impact', description: 'Working for social causes' },
          { value: 'international', label: 'International experience', description: 'Working abroad' },
          { value: 'volunteer', label: 'Volunteer work', description: 'Unpaid community service' }
        ]
      },
      {
        id: 'researchInterests',
        type: 'multiselect',
        title: 'What research areas or topics interest you most?',
        description: 'Select the research areas that align with your academic and career interests.',
        required: false,
        maxSelections: 4,
        options: [
          { value: 'artificial_intelligence', label: 'Artificial Intelligence & Machine Learning', description: 'AI, ML, Deep Learning' },
          { value: 'sustainability', label: 'Sustainability & Environmental Science', description: 'Climate change, renewable energy' },
          { value: 'healthcare_innovation', label: 'Healthcare Innovation', description: 'Medical technology, public health' },
          { value: 'data_science', label: 'Data Science & Analytics', description: 'Big data, statistical analysis' },
          { value: 'cybersecurity', label: 'Cybersecurity & Privacy', description: 'Digital security, privacy protection' },
          { value: 'social_impact', label: 'Social Impact & Development', description: 'Poverty alleviation, education' },
          { value: 'business_innovation', label: 'Business Innovation & Strategy', description: 'Entrepreneurship, business models' },
          { value: 'education_technology', label: 'Education Technology', description: 'EdTech, online learning' },
          { value: 'urban_planning', label: 'Urban Planning & Smart Cities', description: 'City development, infrastructure' },
          { value: 'biotechnology', label: 'Biotechnology & Life Sciences', description: 'Genetic engineering, pharmaceuticals' },
          { value: 'renewable_energy', label: 'Renewable Energy & Clean Tech', description: 'Solar, wind, energy storage' },
          { value: 'digital_transformation', label: 'Digital Transformation', description: 'Technology adoption, digital strategy' }
        ]
      },
      {
        id: 'specializationGoals',
        type: 'multiselect',
        title: 'What are your specialization goals for your advanced degree?',
        description: 'Select the areas where you want to develop deeper expertise.',
        required: true,
        maxSelections: 3,
        options: [
          { value: 'technical_expertise', label: 'Technical expertise', description: 'Deep technical knowledge in a specific field' },
          { value: 'research_methods', label: 'Research methods', description: 'Advanced research and analytical skills' },
          { value: 'leadership_skills', label: 'Leadership skills', description: 'Management and organizational leadership' },
          { value: 'industry_knowledge', label: 'Industry knowledge', description: 'Understanding of specific industry dynamics' },
          { value: 'global_perspective', label: 'Global perspective', description: 'International business and cultural understanding' },
          { value: 'innovation_creativity', label: 'Innovation and creativity', description: 'Creative problem-solving and innovation' },
          { value: 'policy_analysis', label: 'Policy analysis', description: 'Understanding and influencing policy' },
          { value: 'entrepreneurial_skills', label: 'Entrepreneurial skills', description: 'Starting and growing businesses' }
        ]
      }
    ]
  },
  {
    id: 'interest-areas',
    title: 'Interest Areas',
    description: 'Discover what truly excites you and where your passions lie.',
    estimatedTime: 3,
    icon: '🔍',
    questions: [
      {
        id: 'interestAreas',
        type: 'multiselect',
        title: 'Which of the following broad fields spark your curiosity?',
        description: 'Select the areas you could see yourself learning more about and potentially pursuing.',
        required: true,
        maxSelections: 5,
        options: [
          { value: 'arts_humanities', label: 'Arts & Humanities', description: 'Literature, History, Philosophy, Languages, Fine Arts, Music, Performing Arts' },
          { value: 'business_management', label: 'Business & Management', description: 'Marketing, Finance, Accounting, Entrepreneurship, Human Resources, Operations' },
          { value: 'computer_science_it', label: 'Computer Science & IT', description: 'Software Development, Cybersecurity, Data Science, AI, Networking, Web Design' },
          { value: 'education', label: 'Education', description: 'Teaching, Educational Leadership, Curriculum Design, Special Education' },
          { value: 'engineering_technology', label: 'Engineering & Technology', description: 'Civil, Mechanical, Electrical, Chemical, Aerospace, Biomedical, Robotics' },
          { value: 'health_sciences', label: 'Health Sciences', description: 'Medicine, Nursing, Pharmacy, Public Health, Kinesiology, Nutrition, Psychology (Clinical)' },
          { value: 'law_public_policy', label: 'Law & Public Policy', description: 'Law, Criminology, Political Science, International Relations, Public Administration' },
          { value: 'natural_sciences', label: 'Natural Sciences', description: 'Biology, Chemistry, Physics, Environmental Science, Astronomy, Geology' },
          { value: 'social_sciences', label: 'Social Sciences', description: 'Sociology, Anthropology, Economics, Psychology (Research), Geography, Urban Planning' },
          { value: 'trades_applied_sciences', label: 'Trades & Applied Sciences', description: 'Automotive, Construction, Culinary Arts, Horticulture, Digital Media Production' },
          { value: 'mathematics_statistics', label: 'Mathematics & Statistics', description: 'Pure Math, Applied Math, Statistics, Actuarial Science' },
          { value: 'communications_media', label: 'Communications & Media', description: 'Journalism, Public Relations, Film, Broadcasting, Digital Media' },
          { value: 'creative_arts_design', label: 'Creative Arts & Design', description: 'Graphic Design, Fashion Design, Interior Design, Architecture, Animation' }
        ]
      },
      {
        id: 'learningApproach',
        type: 'multiselect',
        title: 'When you encounter a new concept or topic, what excites you most?',
        description: 'Select the approaches that resonate with how you naturally learn and engage with new information.',
        required: true,
        maxSelections: 4,
        options: [
          { value: 'theoretical', label: 'Understanding the fundamental theories and principles behind it' },
          { value: 'practical', label: 'Applying it to real-world problems and seeing its practical uses' },
          { value: 'creative', label: 'Creating something new or innovative with it' },
          { value: 'analytical', label: 'Analyzing data and patterns related to it' },
          { value: 'communicative', label: 'Communicating it effectively to others' },
          { value: 'improvement', label: 'Improving existing processes or systems based on it' },
          { value: 'historical', label: 'Exploring its historical development and cultural impact' },
          { value: 'problem_solving', label: 'Solving complex challenges associated with it' }
        ]
      }
    ]
  },
  {
    id: 'work-environment',
    title: 'Work Environment',
    description: 'Understanding your preferred work setting helps us match you with the right career paths.',
    estimatedTime: 3,
    icon: '🏢',
    questions: [
      {
        id: 'workEnvironment',
        type: 'multiselect',
        title: 'Which of these work environments appeal to you the most?',
        description: 'Select the environments where you feel you would thrive and be most productive.',
        required: true,
        maxSelections: 4,
        options: [
          { value: 'office_corporate', label: 'Office/Corporate', description: 'Structured, professional, desk-based' },
          { value: 'laboratory_research', label: 'Laboratory/Research', description: 'Controlled, analytical, experimental' },
          { value: 'outdoor_field', label: 'Outdoor/Field-based', description: 'Nature, varying conditions, hands-on' },
          { value: 'clinical_healthcare', label: 'Clinical/Healthcare', description: 'Patient-facing, collaborative, fast-paced' },
          { value: 'creative_studio', label: 'Creative Studio', description: 'Collaborative, artistic, open-plan' },
          { value: 'workshop_manufacturing', label: 'Workshop/Manufacturing', description: 'Hands-on, practical, production-focused' },
          { value: 'educational_institution', label: 'Educational Institution', description: 'Teaching, mentoring, academic setting' },
          { value: 'remote_flexible', label: 'Remote/Flexible', description: 'Working from home, self-directed' },
          { value: 'public_service', label: 'Public Service/Community-focused', description: 'Direct impact on society, community engagement' },
          { value: 'travel_intensive', label: 'Travel-intensive', description: 'Frequent movement, varied locations' },
          { value: 'independent_solo', label: 'Independent/Solo', description: 'Minimal supervision, self-reliant' }
        ]
      },
      {
        id: 'projectMotivation',
        type: 'multiselect',
        title: 'Imagine you\'re working on a challenging project. Which scenario would you find most motivating?',
        description: 'Select the situations that would energize and engage you the most.',
        required: true,
        maxSelections: 3,
        options: [
          { value: 'independent_solution', label: 'Working independently to find a solution, with minimal interruptions' },
          { value: 'small_team_collaboration', label: 'Collaborating closely with a small, dedicated team, brainstorming ideas' },
          { value: 'leading_team', label: 'Leading a larger team, delegating tasks and coordinating efforts' },
          { value: 'client_interaction', label: 'Working directly with clients or beneficiaries to understand their needs' },
          { value: 'dynamic_environment', label: 'Being in a dynamic environment where new challenges arise constantly' },
          { value: 'structured_process', label: 'Having a clear set of rules and procedures to follow, ensuring precision' }
        ]
      }
    ]
  },
  {
    id: 'work-style',
    title: 'Work Style',
    description: 'Your natural approach to work and collaboration style are key to finding the right fit.',
    estimatedTime: 3,
    icon: '⚡',
    questions: [
      {
        id: 'workApproach',
        type: 'multiselect',
        title: 'How do you prefer to approach tasks and projects?',
        description: 'Select the approaches that best describe your natural working style.',
        required: true,
        maxSelections: 4,
        options: [
          { value: 'structured_organized', label: 'Structured & Organized', description: 'Following a plan, meticulous attention to detail' },
          { value: 'flexible_adaptive', label: 'Flexible & Adaptive', description: 'Willing to adjust plans, embrace change' },
          { value: 'collaborative', label: 'Collaborative', description: 'Enjoying teamwork, group discussions' },
          { value: 'independent', label: 'Independent', description: 'Preferring to work alone, self-directed' },
          { value: 'problem_solving', label: 'Problem-Solving Focused', description: 'Seeking out challenges, finding innovative solutions' },
          { value: 'results_oriented', label: 'Results-Oriented', description: 'Driven by achieving clear outcomes' },
          { value: 'creative_innovative', label: 'Creative & Innovative', description: 'Generating new ideas, thinking outside the box' },
          { value: 'analytical', label: 'Analytical', description: 'Breaking down complex information, data-driven decisions' }
        ]
      },
      {
        id: 'conflictResolution',
        type: 'multiselect',
        title: 'You are part of a team working on a new initiative. A conflict arises regarding the best approach. How would you most likely respond?',
        description: 'Select the responses that best reflect your natural conflict resolution style.',
        required: true,
        maxSelections: 3,
        options: [
          { value: 'listen_compromise', label: 'Actively listen to all perspectives, seeking common ground and compromise' },
          { value: 'present_argument', label: 'Present your own well-reasoned argument, aiming to persuade others' },
          { value: 'gather_evidence', label: 'Focus on gathering more data or evidence to support a logical solution' },
          { value: 'observe_resolve', label: 'Step back and observe, allowing others to resolve the conflict before offering input' },
          { value: 'structured_process', label: 'Suggest a structured process for conflict resolution, like a facilitated discussion' },
          { value: 'maintain_harmony', label: 'Prioritize maintaining team harmony, even if it means compromising on your preferred solution' }
        ]
      }
    ]
  },
  {
    id: 'strengths-skills',
    title: 'Strengths & Skills',
    description: 'Identifying your core strengths helps us understand where you\'ll excel and what you might need to develop.',
    estimatedTime: 3,
    icon: '💪',
    questions: [
      {
        id: 'keyStrengths',
        type: 'multiselect',
        title: 'Which of the following are your key strengths and skills?',
        description: 'Select the skills and strengths that you feel confident about and enjoy using.',
        required: true,
        maxSelections: 6,
        options: [
          { value: 'analytical_thinking', label: 'Analytical Thinking', description: 'Breaking down complex problems, identifying patterns' },
          { value: 'problem_solving', label: 'Problem-Solving', description: 'Finding effective solutions to challenges' },
          { value: 'creativity', label: 'Creativity', description: 'Generating original ideas, thinking innovatively' },
          { value: 'verbal_communication', label: 'Communication (Verbal)', description: 'Expressing ideas clearly and persuasively' },
          { value: 'written_communication', label: 'Communication (Written)', description: 'Crafting clear, concise, and impactful written content' },
          { value: 'leadership', label: 'Leadership', description: 'Guiding and motivating others, making decisions' },
          { value: 'teamwork', label: 'Teamwork/Collaboration', description: 'Working effectively with others towards a common goal' },
          { value: 'attention_detail', label: 'Attention to Detail', description: 'Meticulousness, accuracy' },
          { value: 'time_management', label: 'Time Management/Organization', description: 'Prioritizing tasks, meeting deadlines' },
          { value: 'technical_proficiency', label: 'Technical Proficiency', description: 'Skilled in specific software, tools, or machinery' },
          { value: 'adaptability', label: 'Adaptability/Flexibility', description: 'Adjusting to new situations and challenges' },
          { value: 'research', label: 'Research', description: 'Gathering and synthesizing information effectively' },
          { value: 'empathy', label: 'Empathy/Interpersonal Skills', description: 'Understanding and connecting with others' },
          { value: 'critical_thinking', label: 'Critical Thinking', description: 'Evaluating information, forming reasoned judgments' },
          { value: 'mathematical', label: 'Mathematical/Quantitative Skills', description: 'Working with numbers, statistics' },
          { value: 'artistic_design', label: 'Artistic/Design Skills', description: 'Visual arts, aesthetics, creative expression' },
          { value: 'practical_hands_on', label: 'Practical/Hands-on Skills', description: 'Building, repairing, operating equipment' }
        ]
      },
      {
        id: 'skillGapResponse',
        type: 'multiselect',
        title: 'You\'re faced with a project that requires a skill you don\'t possess. What\'s your typical reaction?',
        description: 'Select the responses that best describe how you typically handle skill gaps.',
        required: true,
        maxSelections: 3,
        options: [
          { value: 'self_study', label: 'Take the initiative to learn the new skill quickly through self-study or online resources' },
          { value: 'seek_mentor', label: 'Seek out a mentor or expert who can guide you' },
          { value: 'collaborate', label: 'Collaborate with someone who has the required skill' },
          { value: 'break_down', label: 'Break down the task into smaller parts to see if you can manage what you already know' },
          { value: 'different_approach', label: 'Consider if the task can be approached in a different way that leverages your existing strengths' },
          { value: 'avoid_skill', label: 'Focus on finding a solution that avoids the need for that specific skill' }
        ]
      }
    ]
  },
  {
    id: 'career-goals-values',
    title: 'Career Goals & Values',
    description: 'Understanding what you value most in a career helps us align recommendations with your life goals.',
    estimatedTime: 3,
    icon: '🎯',
    questions: [
      {
        id: 'careerValues',
        type: 'multiselect',
        title: 'What do you value most in a future career?',
        description: 'Select the values that are most important to you when considering your career path.',
        required: true,
        maxSelections: 5,
        options: [
          { value: 'impact', label: 'Impact/Making a Difference', description: 'Contributing positively to society or the world' },
          { value: 'financial_reward', label: 'Financial Reward', description: 'High earning potential, financial security' },
          { value: 'work_life_balance', label: 'Work-Life Balance', description: 'Flexibility, time for personal pursuits' },
          { value: 'innovation', label: 'Innovation/Cutting-Edge Work', description: 'Being at the forefront of new developments' },
          { value: 'autonomy', label: 'Autonomy/Independence', description: 'Freedom to make your own decisions' },
          { value: 'creativity_expression', label: 'Creativity/Expression', description: 'Opportunities for artistic or innovative output' },
          { value: 'stability_security', label: 'Stability/Security', description: 'Consistent employment, predictable routine' },
          { value: 'continuous_learning', label: 'Continuous Learning/Growth', description: 'Opportunities for skill development and advancement' },
          { value: 'collaboration_teamwork', label: 'Collaboration/Teamwork', description: 'Working closely with others' },
          { value: 'recognition_prestige', label: 'Recognition/Prestige', description: 'Being respected and acknowledged for your achievements' },
          { value: 'problem_solving_challenges', label: 'Problem-Solving', description: 'Engaging with complex challenges regularly' },
          { value: 'helping_others', label: 'Helping Others', description: 'Direct service or support to individuals' },
          { value: 'travel_exploration', label: 'Travel/Exploration', description: 'Opportunities to see new places' }
        ]
      },
      {
        id: 'jobPreference',
        type: 'multiselect',
        title: 'You\'re offered two job opportunities. Job A offers a higher salary and prestige but less work-life balance. Job B offers a moderate salary and good work-life balance, with opportunities for personal projects. Which would you lean towards, and why?',
        description: 'Select the reasons that best explain your preference.',
        required: true,
        maxSelections: 3,
        options: [
          { value: 'prioritize_financial', label: 'Job A: I prioritize financial growth and professional recognition' },
          { value: 'dedicate_time_career', label: 'Job A: I am willing to dedicate more time to my career for significant impact' },
          { value: 'thrive_pressure', label: 'Job A: I thrive under pressure and enjoy demanding environments' },
          { value: 'value_personal_time', label: 'Job B: I value personal time and well-being highly' },
          { value: 'pursue_diverse_interests', label: 'Job B: I believe in pursuing diverse interests outside of work' },
          { value: 'fulfillment_creative', label: 'Job B: I find fulfillment in creative or personal projects' },
          { value: 'moderate_salary_sufficient', label: 'Job B: A moderate salary is sufficient for my needs' }
        ]
      }
    ]
  },
  {
    id: 'academic-subjects',
    title: 'Academic Subjects',
    description: 'Your academic preferences and strengths provide valuable insights into your learning style and potential career paths.',
    estimatedTime: 3,
    icon: '📚',
    questions: [
      {
        id: 'academicSubjects',
        type: 'multiselect',
        title: 'Which academic subjects did you genuinely enjoy and excel in during your schooling?',
        description: 'Select the subjects that you found engaging and where you performed well.',
        required: true,
        maxSelections: 6,
        options: [
          { value: 'mathematics', label: 'Mathematics (Algebra, Calculus, Statistics)' },
          { value: 'physics', label: 'Physics' },
          { value: 'chemistry', label: 'Chemistry' },
          { value: 'biology', label: 'Biology' },
          { value: 'computer_science', label: 'Computer Science/Programming' },
          { value: 'english_literature', label: 'English/Literature' },
          { value: 'history_social_studies', label: 'History/Social Studies' },
          { value: 'geography', label: 'Geography' },
          { value: 'economics', label: 'Economics' },
          { value: 'business_studies', label: 'Business Studies' },
          { value: 'visual_arts_design', label: 'Visual Arts/Design' },
          { value: 'music_performing_arts', label: 'Music/Performing Arts' },
          { value: 'languages', label: 'Languages (French, Spanish, etc.)' },
          { value: 'physical_education', label: 'Physical Education/Sports Science' },
          { value: 'philosophy_ethics', label: 'Philosophy/Ethics' },
          { value: 'psychology', label: 'Psychology' },
          { value: 'sociology', label: 'Sociology' },
          { value: 'hands_on_learning', label: 'None of the above, I prefer hands-on learning' }
        ]
      },
      {
        id: 'assignmentEngagement',
        type: 'multiselect',
        title: 'When tackling academic assignments, which aspects did you find most engaging?',
        description: 'Select the types of academic work that you found most stimulating and enjoyable.',
        required: true,
        maxSelections: 4,
        options: [
          { value: 'research_analysis', label: 'Conducting in-depth research and analysis' },
          { value: 'writing_essays', label: 'Writing persuasive essays or reports' },
          { value: 'mathematical_problems', label: 'Solving complex mathematical problems' },
          { value: 'experiments', label: 'Designing and conducting experiments' },
          { value: 'group_projects', label: 'Collaborating on group projects' },
          { value: 'presentations', label: 'Presenting information and ideas to others' },
          { value: 'visual_artistic', label: 'Creating visual aids or artistic interpretations' },
          { value: 'debates_discussions', label: 'Debating and discussing different viewpoints' },
          { value: 'practical_applications', label: 'Applying theoretical knowledge to practical scenarios' }
        ]
      }
    ]
  },
  {
    id: 'time-commitment',
    title: 'Time Commitment',
    description: 'Understanding your timeline and commitment level helps us recommend programs that fit your life circumstances.',
    estimatedTime: 2,
    icon: '⏰',
    questions: [
      {
        id: 'timeCommitment',
        type: 'multiselect',
        title: 'How long are you realistically willing to commit to your higher education studies?',
        description: 'Select the timeframes that align with your current life situation and goals.',
        required: true,
        options: [
          { value: '1_2_years', label: '1-2 years (e.g., Diploma, Certificate)' },
          { value: '3_4_years', label: '3-4 years (e.g., Bachelor\'s Degree)' },
          { value: '5_6_years', label: '5-6 years (e.g., Bachelor\'s + Master\'s, or some professional degrees)' },
          { value: '7_plus_years', label: '7+ years (e.g., Doctoral studies, extensive professional degrees)' },
          { value: 'flexible', label: 'I\'m open to various durations if the program is the right fit' }
        ]
      },
      {
        id: 'extendedCommitment',
        type: 'multiselect',
        title: 'A university program you\'re highly interested in requires a significantly longer time commitment than you initially planned. How would you approach this?',
        description: 'Select the responses that best reflect your attitude toward extended commitments.',
        required: true,
        maxSelections: 3,
        options: [
          { value: 'open_longer_commitment', label: 'I would be open to the longer commitment if the long-term career benefits are substantial' },
          { value: 'research_alternatives', label: 'I would research alternative programs that fit my desired timeline' },
          { value: 'consider_financial_impact', label: 'I would consider how this affects my financial situation and overall life plan' },
          { value: 'weigh_passion_against_time', label: 'I would weigh the passion for the subject against the additional time investment' },
          { value: 'accelerate_studies', label: 'I would try to find ways to accelerate my studies or gain credit for prior learning' }
        ]
      }
    ]
  },
  {
    id: 'budget-considerations',
    title: 'Budget Considerations',
    description: 'Financial planning is crucial for your educational journey. Let\'s understand your budget priorities.',
    estimatedTime: 2,
    icon: '💰',
    questions: [
      {
        id: 'financialConsiderations',
        type: 'multiselect',
        title: 'What are your primary financial considerations for university education?',
        description: 'Select the financial factors that are most important to you.',
        required: true,
        maxSelections: 4,
        options: [
          { value: 'minimize_tuition', label: 'Minimizing tuition costs is a top priority' },
          { value: 'access_scholarships', label: 'Access to scholarships, grants, or financial aid is essential' },
          { value: 'prepared_loans', label: 'I am prepared to take on student loans if necessary' },
          { value: 'part_time_work', label: 'I prefer programs with opportunities for part-time work or co-op' },
          { value: 'quality_over_cost', label: 'Cost is a factor, but quality and fit are more important' },
          { value: 'financial_support', label: 'I have significant financial support available' },
          { value: 'strong_roi', label: 'I am looking for programs that offer a strong return on investment (ROI)' }
        ]
      },
      {
        id: 'tuitionChallenge',
        type: 'multiselect',
        title: 'You are accepted into your dream program, but the tuition is higher than you anticipated. What\'s your next step?',
        description: 'Select the approaches you would take to address this financial challenge.',
        required: true,
        maxSelections: 3,
        options: [
          { value: 'search_scholarships', label: 'Actively search for all possible scholarships, grants, and bursaries' },
          { value: 'explore_loans', label: 'Explore student loan options and repayment plans' },
          { value: 'consider_alternatives', label: 'Consider alternative, more affordable programs in the same field' },
          { value: 'discuss_financial_advisors', label: 'Discuss financial options with family or financial advisors' },
          { value: 'work_save_first', label: 'Look for opportunities to work part-time or save money before starting' },
          { value: 'reassess_benefits', label: 'Re-evaluate if the long-term benefits of the program outweigh the increased cost' }
        ]
      }
    ]
  },
  {
    id: 'location-preferences',
    title: 'Location Preferences',
    description: 'Where you study can significantly impact your experience and opportunities. Let\'s explore your preferences.',
    estimatedTime: 3,
    icon: '🌍',
    questions: [
      {
        id: 'studyLocation',
        type: 'multiselect',
        title: 'Where would you prefer to study?',
        description: 'Select the location preferences that align with your goals and comfort level.',
        required: true,
        maxSelections: 3,
        options: [
          { value: 'current_city', label: 'My current city/region (staying close to home)' },
          { value: 'another_city_country', label: 'Another city within my country' },
          { value: 'internationally', label: 'Internationally (another country)' },
          { value: 'specific_climate', label: 'Specific climate/environment (e.g., urban, rural, warm, cold)' },
          { value: 'open_various_locations', label: 'I am open to various locations if the program is ideal' },
          { value: 'online_remote', label: 'Online/Remote learning options are preferred' }
        ]
      },
      {
        id: 'locationFactors',
        type: 'multiselect',
        title: 'What factors are most important to you when considering a study location?',
        description: 'Select the factors that would most influence your location decision.',
        required: true,
        maxSelections: 5,
        options: [
          { value: 'proximity_family', label: 'Proximity to family/friends: Staying connected to my support network' },
          { value: 'cultural_experience', label: 'Cultural experience: Desiring exposure to new cultures and perspectives' },
          { value: 'cost_of_living', label: 'Cost of living: Seeking an affordable city/region' },
          { value: 'job_opportunities', label: 'Job opportunities: Access to relevant internships or post-graduation employment' },
          { value: 'university_reputation', label: 'Reputation of the university/program: Prioritizing academic excellence' },
          { value: 'lifestyle_activities', label: 'Lifestyle/Activities: Availability of hobbies, social scene, outdoor activities' },
          { value: 'safety_security', label: 'Safety and security: Feeling comfortable and safe in the environment' },
          { value: 'industry_hubs', label: 'Access to specific industries/companies: Being near hubs for my target career' },
          { value: 'diversity_inclusivity', label: 'Diversity and inclusivity: A welcoming and diverse student body and community' }
        ]
      },
      {
        id: 'locationDecision',
        type: 'multiselect',
        title: 'You\'ve found an ideal program, but it\'s located in a city or country you hadn\'t initially considered. How would you weigh this decision?',
        description: 'Select the approaches you would take to evaluate this location change.',
        required: true,
        maxSelections: 3,
        options: [
          { value: 'research_location', label: 'I would research the new location thoroughly, considering its pros and cons' },
          { value: 'open_to_change', label: 'I would be open to the change if the program truly aligns with my goals' },
          { value: 'visit_location', label: 'I would consider visiting the location to get a feel for it before committing' },
          { value: 'assess_logistical_challenges', label: 'I would assess the logistical challenges (visa, housing, travel) and my willingness to overcome them' },
          { value: 'prioritize_program_quality', label: 'I would prioritize the program quality over the geographical location' },
          { value: 'location_deal_breaker', label: 'The location would be a deal-breaker if it doesn\'t align with my comfort zone' }
        ]
      }
    ]
  },
  {
    id: 'open-ended',
    title: 'Additional Insights',
    description: 'These optional questions help us understand your unique situation and provide more personalized recommendations.',
    estimatedTime: 5,
    icon: '💭',
    questions: [
      {
        id: 'additionalInfo',
        type: 'textarea',
        title: 'Is there anything else you want us to know about your unique situation, aspirations, or challenges?',
        description: 'This helps us provide more personalized recommendations.',
        placeholder: 'Share any additional context about your background, goals, or circumstances that might influence your program recommendations...',
        required: false,
        helpText: 'Optional: Share any unique circumstances, challenges, or aspirations that could help us better understand your situation.'
      },
      {
        id: 'idealDay',
        type: 'textarea',
        title: 'Imagine your ideal "typical day" ten years from now. What does it look like?',
        description: 'Consider your work, personal life, hobbies, and environment.',
        placeholder: 'Describe your ideal typical day in the future, including where you work, what you do, who you interact with, and how you spend your time...',
        required: false,
        helpText: 'Optional: This helps us understand your long-term vision and lifestyle preferences.'
      },
      {
        id: 'nonNegotiables',
        type: 'textarea',
        title: 'What is one thing you are absolutely not willing to compromise on when it comes to your education and future career?',
        description: 'This could be related to values, lifestyle, location, or any other factor.',
        placeholder: 'Share the one thing that is most important to you and that you won\'t give up...',
        required: false,
        helpText: 'Optional: Understanding your non-negotiables helps us filter recommendations to match your core values.'
      }
    ]
  }
];

export const TOTAL_QUIZ_TIME = QUIZ_SECTIONS.reduce((total, section) => total + section.estimatedTime, 0);

/**
 * Filter sections based on user responses and adaptive logic
 */
export function getFilteredSections(responses: Record<string, string[] | string>): QuizSection[] {
  return QUIZ_SECTIONS.filter(section => {
    // Check if section has showFor conditions
    if (!section.showFor) return true;
    
    // Check education level conditions
    if (section.showFor.educationLevel) {
      const userEducationLevel = responses.educationLevel as string[];
      if (!userEducationLevel || !section.showFor.educationLevel.some(level => userEducationLevel.includes(level))) {
        return false;
      }
    }
    
    // Check program interest conditions
    if (section.showFor.programInterest) {
      const userProgramInterest = responses.programInterest as string[];
      if (!userProgramInterest || !section.showFor.programInterest.some(interest => userProgramInterest.includes(interest))) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Filter questions within a section based on conditional logic
 */
export function getFilteredQuestions(section: QuizSection, responses: Record<string, string[] | string>): QuizQuestion[] {
  return section.questions.filter(question => {
    // Check if question has conditional logic
    if (!question.conditionalLogic) return true;
    
    const { dependsOn, showWhen } = question.conditionalLogic;
    const dependentResponse = responses[dependsOn];
    
    if (!dependentResponse) return false;
    
    // Check if the dependent response matches any of the showWhen values
    if (Array.isArray(dependentResponse)) {
      return dependentResponse.some(response => showWhen.includes(response));
    } else {
      return showWhen.includes(dependentResponse as string);
    }
  });
}

/**
 * Get the next section based on current responses
 */
export function getNextSection(currentSectionId: string, responses: Record<string, string[] | string>): QuizSection | undefined {
  const filteredSections = getFilteredSections(responses);
  const currentIndex = filteredSections.findIndex(section => section.id === currentSectionId);
  
  if (currentIndex === -1 || currentIndex === filteredSections.length - 1) {
    return undefined;
  }
  
  return filteredSections[currentIndex + 1];
}

/**
 * Get the previous section based on current responses
 */
export function getPreviousSection(currentSectionId: string, responses: Record<string, string[] | string>): QuizSection | undefined {
  const filteredSections = getFilteredSections(responses);
  const currentIndex = filteredSections.findIndex(section => section.id === currentSectionId);
  
  if (currentIndex <= 0) {
    return undefined;
  }
  
  return filteredSections[currentIndex - 1];
}

/**
 * Calculate progress percentage based on filtered sections
 */
export function getAdaptiveProgressPercentage(completedSections: string[], responses: Record<string, string[] | string>): number {
  const filteredSections = getFilteredSections(responses);
  const totalSections = filteredSections.length;
  
  if (totalSections === 0) return 0;
  
  const completedFilteredSections = completedSections.filter(sectionId => 
    filteredSections.some(section => section.id === sectionId)
  );
  
  const progress = (completedFilteredSections.length / totalSections) * 100;
  
  // Ensure we return a valid number between 0 and 100
  if (isNaN(progress) || !isFinite(progress)) {
    return 0;
  }
  
  return Math.max(0, Math.min(100, progress));
}

/**
 * Get total questions count for filtered sections
 */
export function getAdaptiveTotalQuestions(responses: Record<string, string[] | string>): number {
  const filteredSections = getFilteredSections(responses);
  let totalQuestions = 0;
  
  filteredSections.forEach(section => {
    const filteredQuestions = getFilteredQuestions(section, responses);
    totalQuestions += filteredQuestions.length;
  });
  
  return totalQuestions;
}

export const getSectionById = (id: string): QuizSection | undefined => {
  return QUIZ_SECTIONS.find(section => section.id === id);
};

export const getQuestionById = (sectionId: string, questionId: string): QuizQuestion | undefined => {
  const section = getSectionById(sectionId);
  if (!section) return undefined;
  
  return section.questions.find(question => question.id === questionId);
};

export const getTotalQuestions = (): number => {
  return QUIZ_SECTIONS.reduce((total, section) => total + section.questions.length, 0);
};

export const getProgressPercentage = (completedSections: string[]): number => {
  return (completedSections.length / QUIZ_SECTIONS.length) * 100;
}; 