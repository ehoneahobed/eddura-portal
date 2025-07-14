import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import connectDB from '../lib/mongodb';
import LibraryDocument from '../models/LibraryDocument';
import Admin from '../models/Admin';

const sampleDocuments = [
  {
    title: "Computer Science Graduate School Personal Statement",
    description: "A comprehensive personal statement template for computer science graduate school applications, focusing on research interests and academic background.",
    content: `I am writing to express my strong interest in pursuing a Master's degree in Computer Science at [University Name]. My passion for technology and problem-solving has been the driving force behind my academic and professional journey.

During my undergraduate studies in Computer Science at [Your University], I developed a strong foundation in algorithms, data structures, and software engineering principles. My coursework in machine learning and artificial intelligence particularly fascinated me, leading me to pursue research opportunities in these areas.

My research experience includes working on [specific project], where I developed [describe your contribution]. This project taught me the importance of interdisciplinary collaboration and the practical applications of theoretical computer science concepts.

I am particularly interested in [specific research area] and believe that [University Name]'s program offers the perfect environment for me to further develop my skills and contribute to cutting-edge research in this field.

My long-term goal is to [describe your career aspirations] and I believe that this program will provide me with the necessary tools and knowledge to achieve these objectives.`,
    documentType: "Personal Statement",
    type: "Personal Statement",
    category: "academic",
    subcategory: "graduate",
    tags: ["computer science", "graduate school", "personal statement", "research", "machine learning"],
    estimatedReadingTime: "8",
    difficultyLevel: "Intermediate",
    targetAudience: "graduate",
    fieldOfStudy: ["Computer Science"],
    learningObjectives: "Learn how to structure a compelling personal statement for CS graduate school applications",
    prerequisites: "Basic understanding of computer science concepts",
    relatedResources: "Graduate school application guides, CS research papers",
    authorNotes: "This template has been used successfully by multiple students admitted to top CS programs",
    isTemplate: true,
    allowCloning: true,
    requireReview: false,
    status: "published",
    reviewStatus: "approved",
    qualityScore: 9.2,
    viewCount: 0,
    cloneCount: 0,
    averageRating: 0,
    ratingCount: 0,
    language: "en",
    wordCount: 500,
    characterCount: 3500
  },
  {
    title: "Statement of Purpose for Engineering Programs",
    description: "A detailed statement of purpose template specifically designed for engineering graduate programs, emphasizing technical skills and research interests.",
    content: `STATEMENT OF PURPOSE

My interest in engineering began during my high school years when I first encountered the principles of physics and mathematics. This fascination led me to pursue a Bachelor's degree in [Engineering Field] at [University Name], where I have developed a strong foundation in both theoretical and practical aspects of engineering.

ACADEMIC BACKGROUND
During my undergraduate studies, I maintained a GPA of [X.XX] and completed coursework in [list relevant courses]. My academic performance reflects my commitment to excellence and my ability to handle rigorous coursework.

RESEARCH EXPERIENCE
My research experience includes working on [specific project] under the supervision of Dr. [Name]. This project focused on [describe the project] and resulted in [describe outcomes]. This experience taught me the importance of systematic problem-solving and the value of collaborative research.

TECHNICAL SKILLS
I have developed proficiency in [list technical skills, software, programming languages]. These skills have been instrumental in my academic and research work, and I believe they will be valuable in my graduate studies.

RESEARCH INTERESTS
I am particularly interested in [specific research area] and its applications in [industry/field]. The research being conducted at [University Name] in [specific lab or department] aligns perfectly with my interests and goals.

CAREER GOALS
Upon completion of my graduate degree, I plan to [describe your career goals]. I believe that the program at [University Name] will provide me with the necessary skills and knowledge to achieve these objectives.

CONCLUSION
I am confident that my academic background, research experience, and passion for engineering make me a strong candidate for your program. I look forward to the opportunity to contribute to the research community at [University Name] and to further develop my skills and knowledge in this field.`,
    documentType: "Statement of Purpose",
    type: "Statement of Purpose",
    category: "academic",
    subcategory: "graduate",
    tags: ["engineering", "statement of purpose", "graduate school", "research", "technical skills"],
    estimatedReadingTime: "12",
    difficultyLevel: "Intermediate",
    targetAudience: "graduate",
    fieldOfStudy: ["Engineering"],
    learningObjectives: "Understand how to write a compelling statement of purpose for engineering programs",
    prerequisites: "Basic understanding of engineering principles",
    relatedResources: "Engineering graduate school guides, research methodology resources",
    authorNotes: "This template emphasizes technical skills and research experience, which are crucial for engineering applications",
    isTemplate: true,
    allowCloning: true,
    requireReview: false,
    status: "published",
    reviewStatus: "approved",
    qualityScore: 8.8,
    viewCount: 0,
    cloneCount: 0,
    averageRating: 0,
    ratingCount: 0,
    language: "en",
    wordCount: 700,
    characterCount: 4800
  },
  {
    title: "Academic CV Template for Graduate Students",
    description: "A comprehensive academic CV template designed specifically for graduate students and early-career researchers.",
    content: `[YOUR NAME]
[Your Address]
[City, State ZIP Code]
[Phone Number]
[Email Address]
[LinkedIn Profile (optional)]

EDUCATION
[University Name], [City, State]
[Degree Type] in [Field of Study], Expected [Graduation Date]
GPA: [X.XX]/4.00
Relevant Coursework: [Course 1], [Course 2], [Course 3]

[Previous University], [City, State]
[Previous Degree] in [Field of Study], [Graduation Date]
GPA: [X.XX]/4.00

RESEARCH EXPERIENCE
[Research Position Title], [University/Institution]
[Start Date] - [End Date]
• Conducted research on [specific topic]
• Developed [specific methodology or tool]
• Collaborated with [team members/departments]
• Presented findings at [conference/meeting]

[Previous Research Experience]
[Start Date] - [End Date]
• [Description of research activities]

PUBLICATIONS
[Author(s)]. "[Title of Paper]." [Journal/Conference Name], [Year].
[Include DOI or URL if available]

[Additional publications...]

PRESENTATIONS
"[Title of Presentation]," [Conference/Event Name], [Location], [Date].

[Additional presentations...]

TEACHING EXPERIENCE
[Teaching Position], [University/Department]
[Start Date] - [End Date]
• Taught [course name] to [number] students
• Developed course materials and assessments
• Provided office hours and student support

[Additional teaching experience...]

LEADERSHIP & SERVICE
[Leadership Role], [Organization]
[Start Date] - [End Date]
• [Description of responsibilities and achievements]

[Additional leadership roles...]

SKILLS
Technical Skills: [List relevant technical skills]
Programming Languages: [List programming languages]
Software: [List relevant software]
Languages: [List languages and proficiency levels]

AWARDS & HONORS
[Year] [Award Name], [Institution/Organization]
[Year] [Scholarship Name], [Institution/Organization]

PROFESSIONAL MEMBERSHIPS
[Organization Name], [Membership Type], [Year] - Present

REFERENCES
[Available upon request or list specific references]`,
    documentType: "Academic CV",
    type: "Academic CV",
    category: "academic",
    subcategory: "graduate",
    tags: ["academic cv", "graduate students", "research", "teaching", "publications"],
    estimatedReadingTime: "15",
    difficultyLevel: "Beginner",
    targetAudience: "graduate",
    fieldOfStudy: ["General"],
    learningObjectives: "Learn how to structure an academic CV and highlight research and teaching experience",
    prerequisites: "Basic understanding of academic writing",
    relatedResources: "Academic writing guides, CV writing resources",
    authorNotes: "This template follows standard academic CV conventions and can be adapted for various fields",
    isTemplate: true,
    allowCloning: true,
    requireReview: false,
    status: "published",
    reviewStatus: "approved",
    qualityScore: 9.0,
    viewCount: 0,
    cloneCount: 0,
    averageRating: 0,
    ratingCount: 0,
    language: "en",
    wordCount: 900,
    characterCount: 6000
  },
  {
    title: "Scholarship Essay: Overcoming Adversity",
    description: "A compelling scholarship essay template that demonstrates resilience and determination in the face of challenges.",
    content: `Overcoming adversity has been a defining theme in my academic journey. Growing up in [describe your background], I faced numerous challenges that could have derailed my educational aspirations. However, these obstacles only strengthened my resolve to succeed and to help others facing similar struggles.

My family's financial situation was always precarious, with my parents working multiple jobs to make ends meet. Despite these challenges, they instilled in me the value of education and the importance of perseverance. I learned early on that success requires not just intelligence, but also determination and hard work.

During my sophomore year of high school, my family faced a particularly difficult period when [describe specific challenge]. This experience taught me the importance of resilience and adaptability. Instead of allowing these circumstances to hinder my academic progress, I used them as motivation to excel in my studies and to seek out opportunities for growth.

I became actively involved in [describe activities/organizations], where I discovered my passion for [specific field or cause]. This involvement not only helped me develop leadership skills but also allowed me to give back to my community and support others who were facing similar challenges.

My academic achievements, including [list specific achievements], demonstrate my commitment to excellence despite the obstacles I've faced. I have maintained a [GPA] GPA while working [number] hours per week to help support my family and participating in [list activities].

The scholarship I am applying for would not only provide financial support for my education but would also validate the hard work and determination that have brought me to this point. It would allow me to focus more fully on my studies and to continue making a positive impact in my community.

I am committed to using my education to [describe your future goals and how you plan to help others]. I believe that my experiences with adversity have given me a unique perspective and the resilience necessary to succeed in my chosen field and to make meaningful contributions to society.

In conclusion, while adversity has been a constant presence in my life, it has also been my greatest teacher. It has taught me the value of perseverance, the importance of community support, and the power of education to transform lives. I am confident that these lessons, combined with my academic achievements and commitment to service, make me an excellent candidate for this scholarship.`,
    documentType: "Scholarship Essay",
    type: "Scholarship Essay",
    category: "academic",
    subcategory: "undergraduate",
    tags: ["scholarship essay", "overcoming adversity", "personal story", "resilience", "community service"],
    estimatedReadingTime: "10",
    difficultyLevel: "Intermediate",
    targetAudience: "undergraduate",
    fieldOfStudy: ["General"],
    learningObjectives: "Learn how to write a compelling scholarship essay that demonstrates resilience and determination",
    prerequisites: "Basic writing skills",
    relatedResources: "Scholarship application guides, essay writing resources",
    authorNotes: "This template emphasizes personal growth and community impact, which are often valued by scholarship committees",
    isTemplate: true,
    allowCloning: true,
    requireReview: false,
    status: "published",
    reviewStatus: "approved",
    qualityScore: 8.5,
    viewCount: 0,
    cloneCount: 0,
    averageRating: 0,
    ratingCount: 0,
    language: "en",
    wordCount: 600,
    characterCount: 4200
  },
  {
    title: "Research Proposal: Machine Learning Applications",
    description: "A comprehensive research proposal template for machine learning projects, including methodology and expected outcomes.",
    content: `RESEARCH PROPOSAL: [PROJECT TITLE]

1. INTRODUCTION
Machine learning has emerged as a transformative technology with applications across various domains. This research proposal outlines a study to [describe your specific research objective] using machine learning techniques.

1.1 Background
[Provide context about the problem you're addressing and why it's important]

1.2 Problem Statement
[Clearly state the specific problem your research will address]

1.3 Research Objectives
The primary objectives of this research are:
• [Objective 1]
• [Objective 2]
• [Objective 3]

2. LITERATURE REVIEW
2.1 Current State of the Art
[Summarize existing research in your area]

2.2 Gaps in Current Research
[Identify what hasn't been done or what can be improved]

2.3 Theoretical Framework
[Describe the theoretical basis for your approach]

3. METHODOLOGY
3.1 Research Design
[Describe your overall research approach]

3.2 Data Collection
[Explain how you will collect and prepare your data]

3.3 Proposed Algorithm/Model
[Describe the specific machine learning approach you will use]

3.4 Evaluation Metrics
[Define how you will measure success]

4. EXPECTED OUTCOMES
4.1 Technical Contributions
[Describe the technical innovations your research will produce]

4.2 Practical Applications
[Explain how your research can be applied in real-world settings]

4.3 Broader Impact
[Discuss the potential societal or scientific impact]

5. TIMELINE
[Provide a detailed timeline for your research]

6. RESOURCES REQUIRED
6.1 Computational Resources
[Describe hardware/software needs]

6.2 Data Requirements
[Explain what data you need and how you'll obtain it]

6.3 Budget
[Provide a detailed budget if applicable]

7. RISK ASSESSMENT
[Identify potential challenges and mitigation strategies]

8. CONCLUSION
[Summarize the significance and feasibility of your proposed research]

REFERENCES
[List relevant academic sources]`,
    documentType: "Research Proposal",
    type: "Research Proposal",
    category: "academic",
    subcategory: "graduate",
    tags: ["research proposal", "machine learning", "methodology", "data analysis", "academic research"],
    estimatedReadingTime: "20",
    difficultyLevel: "Advanced",
    targetAudience: "graduate",
    fieldOfStudy: ["Computer Science"],
    learningObjectives: "Learn how to structure a comprehensive research proposal for machine learning projects",
    prerequisites: "Understanding of machine learning concepts and research methodology",
    relatedResources: "Research methodology guides, machine learning textbooks",
    authorNotes: "This template provides a solid foundation for research proposals in the field of machine learning",
    isTemplate: true,
    allowCloning: true,
    requireReview: false,
    status: "published",
    reviewStatus: "approved",
    qualityScore: 9.5,
    viewCount: 0,
    cloneCount: 0,
    averageRating: 0,
    ratingCount: 0,
    language: "en",
    wordCount: 1200,
    characterCount: 8500
  }
];

async function seedLibraryDocuments() {
  try {
    await connectDB();
    
    // Get the first admin user to use as the creator
    const admin = await Admin.findOne();
    if (!admin) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('Starting to seed library documents...');

    for (const docData of sampleDocuments) {
      const existingDoc = await LibraryDocument.findOne({ title: docData.title });
      
      if (existingDoc) {
        console.log(`Document "${docData.title}" already exists, skipping...`);
        continue;
      }

      const document = new LibraryDocument({
        ...docData,
        createdBy: admin._id,
        updatedBy: admin._id
      });

      await document.save();
      console.log(`Created document: "${docData.title}"`);
    }

    console.log('Library documents seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding library documents:', error);
    process.exit(1);
  }
}

seedLibraryDocuments(); 