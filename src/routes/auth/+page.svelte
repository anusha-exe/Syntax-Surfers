<script>
  import '../../lib/styles/auth.css';
  import { auth, loginWithGoogle, logout, db } from "$lib/firebase";
  import { onMount } from "svelte";
  import { writable, get } from "svelte/store";
  import { onAuthStateChanged } from "firebase/auth";
  import { collection, getDocs, doc, setDoc } from "firebase/firestore";

  let user = writable(null);
  let users = writable([]);

  // ✅ Fix: Ensure Firestore stores only one document per user
  async function saveUserToDatabase(userData) {
  if (!userData) return;

  console.log("Attempting to save user:", userData.email);
  console.log("UID being used:", userData.uid);

  const userRef = doc(db, "users", userData.uid);
  
  await setDoc(userRef, {
    name: userData.displayName,
    email: userData.email,
    photoURL: userData.photoURL
  }, { merge: true });

  console.log("User saved successfully.");
}


  async function loadUsers() {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    users.set(snapshot.docs.map(doc => doc.data())); 
  }

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      if (get(user)?.uid !== userData?.uid) { // ✅ Fix: Only update if user changes
        user.set(userData);
        await saveUserToDatabase(userData);
      }
    });

    return () => unsubscribe();
  });
</script>

<div>
  {#await $user}
    <p>Checking authentication...</p>
  {:then currentUser}
    {#if currentUser}
      <p>Welcome, {currentUser.displayName}!</p>
      <img src={currentUser.photoURL} alt="Profile Picture" width="50">
      <button on:click={logout}>Logout</button>

      <h3>Registered Users:</h3>
      <button on:click={loadUsers}>Load Users</button>
      <ul>
        {#each $users as user}
          <li>{user.name} - {user.email}</li>
        {/each}
      </ul>
    {:else}
      <button on:click={loginWithGoogle}>Login with Google</button>
    {/if}
  {/await}
</div>
