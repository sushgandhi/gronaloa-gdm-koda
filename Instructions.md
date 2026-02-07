### Notes: we are building a prototey for now, and don't have a google play account to publish the app. so we will be using expo go to run the app on our devices. also we will have to simulate the health data from apple health and google fit, health conenct

### MVP Architecture & Components

### Tech Stack Overview
- **Platform**: Android (React Native)
- **Backend**: Firebase (Firestore, Auth, Storage, Cloud Functions)
- **Health Data Integration**: Google Health Connect SDK
- **Image Analysis**: Calorie estimation API (e.g., Eden AI, Calorie Mama)
- **Location Context**: Google Maps/Places API
- **Browser Interaction**: React Native WebView

---

### App Structure

```bash
src/
├── components/
│   ├── DailyBriefing.tsx
│   ├── HealthDashboard.tsx
│   ├── FoodPhotoUploader.tsx
│   ├── GroceryBrowser.tsx
│   ├── NearbyEats.tsx
├── services/
│   ├── healthConnectService.ts
│   ├── calorieEstimation.ts
│   ├── locationService.ts
│   ├── firebaseService.ts
├── screens/
│   ├── Home.tsx
│   ├── Profile.tsx
│   ├── Onboarding.tsx
│   ├── FoodLog.tsx
│   ├── Suggestions.tsx
├── App.tsx
```

---

### Firebase Backend

**Firestore Collections**
- `/users/{uid}` — profile, preferences, goals
- `/daily_data/{uid}/{date}` — steps, calories burned/consumed
- `/briefings/{uid}/{date}` — daily tips and feedback

**Cloud Functions**
- `generateDailyBriefing()`
  - Triggered daily (via scheduler)
  - Summarizes last day’s activity & intake
  - Writes to `/briefings` + sends push notification

**Storage**
- `/photos/{uid}/{timestamp}.jpg` — raw food images for calorie analysis

---

### Daily Briefing Logic

1. Pull:
   - Previous day’s steps, active minutes, calories burned
   - Calories consumed (from photo estimation logs)
2. Compare against user goal
3. Suggest improvement tips (e.g., "light swim", "walk 20 mins after dinner")
4. Store result in Firestore, notify user

---

### Food Intake: Photo → Calorie Pipeline

#### Pipeline Goals
- Modular stages that can be reused across features
- Idempotent processing (safe retries)
- Clear data contracts between stages
- Observable status & failure handling

#### Common Pipeline Contract (Reusable)
- **Input**: `{ uid, date, source, payload, idempotencyKey }`
- **Output**: `{ status, normalizedData, confidence, errors }`
- **Status**: `queued → processing → completed | failed | needs_review`
- **Storage**: `/pipeline_jobs/{jobId}`

#### Food Photo Pipeline (v1)
1. **Upload**: User uploads photo → `Storage /photos/{uid}/{timestamp}.jpg`
2. **Enqueue**: Create job in `/pipeline_jobs` with `type=food_photo`
3. **Preprocess**: Resize/normalize image for API limits
4. **Analyze**: Call calorie estimation API (e.g., Eden AI → Calorie Mama)
5. **Normalize**: Map API response → internal schema (items, calories, macros, confidence)
6. **Persist**: Write to `/daily_data/{uid}/{date}` under `intake.items[]`
7. **Feedback**: Show summary + allow user correction (updates job + daily_data)

#### Failure & Review Flow
- Retry transient failures with backoff (network/API rate limits)
- If confidence < threshold, set `needs_review` and prompt user
- Store raw API response for debugging (redacted)

---

### Location + Grocery Support

- Use GPS to locate user
- Use Google Maps or Places API to find:
  - Nearby grocery stores (Waitrose, Tesco, etc.)
  - Healthy restaurants/alternatives (e.g., salads, grilled meals)
- Present suggestions or open store page in embedded browser

---

### Optional Enhancements (Post-MVP)

- Recipe planner with stock checker
- Activity recommendations by weather
- Community support or group goals
- AI-based conversation coach (LLM-powered)
- iOS support via HealthKit
- Workout form analysis from video

---

### Modularity Principles
- Keep all pipelines stage-based and reusable
- Each stage should have a narrow input/output contract
- Prefer server-side processing for consistency
- Add user override paths where ML uncertainty is high

make everything in a modular, repeatable way.
