# Hypertrophy Lab - React Native

A scientific, mobile-first workout logger with progressive overload tracking and hypertrophy analytics, now built with React Native for iOS and Android.

## Features

- **Workout Tracking**: Log sets, reps, weight, and RPE with ghost data from previous sessions
- **Progressive Overload**: Automatic weight recommendations based on performance
- **Routine Builder**: Create and save custom workout routines
- **Science Tab**: Muscle recovery tracking, weekly volume analysis, and progress trends
- **Nutrition Log**: Track macros, protein intake, and calorie goals with date history
- **Settings**: Customize goals, preferences, and manage data

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (for Android development)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your device:
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## Project Structure

```
├── App.tsx                      # Main app with navigation
├── components/
│   ├── Dashboard.tsx            # Home screen with workout history
│   ├── ActiveWorkout.tsx        # Active workout session screen
│   ├── Analytics.tsx            # Science tab with recovery metrics
│   ├── RoutineBuilder.tsx       # Create custom workout routines
│   ├── NutritionLog.tsx         # Track macros and calories
│   ├── Settings.tsx             # User preferences and data management
│   └── Icons.tsx                # SVG icon components
├── hooks/
│   └── useAsyncStorage.ts       # Persistent storage hook
├── constants.ts                 # Exercise database and calculations
├── types.ts                     # TypeScript type definitions
└── package.json
```

## Key Differences from Web Version

### Storage
- **Web**: `localStorage`
- **React Native**: `AsyncStorage` (persistent storage)

### Navigation
- **Web**: Custom state-based navigation
- **React Native**: React Navigation with bottom tabs and modals

### Styling
- **Web**: Tailwind CSS classes
- **React Native**: StyleSheet API

### Components
- **Web**: HTML elements (div, button, input)
- **React Native**: Native components (View, TouchableOpacity, TextInput)

### Icons
- **Web**: lucide-react
- **React Native**: Custom SVG components using react-native-svg

### Scroll Behavior
- **Web**: Standard browser scrolling
- **React Native**: ScrollView with contentContainerStyle

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Testing

```bash
# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

## Data Persistence

All data is stored locally on the device using AsyncStorage:
- Workout history (`hl-history`)
- Saved routines (`hl-routines`)
- Active session (`hl-active-session`)
- Custom exercises (`hl-custom-exercises`)
- Nutrition logs (`hl-nutrition-logs`)
- User goals (`hl-user-goals`)
- User preferences (`hl-user-preferences`)

## Future Enhancements

- [ ] Add rest timer with notifications
- [ ] Implement exercise swap functionality
- [ ] Add PR celebration animations
- [ ] Export/import data functionality
- [ ] Cloud backup and sync
- [ ] Social features and workout sharing
- [ ] Apple Health / Google Fit integration
- [ ] More detailed analytics and charts

## License

MIT

## Credits

Built with science 💪
