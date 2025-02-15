<script>
  import { onMount } from "svelte";
  import { writable, get } from "svelte/store";
  import { auth, logWaterUsage } from "$lib/firebase";
  import { onAuthStateChanged } from "firebase/auth";

  let user = writable(null);
  let waterUsage = writable("");
  let unit = writable("liters");

  function logUsage() {
    const currentUser = get(user);
    if (!currentUser) {
      alert("Please log in first!");
      return;
    }

    if (get(waterUsage) <= 0) {
      alert("Please enter a valid water amount!");
      return;
    }

    logWaterUsage(currentUser.uid, get(waterUsage), get(unit))
      .then(() => {
        alert(`Logged: ${get(waterUsage)} ${get(unit)}`);
        waterUsage.set(""); // Reset input after logging
      })
      .catch((error) => console.error("Error logging water usage:", error));
  }

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      user.set(userData);
    });

    return () => unsubscribe();
  });
</script>

<div class="data-input">
  <h2>Log Your Water Usage</h2>
  <input type="number" bind:value={$waterUsage} min="0" placeholder="Enter amount" />
  <select bind:value={$unit}>
    <option value="liters">Liters</option>
    <option value="gallons">Gallons</option>
  </select>
  <button on:click={logUsage}>Log Usage</button>
</div>

<style>
  .data-input {
    max-width: 400px;
    margin: 40px auto;
    padding: 30px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-align: center;
    font-family: 'Poppins', sans-serif;
  }
  
  .data-input h2 {
    font-size: 1.75rem;
    margin-bottom: 20px;
    color: #333;
  }
  
  .data-input input,
  .data-input select {
    width: 80%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: border 0.3s ease;
  }
  
  .data-input input:focus,
  .data-input select:focus {
    border-color: #0077cc;
  }
  
  .data-input button {
    padding: 10px 20px;
    font-size: 1rem;
    color: #fff;
    background: #0077cc;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
    margin-top: 15px;
  }
  
  .data-input button:hover {
    background: #005fa3;
    transform: scale(1.05);
  }
</style>