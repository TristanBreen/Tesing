# Hypertrophy Lab - Feature Updates v1.3.0

## 🎯 New Features Added

### 1. Enhanced Settings Page
**Location**: `components/Settings.tsx`

#### New Controls:
- **Recovery Hours Slider**: Adjustable minimum recovery hours (24-96h) with visual slider
- **Auto-Start Timer Toggle**: Enable/disable automatic rest timer on set completion
- **Weight Unit Selection**: Toggle between LBS and KG (already existed, but now more polished)
- **Export Data**: Export all app data as JSON file for backup
  - On iOS/Android: Uses Share API to send backup file
  - On Web: Downloads JSON file directly
- **Import Data**: Placeholder for future file picker implementation

#### How to Use:
1. Adjust recovery hours using the slider (affects Science tab calculations)
2. Toggle auto-start timer for convenience
3. Tap "Export Data" to backup all workout history, routines, and nutrition logs
4. "Save All Settings" persists all changes

---

### 2. Science Tab with Progress Tracking & Nutrition Integration
**Location**: `components/Analytics.tsx`

#### Three Tabs:
1. **Recovery** (original functionality)
   - Muscle recovery status
   - Weekly volume tracking

2. **Progress** ⭐ NEW
   - Tracks estimated 1RM (e1RM) progression for 5 key lifts:
     - Squat, Bench Press, Barbell Row, Overhead Press, RDL
   - Mini charts showing last 8 sessions
   - Trend indicators (increasing/stable)
   - Shows current best set and e1RM

3. **Nutrition** ⭐ NEW
   - 7-day averages for protein and calories
   - Compliance metrics:
     - Days hitting protein target (160g+)
     - Refeed days taken
   - Progress bars for visual tracking
   - Tip: "Consistent protein intake is crucial for muscle protein synthesis"

#### How to Use:
- Swipe between tabs at the top
- Progress automatically calculates from workout history
- Nutrition data pulled from Fuel tab logs

---

### 3. Workout Library
**Location**: `components/WorkoutLibrary.tsx`

#### Features:
- Dedicated library view for all saved routines
- Search functionality to filter routines
- Expandable routine details showing all exercises
- Quick actions:
  - Start workout immediately
  - Edit routine
  - Delete routine
- Floating Action Button (FAB) to create new routine

#### How to Access:
1. From Dashboard: Tap the book icon (top-right)
2. Browse all routines or search by name
3. Tap routine card to see details
4. Tap "Start" to begin workout

---

### 4. Meal Presets
**Location**: `components/MealPresets.tsx`

#### Features:
- Save frequently eaten meals with full macro breakdown
- Quick-log meals to current day's nutrition
- Search saved meals
- Visual macro display (calories, protein, carbs, fats)
- Delete unwanted presets

#### How to Use:
1. From Fuel tab: Tap "Presets" button (top-right)
2. Create meal presets with full nutrition info
3. One-tap logging to add meal to today's totals
4. Useful for meal prep or regular eating patterns

**Example Presets:**
- "Chicken & Rice Bowl" - 650 cal, 60g protein
- "Protein Shake" - 250 cal, 35g protein
- "Pre-Workout Meal" - 400 cal, 25g protein

---

### 5. Dashboard Improvements
**Location**: `components/Dashboard.tsx`

#### Changes:
- Library icon button for quick access to Workout Library
- "Quick Start" card for empty workouts
- "See All" link to view full routine library
- Improved routine preview cards
- Create routine shortcut when no routines exist

---

## 📦 Dependencies Added

### New Packages:
```json
"@react-native-community/slider": "4.5.2"
```
Required for the recovery hours slider in Settings.

### Installation:
```bash
npm install
```
or
```bash
yarn install
```

---

## 🔧 Modified Files

1. **Settings.tsx** - Complete rewrite with new controls
2. **Analytics.tsx** - Added tabs and nutrition integration
3. **NutritionLog.tsx** - Added meal presets integration
4. **Dashboard.tsx** - Added library integration
5. **Icons.tsx** - Added new icons (Download, Upload, Edit, BookOpen)
6. **package.json** - Version bump to 1.3.0, added slider dependency

## 🆕 New Files

1. **WorkoutLibrary.tsx** - Dedicated workout routine manager
2. **MealPresets.tsx** - Meal preset manager for nutrition

---

## 🎨 UI/UX Improvements

### Visual Consistency:
- All new features match the dark theme (#09090b background)
- Cyan accent color (#06b6d4) used throughout
- Card-based layouts with consistent border styling
- Proper touch targets for mobile (44x44 minimum)

### Navigation Patterns:
- Modal overlays for creation forms
- Back navigation preserved
- FABs for primary actions (+ buttons)
- Secondary actions in card footers

---

## 📱 Usage Tips

### For Workout Tracking:
1. Create routines in Workout Library for programs you follow regularly
2. Use Quick Start for one-off or flexible workouts
3. Check Progress tab weekly to see strength gains

### For Nutrition:
1. Save your regular meals as presets (breakfast, lunch, dinner staples)
2. Quick-log preset meals throughout the day
3. Use custom meal entry for restaurants or new foods
4. Check Nutrition insights in Science tab

### For Recovery:
1. Adjust min recovery hours based on your training style:
   - 24-36h for high-frequency training
   - 48-72h for traditional splits
   - 72-96h for low-frequency/high-intensity
2. Monitor muscle recovery cards before training
3. Use volume tracking to avoid overtraining

---

## 🐛 Known Issues & Future Improvements

### To Implement:
- [ ] Full Import Data functionality (needs file picker)
- [ ] Cloud sync for data backup
- [ ] Exercise video demos
- [ ] Custom exercise images
- [ ] Workout templates marketplace
- [ ] Meal photo logging
- [ ] Barcode scanner for nutrition
- [ ] Apple Health / Google Fit integration

### Minor Issues:
- Import Data button is placeholder (shows info dialog)
- No routine reordering yet (delete and recreate)
- No meal editing (delete and recreate)

---

## 🔄 Migration from v1.2.0

No breaking changes! All existing data will work with v1.3.0.

Simply install the new dependencies and replace the modified files.

---

## 💪 Made with Science

Version 1.3.0 - January 2026
