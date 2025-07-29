# 📝 Git Commit Guide - Godspeed Shopify Theme

## Pre-Commit Checklist

Before pushing your code to git, ensure you complete this checklist:

### 1. ✅ Code Quality
- [ ] All CSS is properly formatted and follows theme conventions
- [ ] JavaScript functions are documented and tested  
- [ ] Liquid templates follow Shopify best practices
- [ ] No console.log statements in production code
- [ ] All file paths use forward slashes (/)

### 2. ✅ Testing
- [ ] Run full test suite: `npm test`
- [ ] Check E2E tests pass: `npm run test:e2e`
- [ ] Verify performance tests: `npm run test:performance`
- [ ] Test AI features: `npm run test -- tests/e2e/ai-features.spec.js`
- [ ] Mobile responsive testing completed

### 3. ✅ Environment Setup
- [ ] .env file configured correctly (not committed)
- [ ] All API keys and credentials secured
- [ ] Test with both development and production data
- [ ] Verify theme settings work correctly

### 4. ✅ Documentation
- [ ] CLAUDE.md updated with changes
- [ ] README.md reflects current functionality
- [ ] Comments added for complex logic
- [ ] API documentation updated if needed

## Git Workflow

### Step 1: Verify Current Status
```bash
# Check what files have changed
git status

# Review all changes before committing
git diff

# Check recent commits to understand message style
git log --oneline -10
```

### Step 2: Stage Your Changes
```bash
# Add all files (review carefully first)
git add .

# Or add specific files
git add assets/application.css
git add assets/bike-comparison.js
git add tests/e2e/ai-features.spec.js
```

### Step 3: Commit Message Standards

Follow this format for commit messages:

```
<type>(<scope>): <description>

<optional body>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

#### Commit Types:
- **feat**: New feature (e.g., `feat(comparison): add AI-powered bike recommendations`)
- **fix**: Bug fix (e.g., `fix(calculator): resolve size calculation error`)
- **style**: CSS/styling changes (e.g., `style(header): improve mobile navigation`)
- **test**: Adding or updating tests (e.g., `test(ai): add comprehensive E2E tests`)
- **docs**: Documentation changes (e.g., `docs(readme): update setup instructions`)
- **refactor**: Code restructuring (e.g., `refactor(js): optimize comparison algorithm`)
- **perf**: Performance improvements (e.g., `perf(css): reduce bundle size`)

#### Scope Examples:
- `comparison` - Bike comparison tool
- `calculator` - Size calculator
- `ai` - AI features
- `tests` - Testing framework
- `css` - Styling changes
- `admin` - Theme settings
- `api` - External integrations

### Step 4: Create the Commit

#### Option A: Using Heredoc (Recommended)
```bash
git commit -m "$(cat <<'EOF'
feat(ai): implement intelligent bike comparison system

Added AI-powered features to bike comparison tool:
- Smart insights based on customer behavior tracking
- Intelligent product recommendations 
- Customer behavior analytics with localStorage
- Enhanced theme settings with 13 AI configuration options
- Comprehensive E2E test suite for AI features

The AI system learns from user interactions and provides
personalized bike recommendations based on preferences,
price range, and usage patterns.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### Option B: Simple Commit
```bash
git commit -m "feat(ai): add intelligent bike comparison features

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 5: Push to Repository

#### First Time Push (New Branch)
```bash
# Create and push new branch
git checkout -b feature/ai-enhancement
git push -u origin feature/ai-enhancement
```

#### Regular Push
```bash
# Push to existing branch
git push origin main
```

#### Push with Tags (for releases)
```bash
# Create version tag
git tag -a v2.0.0 -m "Release v2.0.0: AI-Enhanced Theme"
git push origin v2.0.0
```

## Branch Strategy

### Main Branches
- **main**: Production-ready code
- **develop**: Development integration branch
- **staging**: Pre-production testing

### Feature Branches
- **feature/**: New features (`feature/ai-recommendations`)
- **hotfix/**: Critical fixes (`hotfix/cart-calculation`)
- **test/**: Testing improvements (`test/performance-optimization`)

### Example Workflow
```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/customer-reviews

# Work on feature...
git add .
git commit -m "feat(reviews): implement customer review system"

# Push feature branch
git push -u origin feature/customer-reviews

# Create pull request (if using GitHub/GitLab)
gh pr create --title "Add Customer Review System" --body "Implements review functionality with ratings and comments"
```

## Specific Commit Examples

### AI Features Commit
```bash
git commit -m "$(cat <<'EOF'
feat(ai): complete intelligent bike comparison implementation

This comprehensive update transforms the static bike comparison 
tool into an AI-powered recommendation engine:

Technical Implementation:
- Enhanced bikeData with aiInsights and smartScores
- Added bikeIntelligence engine with behavior tracking
- Implemented smart recommendation algorithms
- Created customer journey analytics
- Added 13 theme settings for AI configuration

Features Added:
- Smart insights showing price analysis and performance comparison
- AI recommendations based on user behavior patterns
- Customer behavior tracking with localStorage persistence
- Responsive AI recommendation cards
- Intelligent product suggestions

Testing Coverage:
- 8 comprehensive E2E test scenarios
- Mobile responsive testing
- Performance benchmarks for AI features
- Settings integration validation

Files Modified:
- assets/bike-comparison.js (enhanced with AI engine)
- assets/application.css (added AI styling)
- config/settings_schema.json (added AI settings panel)
- tests/e2e/ai-features.spec.js (comprehensive test suite)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Documentation Update Commit
```bash
git commit -m "$(cat <<'EOF'
docs: prepare complete project documentation for git push

Updated all project documentation to reflect current state:
- CLAUDE.md updated with complete feature list and AI enhancements  
- README.md created with setup instructions and architecture
- AI-SYSTEMS-GUIDE.md added for teaching the AI system
- .env.example created with all required environment variables
- .gitignore configured for Shopify theme development
- GIT-COMMIT-GUIDE.md added for development workflow

All documentation now reflects the complete Godspeed theme
with 9 e-bike features, AI intelligence, and comprehensive
testing framework.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Final Verification

Before pushing, run this final check:

```bash
# Verify all tests pass
npm test

# Check for any uncommitted changes
git status

# Verify commit message formatting
git log --oneline -1

# Push with verification
git push origin main --dry-run
git push origin main
```

## Post-Push Actions

### 1. Verify Deployment
- [ ] Check theme appears correctly in Shopify admin
- [ ] Test AI features in production environment
- [ ] Verify all assets load correctly
- [ ] Check mobile responsiveness

### 2. Monitor Performance
- [ ] Check Core Web Vitals
- [ ] Monitor JavaScript console for errors
- [ ] Verify AI recommendations work correctly
- [ ] Test customer behavior tracking

### 3. Update Team
- [ ] Notify team of new features
- [ ] Update project management tools
- [ ] Document any deployment notes
- [ ] Schedule testing with stakeholders

---

## Emergency Rollback

If issues occur after push:

```bash
# Quick rollback to previous commit
git revert HEAD

# Or rollback to specific commit
git revert <commit-hash>

# Push rollback
git push origin main
```

## Git Configuration

Ensure your git is configured correctly:

```bash
# Set user info
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch
git config --global init.defaultBranch main

# Set pull strategy
git config --global pull.rebase false
```

---

**Remember**: Always test thoroughly before committing, and never commit sensitive information like API keys or passwords. Use .env files and add them to .gitignore.

This theme represents a complete e-commerce solution with advanced AI features - commit with confidence! 🚀