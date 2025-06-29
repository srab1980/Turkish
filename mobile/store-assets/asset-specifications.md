# App Store Asset Specifications

## iOS App Store Assets

### App Icon Requirements
- **Size**: 1024 x 1024 pixels
- **Format**: PNG (no transparency)
- **Color Space**: sRGB or P3
- **Layers**: Flattened with no layers
- **Content**: No text overlay, clean design
- **File Name**: `ios-app-icon.png`

### iPhone Screenshots
#### 6.7" Display (iPhone 14 Pro Max, 13 Pro Max, 12 Pro Max)
- **Size**: 1290 x 2796 pixels (portrait) or 2796 x 1290 pixels (landscape)
- **Format**: PNG or JPEG
- **Required**: Yes (primary)

#### 6.5" Display (iPhone 11 Pro Max, 11, XS Max, XR)
- **Size**: 1242 x 2688 pixels (portrait) or 2688 x 1242 pixels (landscape)
- **Format**: PNG or JPEG
- **Required**: Yes (fallback)

#### 5.5" Display (iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus)
- **Size**: 1242 x 2208 pixels (portrait) or 2208 x 1242 pixels (landscape)
- **Format**: PNG or JPEG
- **Required**: Yes (legacy support)

### iPad Screenshots (if supporting iPad)
#### 12.9" Display (iPad Pro 6th Gen, 5th Gen, 4th Gen, 3rd Gen)
- **Size**: 2048 x 2732 pixels (portrait) or 2732 x 2048 pixels (landscape)
- **Format**: PNG or JPEG

#### 11" Display (iPad Pro 2nd Gen, iPad Air 4th Gen)
- **Size**: 1668 x 2388 pixels (portrait) or 2388 x 1668 pixels (landscape)
- **Format**: PNG or JPEG

### App Preview Video (Optional)
- **Duration**: 15-30 seconds
- **Format**: .mov, .mp4, or .m4v
- **Resolution**: Same as screenshot requirements
- **Audio**: Optional but recommended
- **Captions**: Recommended for accessibility

### Additional iOS Assets
- **Splash Screen**: Various sizes for different devices
- **Notification Icon**: 20x20, 40x40, 60x60 pixels
- **Settings Icon**: 29x29, 58x58, 87x87 pixels
- **Spotlight Icon**: 40x40, 80x80, 120x120 pixels

## Google Play Store Assets

### App Icon
- **Size**: 512 x 512 pixels
- **Format**: PNG (32-bit with alpha)
- **File Size**: Maximum 1MB
- **Content**: High-quality, recognizable at small sizes
- **File Name**: `google-play-icon.png`

### Adaptive Icon (Android 8.0+)
- **Foreground**: 512 x 512 pixels PNG with transparency
- **Background**: 512 x 512 pixels PNG (solid color or pattern)
- **Safe Zone**: 66dp diameter circle in center
- **File Names**: `adaptive-icon-foreground.png`, `adaptive-icon-background.png`

### Feature Graphic
- **Size**: 1024 x 500 pixels
- **Format**: PNG or JPEG
- **File Size**: Maximum 15MB
- **Content**: Promotional graphic showcasing app
- **Text**: Minimal, as it may be covered by play button
- **File Name**: `feature-graphic.png`

### Phone Screenshots
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots
- **Format**: PNG or JPEG
- **Dimensions**: 
  - 16:9 aspect ratio: 1920 x 1080 pixels minimum
  - 9:16 aspect ratio: 1080 x 1920 pixels minimum
- **File Size**: Maximum 8MB each

### 7-inch Tablet Screenshots
- **Minimum**: 1 screenshot (if supporting tablets)
- **Maximum**: 8 screenshots
- **Dimensions**: 1920 x 1200 pixels minimum
- **Format**: PNG or JPEG

### 10-inch Tablet Screenshots
- **Minimum**: 1 screenshot (if supporting tablets)
- **Maximum**: 8 screenshots
- **Dimensions**: 2560 x 1600 pixels minimum
- **Format**: PNG or JPEG

### Promo Video (Optional)
- **Duration**: 30 seconds to 2 minutes
- **Format**: MP4, MOV, or AVI
- **Resolution**: 1920 x 1080 pixels minimum
- **File Size**: Maximum 100MB
- **Content**: Showcase key features and gameplay

## Screenshot Content Guidelines

### Screenshot 1: Welcome/Onboarding
- **Content**: App welcome screen with key value proposition
- **Text Overlay**: "Learn Turkish with AI-Powered Lessons"
- **Visual Elements**: Clean UI, welcoming design
- **Call-to-Action**: Clear next steps for users

