# GitHub Issues Template

## Issue Types

### 🔴 Critical Task
```markdown
## 🔴 Critical Task: [Task Name]

### Description
Brief description of the critical task that must be completed.

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Technical Details
- **Team**: [Team Name]
- **Timeline**: [X weeks]
- **Dependencies**: [List dependencies]
- **Files to Modify**: [List files]

### Definition of Done
- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Tested in staging

### Labels
- critical
- [team-name]
- [phase-number]
```

### 🟡 High Priority Task
```markdown
## 🟡 High Priority Task: [Task Name]

### Description
Brief description of the high priority task.

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Technical Details
- **Team**: [Team Name]
- **Timeline**: [X weeks]
- **Dependencies**: [List dependencies]
- **Files to Modify**: [List files]

### Definition of Done
- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Tested in staging

### Labels
- high-priority
- [team-name]
- [phase-number]
```

### 🟢 Medium Priority Task
```markdown
## 🟢 Medium Priority Task: [Task Name]

### Description
Brief description of the medium priority task.

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Technical Details
- **Team**: [Team Name]
- **Timeline**: [X weeks]
- **Dependencies**: [List dependencies]
- **Files to Modify**: [List files]

### Definition of Done
- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Tested in staging

### Labels
- medium-priority
- [team-name]
- [phase-number]
```

### 🔵 Low Priority Task
```markdown
## 🔵 Low Priority Task: [Task Name]

### Description
Brief description of the low priority task.

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Technical Details
- **Team**: [Team Name]
- **Timeline**: [X weeks]
- **Dependencies**: [List dependencies]
- **Files to Modify**: [List files]

### Definition of Done
- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Tested in staging

### Labels
- low-priority
- [team-name]
- [phase-number]
```

### 🐛 Bug Report
```markdown
## 🐛 Bug Report: [Brief Description]

### Description
Detailed description of the bug.

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
What should happen.

### Actual Behavior
What actually happens.

### Environment
- **Browser**: [Browser and version]
- **OS**: [Operating system]
- **Device**: [Device type]
- **User Role**: [Admin/User]

### Screenshots/Videos
[If applicable]

### Console Logs
[If applicable]

### Labels
- bug
- [severity]
- [team-name]
```

### 💡 Feature Request
```markdown
## 💡 Feature Request: [Feature Name]

### Description
Detailed description of the requested feature.

### Problem Statement
What problem does this feature solve?

### Proposed Solution
How should this feature work?

### Alternative Solutions
Other ways to solve this problem.

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Labels
- enhancement
- [priority]
- [team-name]
```

## Label System

### Priority Labels
- `critical` - Must be completed before launch
- `high-priority` - Important for user experience and business success
- `medium-priority` - Nice-to-have features and optimizations
- `low-priority` - Future enhancements and polish

### Team Labels
- `admin-team` - Backend focus, system administration
- `user-team` - Frontend focus, user-facing features
- `ai-team` - AI/ML infrastructure and features
- `seo-team` - Content marketing and SEO
- `devops-team` - Infrastructure, security, monitoring

### Phase Labels
- `phase-1` - Critical Infrastructure
- `phase-2` - AI/ML Infrastructure
- `phase-3` - SEO & Content Marketing
- `phase-4` - User-Facing Features
- `phase-5` - Advanced AI Features
- `phase-6` - Advanced Features
- `phase-7` - Polish & Launch

### Type Labels
- `bug` - Bug reports
- `enhancement` - Feature requests
- `documentation` - Documentation updates
- `testing` - Testing related tasks
- `security` - Security related tasks
- `performance` - Performance optimization
- `ui/ux` - User interface and experience

### Severity Labels
- `blocker` - Blocks development or deployment
- `high` - High impact bug
- `medium` - Medium impact bug
- `low` - Low impact bug

## Issue Workflow

### Creating Issues
1. Use the appropriate template
2. Fill in all required fields
3. Add appropriate labels
4. Assign to the correct team member
5. Set milestone if applicable

### Issue Lifecycle
1. **Open** - Issue created and ready for work
2. **In Progress** - Work has started
3. **Review** - Code review in progress
4. **Testing** - Testing in staging environment
5. **Done** - Completed and deployed

### Issue Dependencies
- Use the "Dependencies" field to list related issues
- Link issues using GitHub's linking syntax: `#issue-number`
- Update dependent issues when parent issues are completed

## Example Issues

### Example 1: Critical Payment Integration
```markdown
## 🔴 Critical Task: Paystack Integration

### Description
Integrate Paystack payment processing for African markets to enable monetization.

### Requirements
- [ ] Set up Paystack account and API keys
- [ ] Create payment models and database schema
- [ ] Implement payment processing endpoints
- [ ] Add payment success/failure webhooks
- [ ] Create payment history tracking
- [ ] Test payment flows with test cards

### Acceptance Criteria
- [ ] Users can make payments using Paystack
- [ ] Payment webhooks are properly handled
- [ ] Payment history is accurately tracked
- [ ] Test payments work in development environment
- [ ] Error handling is implemented for failed payments

### Technical Details
- **Team**: DevOps Team
- **Timeline**: 2 weeks
- **Dependencies**: None
- **Files to Modify**: 
  - `models/Payment.ts`
  - `app/api/payments/route.ts`
  - `lib/paystack.ts`
  - `components/payment/PaymentForm.tsx`

### Definition of Done
- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Tested in staging

### Labels
- critical
- devops-team
- phase-1
```

### Example 2: High Priority User Dashboard
```markdown
## 🟡 High Priority Task: User Dashboard - Application Pipeline

### Description
Create a Kanban-style application board for users to track their applications.

### Requirements
- [ ] Create Kanban-style application board
- [ ] Add application status tracking
- [ ] Implement progress indicators
- [ ] Add deadline reminders
- [ ] Create application notes system
- [ ] Add application sharing features

### Acceptance Criteria
- [ ] Users can view applications in Kanban board format
- [ ] Applications can be moved between status columns
- [ ] Progress indicators show completion percentage
- [ ] Deadline reminders are displayed
- [ ] Users can add notes to applications
- [ ] Applications can be shared with others

### Technical Details
- **Team**: User Team
- **Timeline**: 3 weeks
- **Dependencies**: Application management system
- **Files to Modify**:
  - `components/dashboard/ApplicationBoard.tsx`
  - `components/dashboard/ApplicationCard.tsx`
  - `hooks/use-applications.ts`
  - `app/dashboard/page.tsx`

### Definition of Done
- [ ] Feature implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Tested in staging

### Labels
- high-priority
- user-team
- phase-4
```

## Issue Management Best Practices

### Writing Good Issues
1. **Be Specific**: Clearly describe what needs to be done
2. **Include Context**: Explain why this task is important
3. **Define Acceptance Criteria**: List specific requirements for completion
4. **Estimate Effort**: Provide timeline estimates
5. **Identify Dependencies**: List any blocking tasks

### Issue Prioritization
1. **Critical**: Must be completed before launch
2. **High**: Important for user experience
3. **Medium**: Nice-to-have features
4. **Low**: Future enhancements

### Issue Updates
1. **Regular Updates**: Update progress regularly
2. **Blockers**: Immediately report any blockers
3. **Scope Changes**: Document any scope changes
4. **Completion**: Mark as done when complete

### Team Collaboration
1. **Clear Assignment**: Assign issues to specific team members
2. **Regular Reviews**: Review issues in team meetings
3. **Cross-team Communication**: Communicate dependencies
4. **Knowledge Sharing**: Share learnings across teams 