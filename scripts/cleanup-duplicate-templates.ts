import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ApplicationTemplate from '../models/ApplicationTemplate';
import Application from '../models/Application';

dotenv.config();

/**
 * Script to clean up duplicate application templates
 * This script identifies and removes duplicate templates, keeping only the most recent one
 */
async function cleanupDuplicateTemplates() {
  try {
    console.log('Connecting to database...');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to database successfully');

    // Find all templates
    const allTemplates = await ApplicationTemplate.find({}).sort({ createdAt: -1 });
    console.log(`Found ${allTemplates.length} total templates`);

    // Group templates by their unique identifiers
    const templateGroups = new Map<string, any[]>();

    allTemplates.forEach(template => {
      let key: string;
      
      if (template.applicationType === 'scholarship' && template.scholarshipId) {
        key = `scholarship_${template.scholarshipId}_${template.isActive}`;
      } else if (template.applicationType === 'school' && template.schoolId) {
        key = `school_${template.schoolId}_${template.isActive}`;
      } else if (template.applicationType === 'program' && template.programId) {
        key = `program_${template.programId}_${template.isActive}`;
      } else {
        // Skip templates without proper references
        console.log(`Skipping template ${template._id} - missing proper reference`);
        return;
      }

      if (!templateGroups.has(key)) {
        templateGroups.set(key, []);
      }
      templateGroups.get(key)!.push(template);
    });

    console.log(`Grouped into ${templateGroups.size} unique template groups`);

    let totalDuplicates = 0;
    let totalRemoved = 0;

    // Process each group
    for (const [key, templates] of Array.from(templateGroups.entries())) {
      if (templates.length > 1) {
        console.log(`\nFound ${templates.length} duplicates for key: ${key}`);
        console.log('Templates:');
        templates.forEach((template: any, index: number) => {
          console.log(`  ${index + 1}. ID: ${template._id}, Title: "${template.title}", Created: ${template.createdAt}`);
        });

        // Keep the most recent template (first in the array since we sorted by createdAt desc)
        const templateToKeep = templates[0];
        const templatesToRemove = templates.slice(1);

        console.log(`Keeping template: ${templateToKeep._id} (${templateToKeep.title})`);
        console.log(`Removing ${templatesToRemove.length} duplicate(s):`);

        for (const templateToRemove of templatesToRemove) {
          console.log(`  - Removing: ${templateToRemove._id} (${templateToRemove.title})`);
          
          // Check if any applications are using this template
          const applicationsUsingTemplate = await Application.countDocuments({
            applicationTemplateId: templateToRemove._id
          });

          if (applicationsUsingTemplate > 0) {
            console.log(`    ⚠️  WARNING: ${applicationsUsingTemplate} application(s) are using this template!`);
            console.log(`    Updating applications to use the kept template...`);
            
            // Update applications to use the kept template
            await Application.updateMany(
              { applicationTemplateId: templateToRemove._id },
              { applicationTemplateId: templateToKeep._id }
            );
            console.log(`    ✅ Updated ${applicationsUsingTemplate} application(s) to use template ${templateToKeep._id}`);
          }

          // Remove the duplicate template
          await ApplicationTemplate.findByIdAndDelete(templateToRemove._id);
          totalRemoved++;
        }

        totalDuplicates++;
      }
    }

    console.log(`\n=== CLEANUP SUMMARY ===`);
    console.log(`Total duplicate groups found: ${totalDuplicates}`);
    console.log(`Total duplicate templates removed: ${totalRemoved}`);
    console.log(`Templates remaining: ${allTemplates.length - totalRemoved}`);

    // Verify cleanup by checking for remaining duplicates
    console.log(`\n=== VERIFICATION ===`);
    const remainingTemplates = await ApplicationTemplate.find({}).sort({ createdAt: -1 });
    const remainingGroups = new Map<string, any[]>();

    remainingTemplates.forEach(template => {
      let key: string;
      
      if (template.applicationType === 'scholarship' && template.scholarshipId) {
        key = `scholarship_${template.scholarshipId}_${template.isActive}`;
      } else if (template.applicationType === 'school' && template.schoolId) {
        key = `school_${template.schoolId}_${template.isActive}`;
      } else if (template.applicationType === 'program' && template.programId) {
        key = `program_${template.programId}_${template.isActive}`;
      } else {
        return;
      }

      if (!remainingGroups.has(key)) {
        remainingGroups.set(key, []);
      }
      remainingGroups.get(key)!.push(template);
    });

    let stillHasDuplicates = false;
    for (const [key, templates] of Array.from(remainingGroups.entries())) {
      if (templates.length > 1) {
        console.log(`❌ Still has duplicates: ${key} (${templates.length} templates)`);
        stillHasDuplicates = true;
      }
    }

    if (!stillHasDuplicates) {
      console.log(`✅ No remaining duplicates found!`);
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupDuplicateTemplates()
    .then(() => {
      console.log('Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

export { cleanupDuplicateTemplates }; 