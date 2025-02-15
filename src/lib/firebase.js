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

// ✅ Initialize Analytics only on the client-side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const provider = new GoogleAuthProvider();

// ✅ Function to log in with Google and store user in Firestore
const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await saveUserToDatabase(user); // ✅ Use the corrected function
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

// ✅ Function to log out
const logout = () => signOut(auth);

// ✅ Function to add/update user in Firestore (FIXED)
const saveUserToDatabase = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid); // ✅ Use `setDoc()` with `uid`
  try {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      timestamp: new Date(),
    }, { merge: true }); // ✅ Merging ensures it doesn't overwrite existing data
    console.log("User saved successfully!");
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

// ✅ Function to fetch all users from Firestore
const getUsersFromDatabase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// ✅ Log user water usage
const logWaterUsage = async (userId, amount, unit) => {
  if (!userId || !amount) return;

  try {
    const waterLogsRef = collection(db, "users", userId, "water_logs");
    await addDoc(waterLogsRef, {
      amount: parseFloat(amount),
      unit: unit,
      timestamp: new Date()
    });
    console.log("Water usage logged successfully!");
  } catch (error) {
    console.error("Error logging water usage:", error);
  }
};

// ✅ Fetch logged water usage for a user
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

export { auth, loginWithGoogle, logout, db, analytics, saveUserToDatabase, getUsersFromDatabase, logWaterUsage, getWaterUsageLogs };
