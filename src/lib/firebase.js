// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, setDoc, addDoc, doc, getDocs } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBLiPgPZ8b3a3uS7EnSiMgNsBXbrbc_Ffk",
  authDomain: "my-water-app-fef92.firebaseapp.com",
  projectId: "my-water-app-fef92",
  storageBucket: "my-water-app-fef92.firebasestorage.app",
  messagingSenderId: "801263911903",
  appId: "1:801263911903:web:b1fbac3394a6f2f8ad3a6a",
  measurementId: "G-BCFGL2062F"
};

// Prevent multiple initializations
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only on the client-side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const provider = new GoogleAuthProvider();

// Log in with Google and store user in Firestore
const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await saveUserToDatabase(user);
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

// Log out
const logout = () => signOut(auth);

// Save user in Firestore
const saveUserToDatabase = async (user) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  try {
    await setDoc(
      userRef,
      {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        location: user.location,
        timestamp: new Date()
      },
      { merge: true }
    );
    console.log("User saved successfully!");
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

// Fetch all users (if needed)
const getUsersFromDatabase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// UPDATED: Log user water usage with additional fields
const logWaterUsage = async (userId, usageData) => {
  if (!userId || !usageData) return;
  try {
    const waterLogsRef = collection(db, "users", userId, "water_logs");
    // Save the entire usageData object, including extra fields.
    await addDoc(waterLogsRef, {
      ...usageData,
      amount: parseFloat(usageData.amount),
      timestamp: new Date()
    });
    console.log("Water usage logged successfully!");
  } catch (error) {
    console.error("Error logging water usage:", error);
  }
};

// Fetch logged water usage for a user
const getWaterUsageLogs = async (userId) => {
  if (!userId) return [];
  try {
    const waterLogsRef = collection(db, "users", userId, "water_logs");
    const snapshot = await getDocs(waterLogsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching water logs:", error);
    return [];
  }
};

// Fetch leaderboard: Overall + Location-based
const getLeaderboard = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    let overallLeaderboard = [];
    let locationLeaderboards = {}; // Stores leaderboards by location

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userLocation = userData.location || "Unknown"; // Handle missing location

      const waterLogsRef = collection(db, "users", userId, "water_logs");
      const waterLogsSnapshot = await getDocs(waterLogsRef);

      let totalUsage = 0;
      waterLogsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalUsage += data.amount || 0;
      });

      console.log(`User ${userId} (${userData.name}) total usage:`, totalUsage);

      if (totalUsage > 0) {
        // Create user entry
        const userEntry = {
          id: userId,
          name: userData.name || "Anonymous",
          email: userData.email || "",
          photoURL: userData.photoURL || "",
          location: userLocation,
          totalUsage
        };

        // Add to overall leaderboard
        overallLeaderboard.push(userEntry);

        // Add to location-based leaderboard
        if (!locationLeaderboards[userLocation]) {
          locationLeaderboards[userLocation] = [];
        }
        locationLeaderboards[userLocation].push(userEntry);
      }
    }

    // Sort overall leaderboard (ascending order)
    overallLeaderboard.sort((a, b) => a.totalUsage - b.totalUsage);

    // Sort each location's leaderboard
    Object.keys(locationLeaderboards).forEach((location) => {
      locationLeaderboards[location].sort((a, b) => a.totalUsage - b.totalUsage);
    });

    console.log("Overall leaderboard:", overallLeaderboard);
    console.log("Location-based leaderboards:", locationLeaderboards);

    return { overallLeaderboard, locationLeaderboards };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { overallLeaderboard: [], locationLeaderboards: {} };
  }
};


export {
  auth,
  loginWithGoogle,
  logout,
  db,
  analytics,
  saveUserToDatabase,
  getUsersFromDatabase,
  logWaterUsage,
  getWaterUsageLogs,
  getLeaderboard 
};