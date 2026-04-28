const fs = require('fs');

const filePath = 'src/app/therapists/[slug]/_components/PremiumProfilePage.tsx';

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Fix the duplicate props in SocialProofBadges
  const badBadgesRegex = /<SocialProofBadges[\s\S]*?\/>/;
  const fixedBadges = `<SocialProofBadges
            isTopRated={avgRating >= 4.5}
            isMostReviewed={reviews.length >= 10}
            isRising={Boolean(profile.available_now)}
            reviewCount={reviews.length}
            averageRating={avgRating}
            viewCount={profile.profile_views ?? 0}
          />`;
  
  content = content.replace(badBadgesRegex, fixedBadges);

  // 2. Remove the duplicate Reviews section at the bottom of the file
  const duplicateReviewsRegex = /\{\/\* Reviews \*\/\}[\s\S]*?\{\/\* AI Chat Widget \*\/\}/;
  content = content.replace(duplicateReviewsRegex, '{/* AI Chat Widget */}');

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed duplicate JSX attributes and removed redundant review section.');
} else {
  console.log('❌ File not found.');
}
