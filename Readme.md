## Personal Health Assistant - 

Koda is a personal health assistant which helps users to maintain a healthy lifestyle. 

### Goals - 

We are building a personal health assistant with following goals


1. Integrate with Apple Health and Google Fit to track health metrics, daily activities, sleep patterns, heart rate, blood pressure, blood glucose levels, etc.
2. Give the option to user to select a persona, which will be the face of the assistant. 
3. Give the user the ability to upload meal photos and get the nutritional information of the meal. 
4. Based everyday's activity, health metrics, meal information, suggest a plan for the user for the next day.
5. The assistant should suggest "healthier" alternatives for the food items in the meal. 
6. The assitant should browser local gorcery stores and recepies to suggest a plan for the user.
7. To browser local grocery stores, we will use browser automation tool browser-use  to browser things like Tesco, Waitrose, Sainsbury's etc. and get the prices of the products and the nutritional information of the products.
8. there should be a daily breifing in the morning for the user about the plan for the day.
9. The health assistant should also have an ability to suggest healthier eating out options for the user based on their health metrics and meal information and location. if a user is an area, asks recomendation. health assistant should suggest not just the restaurant but also the specific dishes which are healthier for the user. 




# Koda Health Assistant - Expo Setup

Koda is now optimized for **Expo**, allowing you to run it as a native app on iOS/Android or on the Web.

## Prerequisites
- Node.js (v18+)
- Expo Go app on your phone (for mobile testing)
- **Google Gemini API Key** (Required for AI features)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Key**
   Create a `.env` file in the root directory:
   ```
   API_KEY=your_google_gemini_key_here
   ```
   *Get your key from [Google AI Studio](https://aistudio.google.com/)*

3. **Run the App**
   ```bash
   # Start Expo development server
   npx expo start
   ```
   *Note: If you change the .env file, restart the server with `npx expo start --clear`.*

4. **Testing**
   - **Android**: Press `a` or scan the QR code in Expo Go.
   - **iOS**: Press `i` or scan the QR code in Expo Go.
   - **Web**: Press `w` to open in your browser.

## Native Features Used
- **expo-image-picker**: For native camera and gallery access to log meals.
- **expo-location**: For precise nearby search using GPS.
- **react-native**: High-performance UI components.
