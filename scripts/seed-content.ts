import { connectToDatabase } from '../lib/mongodb';
import Content from '../models/Content';

const sampleContent = [
  {
    title: 'Top 10 Scholarship Application Tips for International Students',
    slug: 'scholarship-application-tips-international-students',
    content: `
      <h2>Introduction</h2>
      <p>Applying for scholarships as an international student can be challenging, but with the right approach, you can significantly increase your chances of success. Here are our top 10 tips to help you navigate the scholarship application process.</p>
      
      <h2>1. Start Early</h2>
      <p>Begin your scholarship search at least 12-18 months before you plan to start your studies. Many scholarships have early deadlines, and you'll need time to gather all required documents.</p>
      
      <h2>2. Research Thoroughly</h2>
      <p>Don't limit yourself to just the most popular scholarships. Research country-specific, field-specific, and university-specific opportunities. Use multiple sources including university websites, government portals, and scholarship databases.</p>
      
      <h2>3. Meet All Requirements</h2>
      <p>Carefully read through all eligibility criteria and requirements. Missing even one requirement can disqualify your application. Make a checklist and ensure you meet every single criterion.</p>
      
      <h2>4. Prepare Strong Essays</h2>
      <p>Your personal statement or essay is often the most important part of your application. Be authentic, tell your unique story, and explain how the scholarship will help you achieve your goals.</p>
      
      <h2>5. Get Strong Recommendations</h2>
      <p>Choose recommenders who know you well and can speak to your academic abilities, character, and potential. Give them plenty of time to write thoughtful recommendations.</p>
      
      <h2>6. Maintain Excellent Academic Records</h2>
      <p>Most scholarships require a minimum GPA. Aim to maintain excellent grades throughout your academic career, as this is often a key selection criterion.</p>
      
      <h2>7. Demonstrate Leadership and Involvement</h2>
      <p>Scholarship committees look for well-rounded individuals. Participate in extracurricular activities, volunteer work, and leadership roles that align with your field of study.</p>
      
      <h2>8. Prepare for Interviews</h2>
      <p>If your scholarship includes an interview, prepare thoroughly. Practice common questions, research the organization offering the scholarship, and be ready to discuss your goals and motivations.</p>
      
      <h2>9. Submit Complete Applications</h2>
      <p>Double-check that all required documents are included and properly formatted. Incomplete applications are typically rejected immediately.</p>
      
      <h2>10. Follow Up Appropriately</h2>
      <p>After submitting your application, follow up politely to confirm receipt and check on the status. This shows your continued interest and professionalism.</p>
      
      <h2>Conclusion</h2>
      <p>Remember that scholarship applications are competitive, but persistence and thorough preparation can make all the difference. Don't get discouraged by rejections - keep applying and improving your applications.</p>
    `,
    excerpt: 'Discover the essential strategies and tips that can help international students successfully navigate the competitive scholarship application process and secure funding for their education.',
    type: 'blog',
    status: 'published',
    author: 'Eddura Team',
    publishDate: new Date('2024-01-15'),
    categories: ['Scholarships', 'International Students', 'Application Tips'],
    tags: ['scholarships', 'international students', 'application tips', 'funding', 'education'],
    metaTitle: 'Top 10 Scholarship Application Tips for International Students',
    metaDescription: 'Essential strategies and tips for international students to successfully navigate the competitive scholarship application process and secure funding.',
    keywords: ['scholarship application', 'international students', 'funding', 'education tips'],
    featuredImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=800',
    cta: {
      enabled: true,
      title: 'Find Your Perfect Scholarship',
      description: 'Join our platform to discover thousands of scholarship opportunities tailored to your profile and goals.',
      buttonText: 'Browse Scholarships',
      buttonLink: '/scholarships',
      position: 'bottom',
      style: 'primary'
    }
  },
  {
    title: 'Fulbright Scholarship Program 2024-2025',
    slug: 'fulbright-scholarship-program-2024-2025',
    content: `
      <h2>About the Fulbright Program</h2>
      <p>The Fulbright Program is one of the most prestigious international exchange programs, offering opportunities for students, scholars, teachers, artists, and professionals to study, teach, and conduct research in the United States.</p>
      
      <h2>Program Overview</h2>
      <p>The Fulbright Program provides funding for graduate study, research, and teaching in the United States. It is designed to increase mutual understanding between the people of the United States and other countries through educational and cultural exchange.</p>
      
      <h2>Eligibility Requirements</h2>
      <ul>
        <li>Citizenship in a participating country</li>
        <li>Bachelor's degree or equivalent</li>
        <li>Strong academic record</li>
        <li>English language proficiency</li>
        <li>Leadership potential</li>
        <li>Commitment to return to home country</li>
      </ul>
      
      <h2>Benefits</h2>
      <ul>
        <li>Full tuition and fees coverage</li>
        <li>Monthly stipend for living expenses</li>
        <li>Health insurance</li>
        <li>Travel allowance</li>
        <li>Professional development opportunities</li>
      </ul>
      
      <h2>Application Process</h2>
      <p>The application process varies by country. Generally, it includes:</p>
      <ol>
        <li>Online application submission</li>
        <li>Academic transcripts and diplomas</li>
        <li>Letters of recommendation</li>
        <li>Personal statement</li>
        <li>Research proposal (for research applicants)</li>
        <li>English language test scores</li>
        <li>Interview with selection committee</li>
      </ol>
    `,
    excerpt: 'Apply for the prestigious Fulbright Scholarship Program 2024-2025. Full funding for graduate study, research, and teaching opportunities in the United States.',
    type: 'opportunity',
    status: 'published',
    author: 'Eddura Team',
    publishDate: new Date('2024-01-10'),
    categories: ['Scholarships', 'Graduate Studies', 'Research'],
    tags: ['fulbright', 'scholarship', 'graduate studies', 'research', 'united states'],
    opportunityType: 'scholarship',
    deadline: new Date('2024-10-15'),
    value: 'Full tuition + $25,000 annual stipend',
    eligibility: 'Citizens of participating countries with bachelor\'s degree and strong academic record',
    applicationLink: 'https://fulbright.state.gov/apply.html',
    metaTitle: 'Fulbright Scholarship Program 2024-2025 - Full Funding for International Students',
    metaDescription: 'Apply for the prestigious Fulbright Scholarship Program. Full funding for graduate study, research, and teaching opportunities in the United States.',
    keywords: ['fulbright scholarship', 'graduate funding', 'international students', 'research opportunities'],
    featuredImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=800',
    cta: {
      enabled: true,
      title: 'Discover More Opportunities',
      description: 'Join our platform to find thousands of scholarship opportunities like this one, tailored to your profile.',
      buttonText: 'Join Platform',
      buttonLink: '/auth/signup',
      position: 'bottom',
      style: 'primary'
    }
  },
  {
    title: 'Global Education Summit 2024: Future of Learning',
    slug: 'global-education-summit-2024-future-of-learning',
    content: `
      <h2>Event Overview</h2>
      <p>Join us for the Global Education Summit 2024, where education leaders, innovators, and policymakers will come together to discuss the future of learning and explore emerging trends in education technology.</p>
      
      <h2>Key Topics</h2>
      <ul>
        <li>Artificial Intelligence in Education</li>
        <li>Digital Learning Platforms</li>
        <li>Personalized Learning</li>
        <li>Global Education Access</li>
        <li>Skills for the Future Workforce</li>
        <li>Sustainable Education Models</li>
      </ul>
      
      <h2>Featured Speakers</h2>
      <ul>
        <li>Dr. Sarah Johnson - Director of Educational Technology, Stanford University</li>
        <li>Prof. Michael Chen - AI Research Lead, MIT</li>
        <li>Dr. Emily Rodriguez - Global Education Policy Expert</li>
        <li>James Wilson - CEO, EdTech Innovations</li>
      </ul>
      
      <h2>Event Schedule</h2>
      <p><strong>Day 1 - Opening Ceremony and Keynotes</strong></p>
      <ul>
        <li>9:00 AM - Registration and Networking</li>
        <li>10:00 AM - Opening Keynote: The Future of Education</li>
        <li>11:30 AM - Panel Discussion: AI in Education</li>
        <li>2:00 PM - Workshop Sessions</li>
        <li>5:00 PM - Networking Reception</li>
      </ul>
      
      <p><strong>Day 2 - Deep Dive Sessions</strong></p>
      <ul>
        <li>9:00 AM - Breakout Sessions</li>
        <li>11:00 AM - Innovation Showcase</li>
        <li>2:00 PM - Policy Roundtable</li>
        <li>4:00 PM - Closing Ceremony</li>
      </ul>
    `,
    excerpt: 'Join the Global Education Summit 2024 to explore the future of learning, AI in education, and emerging trends in educational technology.',
    type: 'event',
    status: 'published',
    author: 'Eddura Team',
    publishDate: new Date('2024-01-05'),
    categories: ['Events', 'Education Technology', 'Conferences'],
    tags: ['education summit', 'edtech', 'AI in education', 'conference', 'networking'],
    eventDate: new Date('2024-06-15T09:00:00Z'),
    eventEndDate: new Date('2024-06-16T17:00:00Z'),
    eventLocation: 'San Francisco Convention Center, CA',
    eventType: 'in-person',
    registrationLink: 'https://globaledusummit2024.eventbrite.com',
    metaTitle: 'Global Education Summit 2024: Future of Learning - San Francisco',
    metaDescription: 'Join education leaders and innovators at the Global Education Summit 2024 to explore AI in education and the future of learning.',
    keywords: ['education summit', 'edtech conference', 'AI education', 'learning technology'],
    featuredImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    cta: {
      enabled: true,
      title: 'Stay Updated on Education Events',
      description: 'Join our platform to get notified about upcoming educational events and opportunities.',
      buttonText: 'Get Notifications',
      buttonLink: '/auth/signup',
      position: 'bottom',
      style: 'secondary'
    }
  },
  {
    title: 'How to Write a Winning Personal Statement',
    slug: 'how-to-write-winning-personal-statement',
    content: `
      <h2>Introduction</h2>
      <p>Your personal statement is often the most important part of your application. It's your opportunity to tell your story, showcase your personality, and convince the selection committee why you're the perfect candidate.</p>
      
      <h2>Understanding the Purpose</h2>
      <p>A personal statement serves multiple purposes:</p>
      <ul>
        <li>Demonstrates your writing ability</li>
        <li>Shows your personality and character</li>
        <li>Explains your motivation and goals</li>
        <li>Connects your past experiences to future aspirations</li>
        <li>Sets you apart from other applicants</li>
      </ul>
      
      <h2>Structure and Content</h2>
      <h3>1. Opening Hook</h3>
      <p>Start with a compelling opening that grabs the reader's attention. This could be a personal anecdote, a surprising fact, or a powerful statement about your goals.</p>
      
      <h3>2. Background and Context</h3>
      <p>Provide context about your background, experiences, and what led you to this point. Be specific and use concrete examples.</p>
      
      <h3>3. Academic and Professional Journey</h3>
      <p>Discuss your academic achievements, relevant coursework, research experience, and any professional experience that relates to your field of interest.</p>
      
      <h3>4. Motivation and Goals</h3>
      <p>Clearly articulate why you want to pursue this opportunity and what you hope to achieve. Connect your past experiences to your future goals.</p>
      
      <h3>5. Why This Program/Institution</h3>
      <p>Explain specifically why this program or institution is the right fit for you. Show that you've done your research.</p>
      
      <h3>6. Conclusion</h3>
      <p>End with a strong conclusion that reinforces your main points and leaves a lasting impression.</p>
      
      <h2>Writing Tips</h2>
      <ul>
        <li><strong>Be authentic:</strong> Write in your own voice and be honest about your experiences</li>
        <li><strong>Show, don't tell:</strong> Use specific examples and anecdotes to illustrate your points</li>
        <li><strong>Be concise:</strong> Stick to the word limit and make every word count</li>
        <li><strong>Proofread carefully:</strong> Eliminate grammar and spelling errors</li>
        <li><strong>Get feedback:</strong> Have others read your statement and provide feedback</li>
      </ul>
      
      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li>Generic statements that could apply to anyone</li>
        <li>Focusing too much on childhood experiences</li>
        <li>Being too informal or using slang</li>
        <li>Including irrelevant information</li>
        <li>Not following the prompt or guidelines</li>
        <li>Submitting without thorough proofreading</li>
      </ul>
      
      <h2>Example Structure</h2>
      <p>Here's a recommended structure for a 500-word personal statement:</p>
      <ol>
        <li>Opening hook (50 words)</li>
        <li>Background and motivation (150 words)</li>
        <li>Academic/professional journey (150 words)</li>
        <li>Specific goals and fit (100 words)</li>
        <li>Conclusion (50 words)</li>
      </ol>
    `,
    excerpt: 'Master the art of writing compelling personal statements that will help you stand out in competitive applications for scholarships, graduate programs, and opportunities.',
    type: 'blog',
    status: 'published',
    author: 'Dr. Sarah Johnson',
    publishDate: new Date('2024-01-20'),
    categories: ['Application Tips', 'Writing', 'Personal Development'],
    tags: ['personal statement', 'application writing', 'scholarship tips', 'graduate school'],
    metaTitle: 'How to Write a Winning Personal Statement - Complete Guide',
    metaDescription: 'Master the art of writing compelling personal statements with our complete guide. Learn structure, tips, and common mistakes to avoid.',
    keywords: ['personal statement', 'application writing', 'scholarship application', 'graduate school'],
    featuredImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    cta: {
      enabled: true,
      title: 'Get Expert Application Help',
      description: 'Join our platform to access expert guidance, application templates, and personalized support for your applications.',
      buttonText: 'Get Expert Help',
      buttonLink: '/auth/signup',
      position: 'inline',
      style: 'outline'
    }
  }
];

async function seedContent() {
  try {
    await connectToDatabase();
    
    console.log('🌱 Seeding content...');
    
    // Clear existing content
    await Content.deleteMany({});
    console.log('✅ Cleared existing content');
    
    // Insert sample content
    const insertedContent = await Content.insertMany(sampleContent);
    console.log(`✅ Inserted ${insertedContent.length} content items`);
    
    console.log('🎉 Content seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding content:', error);
    process.exit(1);
  }
}

seedContent();