<script>
  import "../../lib/styles/auth.css";
  import { loginWithGoogle, auth, logout, db } from "$lib/firebase";
  import { writable, get } from "svelte/store";
  import { onMount } from "svelte";
  import { onAuthStateChanged } from "firebase/auth";
  import { doc, getDoc, setDoc } from "firebase/firestore";

  let user = writable(null);
  let name = writable("");
  let gender = writable("");
  let dob = writable("");
  let phone = writable("");
  let location = writable("");
  let loading = writable(true);
  let saving = writable(false);
  let profileComplete = writable(false);
  let isEditing = writable(false); // Toggle for editing profile
  let saveMessage = writable("");

  async function loadUserProfile(uid) {
    if (!uid) return;

    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        name.set(data.name || "");
        gender.set(data.gender || "");
        dob.set(data.dob || "");
        phone.set(data.phone || "");
        location.set(data.location || "");
        profileComplete.set(data.name && data.gender && data.dob && data.phone && data.location);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }

  async function saveUserProfile() {
    if (!get(user) || get(saving)) return;

    saving.set(true);
    try {
      const userRef = doc(db, "users", get(user).uid);
      await setDoc(userRef, {
        email: get(user).email,
        photoURL: get(user).photoURL,
        name: get(name),
        gender: get(gender),
        dob: get(dob),
        phone: get(phone),
        location: get(location)
      }, { merge: true });

      profileComplete.set(get(name) && get(gender) && get(dob) && get(phone) && get(location));
      saveMessage.set("Profile saved successfully! Please refresh to view changes.");
      setTimeout(() => {
        saving.set(false);
        saveMessage.set(""); // Reset save message
        isEditing.set(false); // Stop editing
      }, 2000);
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  }

  function toggleEditing() {
    isEditing.set(!get(isEditing));
  }

  async function logoutUser() {
    try {
      await logout();
      user.set(null); // Reset user state on logout
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      user.set(userData);
      if (userData) {
        await loadUserProfile(userData.uid);
      }
      loading.set(false);
    });

    return () => unsubscribe();
  });
</script>

<div class="profile-container">
  {#if $loading}
    <div class="loading-skeleton">
      <div class="skeleton-circle"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text small"></div>
      <div class="skeleton-input"></div>
      <div class="skeleton-input"></div>
      <div class="skeleton-input"></div>
    </div>
  {:else}
    {#if $user}
      {#if !$profileComplete || $isEditing}
        <!-- Form to edit profile -->
        <div class="profile-form">
          <h2>{!$isEditing ? 'Complete Your Profile' : 'Edit Your Profile'}</h2>
          <img src={$user.photoURL} alt="Profile Picture" class="profile-pic">
          <p class="profile-email">📧 {$user.email}</p>

          <label>Name:</label>
          <input type="text" bind:value={$name} placeholder="Enter your name" required />

          <label>Gender:</label>
          <select bind:value={$gender} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>Date of Birth:</label>
          <input type="date" bind:value={$dob} required />

          <label>Phone:</label>
          <input type="text" bind:value={$phone} placeholder="Enter your phone number" required />

          <label>Location:</label>
          <input type="text" bind:value={$location} placeholder="Enter your location" required />

          {#if $saving}
            <p class="saving-text">Saving...</p>
          {/if}

          <button class="save-btn" on:click={saveUserProfile}>Save Profile</button>
          {#if $saveMessage}
            <p class="save-message">{$saveMessage}</p>
          {/if}
        </div>
      {:else}
        <!-- Displays the profile -->
        <div class="profile-card">
          <div class="profile-header">
            <h2>Profile Information</h2>
          </div>
          <div class="profile-content">
            <img src={$user.photoURL} alt="Profile Picture" class="profile-pic">
            <p class="profile-email"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-at" viewBox="0 0 16 16">
              <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z"/>
              <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648m-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z"/>
            </svg> {$user.email}</p>
            <p> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-fill" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
            </svg>  {$phone}</p>
            <p> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-check" viewBox="0 0 16 16">
              <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
            </svg>   {new Date($dob).toLocaleDateString()}</p>
            <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pin-map-fill" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M3.1 11.2a.5.5 0 0 1 .4-.2H6a.5.5 0 0 1 0 1H3.75L1.5 15h13l-2.25-3H10a.5.5 0 0 1 0-1h2.5a.5.5 0 0 1 .4.2l3 4a.5.5 0 0 1-.4.8H.5a.5.5 0 0 1-.4-.8z"/>
              <path fill-rule="evenodd" d="M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999z"/>
            </svg>      {$location}</p>
          </div>

          <div class="settings-tab">
            <button class="edit-btn" on:click={toggleEditing}>Edit Profile</button>
            <button class="logout-btn" on:click={logoutUser}>Logout</button>
          </div>
        </div>
      {/if}
    {:else}
      <div class="login-section">
        <h2>Welcome to WaterApp</h2>
        <button class="login-btn" on:click={loginWithGoogle}>Login with Google</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .profile-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
    background-color: #f7f7f7;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .loading-skeleton {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
  }

  .skeleton-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #ddd;
  }

  .skeleton-text {
    width: 100%;
    height: 20px;
    background-color: #ddd;
    border-radius: 4px;
  }

  .skeleton-input {
    width: 100%;
    height: 40px;
    background-color: #ddd;
    border-radius: 4px;
  }

  .profile-form,
  .profile-card {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .profile-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .profile-pic {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border-color: #0056b3;
    object-fit: cover;
    margin-bottom: 10px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .profile-email {
    font-size: 14px;
    color: #777;
    margin: 10px 0;
    text-align: center;
  }

  .profile-content {
    text-align: center;
    margin-bottom: 20px;
  }

  .profile-form input,
  .profile-form select {
    width: 100%;
    padding: 10px;
    margin: 8px 0;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
    background-color: #fafafa;
  }

  .save-btn {
    padding: 12px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    width: 100%;
  }

  .save-btn:hover {
    background-color: #45a049;
  }

  .saving-text {
    font-size: 14px;
    color: #888;
  }

  .save-message {
    font-size: 14px;
    color: #4caf50;
    text-align: center;
    margin-top: 10px;
  }

  .settings-tab {
    margin-top: 20px;
    text-align: center;
  }

  .edit-btn,
  .logout-btn {
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 10px;
    font-size: 16px;
  }

  .edit-btn {
    background-color: #007bff;
    color: white;
    border: none;
  }

  .logout-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
  }

  .edit-btn:hover {
    background-color: #0056b3;
  }

  .logout-btn:hover {
    background-color: #c0392b;
  }

  .login-section {
    text-align: center;
    padding: 50px 20px;
  }

  .login-btn {
    padding: 12px 20px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
  }

  .login-btn:hover {
    background-color: #357ae8;
  }
</style>