### Screenshot 2: Lesson Selection
- **Content**: Istanbul Book curriculum overview
- **Text Overlay**: "Complete Istanbul Book Curriculum"
- **Visual Elements**: Lesson cards, progress indicators
- **Highlight**: Structured learning path

### Screenshot 3: Interactive Lesson
- **Content**: Active lesson with pronunciation practice
- **Text Overlay**: "Perfect Your Pronunciation"
- **Visual Elements**: Audio waveforms, feedback UI
- **Highlight**: AI-powered speech recognition

### Screenshot 4: Progress Dashboard
- **Content**: Learning analytics and achievements
- **Text Overlay**: "Track Your Progress"
- **Visual Elements**: Charts, badges, streaks
- **Highlight**: Gamification elements

### Screenshot 5: Vocabulary Practice
- **Content**: Spaced repetition system in action
- **Text Overlay**: "Smart Vocabulary Learning"
- **Visual Elements**: Flashcards, difficulty indicators
- **Highlight**: Adaptive learning technology

### Screenshot 6: Grammar Exercises
- **Content**: Interactive grammar practice
- **Text Overlay**: "Master Turkish Grammar"
- **Visual Elements**: Exercise interface, explanations
- **Highlight**: Visual learning aids

### Screenshot 7: Audio Lessons
- **Content**: Native speaker audio interface
- **Text Overlay**: "Learn from Native Speakers"
- **Visual Elements**: Audio player, transcript
- **Highlight**: Authentic Turkish content

### Screenshot 8: Social Features
- **Content**: Community and social learning
- **Text Overlay**: "Learn Together"
- **Visual Elements**: Leaderboards, challenges
- **Highlight**: Community engagement

## Design Guidelines

### Visual Consistency
- **Color Scheme**: Consistent with app branding (#3b82f6 primary)
- **Typography**: Clear, readable fonts
- **Layout**: Clean, uncluttered design
- **Branding**: Subtle app logo placement

### Content Guidelines
- **Real Content**: No placeholder text or images
- **Localization**: Screenshots in target market languages
- **Diversity**: Inclusive representation in user-generated content
- **Quality**: High-resolution, crisp images

### Text Overlays
- **Readability**: High contrast, legible fonts
- **Brevity**: Concise, impactful messaging
- **Localization**: Translated for each market
- **Positioning**: Strategic placement that doesn't obscure UI

## Asset Organization

### File Structure
```
store-assets/
├── ios/
│   ├── app-icon/
│   │   └── ios-app-icon.png (1024x1024)
│   ├── screenshots/
│   │   ├── iphone-6.7/
│   │   ├── iphone-6.5/
│   │   └── iphone-5.5/
│   └── app-preview/
│       └── preview-video.mov
├── android/
│   ├── app-icon/
│   │   ├── google-play-icon.png (512x512)
│   │   ├── adaptive-icon-foreground.png
│   │   └── adaptive-icon-background.png
│   ├── feature-graphic/
│   │   └── feature-graphic.png (1024x500)
│   ├── screenshots/
│   │   ├── phone/
│   │   ├── tablet-7/
│   │   └── tablet-10/
│   └── promo-video/
│       └── promo-video.mp4
└── shared/
    ├── app-icon-source.ai
    ├── screenshot-templates.psd
    └── brand-guidelines.pdf
```

### Version Control
- **Source Files**: Keep original design files (AI, PSD, Sketch)
- **Exports**: Automated export scripts for different sizes
- **Backup**: Regular backups of all assets
- **Documentation**: Change log for asset updates

## Quality Assurance

### Pre-Submission Checklist
- [ ] All required sizes generated
- [ ] File formats correct
- [ ] No compression artifacts
- [ ] Text is legible at small sizes
- [ ] Colors accurate across devices
- [ ] Content appropriate for all ages
- [ ] No copyrighted material without permission
- [ ] Consistent branding across all assets

### Testing
- **Device Testing**: View assets on actual devices
- **Store Preview**: Use store preview tools
- **A/B Testing**: Test different screenshot variations
- **Feedback**: Get feedback from target users
- **Accessibility**: Ensure assets work with accessibility features

## Localization Considerations

### Multi-Language Assets
- **Screenshots**: Localized UI for major markets
- **Text Overlays**: Translated marketing messages
- **Cultural Adaptation**: Culturally appropriate imagery
- **Right-to-Left**: Special considerations for RTL languages

### Priority Markets
1. **English**: Primary market (US, UK, Australia, Canada)
2. **Turkish**: Target market (Turkey)
3. **German**: Secondary market (Germany, Austria, Switzerland)
4. **French**: European market (France, Belgium, Switzerland)
5. **Spanish**: Growing market (Spain, Latin America)

This comprehensive asset specification ensures professional presentation across both app stores while maximizing conversion rates and user engagement.
