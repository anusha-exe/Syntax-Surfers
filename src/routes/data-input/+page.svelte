<!-- src/routes/data-input/+page.svelte -->
<script>
   import "../../lib/styles/data-input.css";
  import { onMount } from "svelte";
  import { writable, get } from "svelte/store";
  import { auth, logWaterUsage } from "$lib/firebase";
  import { onAuthStateChanged } from "firebase/auth";

  let user = writable(null);
  let waterUsage = writable("");
  let unit = writable("liters");
  let usageType = writable("shower"); // e.g., shower, toilet, etc.
  let duration = writable("");        // duration in minutes
  let householdSize = writable("");   // number of people in household
  let applianceEfficiency = writable("standard"); // efficiency level
  let waterSource = writable("municipal"); // water source type
  let activityLevel = writable("moderate"); // daily activity level

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
    if (get(duration) <= 0) {
      alert("Please enter a valid duration in minutes!");
      return;
    }
    if (get(householdSize) <= 0) {
      alert("Please enter a valid household size!");
      return;
    }

    logWaterUsage(currentUser.uid, {
      amount: get(waterUsage),
      unit: get(unit),
      usageType: get(usageType),
      duration: get(duration),
      householdSize: get(householdSize),
      applianceEfficiency: get(applianceEfficiency),
      waterSource: get(waterSource),
      activityLevel: get(activityLevel)
    })
      .then(() => {
        alert(
          `Logged: ${get(waterUsage)} ${get(unit)} for ${get(usageType)} (Duration: ${get(duration)} mins)`
        );
        waterUsage.set("");
        duration.set("");
        householdSize.set("");
      })
      .catch((error) =>
        console.error("Error logging water usage:", error)
      );
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
  
  <div class="form-group">
    <label for="amount">Water Amount</label>
    <input id="amount" type="number" bind:value={$waterUsage} min="0" placeholder="Enter amount" />
  </div>
  
  <div class="form-group">
    <label for="unit">Unit</label>
    <select id="unit" bind:value={$unit}>
      <option value="liters">Liters</option>
      <option value="gallons">Gallons</option>
      <option value="cubic-meters">Cubic Meters</option>
      <option value="milliliters">Milliliters</option>
      <option value="fluid-ounces">Fluid Ounces</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="usageType">Usage Type</label>
    <select id="usageType" bind:value={$usageType}>
      <option value="shower">Shower</option>
      <option value="toilet">Toilet</option>
      <option value="dishwashing">Dishwashing</option>
      <option value="laundry">Laundry</option>
      <option value="gardening">Gardening</option>
      <option value="other">Other</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="duration">Duration (minutes)</label>
    <input id="duration" type="number" bind:value={$duration} min="0" placeholder="Duration in minutes" />
  </div>
  
  <div class="form-group">
    <label for="householdSize">Household Size</label>
    <input id="householdSize" type="number" bind:value={$householdSize} min="1" placeholder="Number of people in household" />
  </div>
  
  <div class="form-group">
    <label for="applianceEfficiency">Water-Efficient Appliances</label>
    <select id="applianceEfficiency" bind:value={$applianceEfficiency}>
      <option value="standard">Standard</option>
      <option value="low-flow">Low-Flow</option>
      <option value="high-efficiency">High-Efficiency</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="waterSource">Water Source</label>
    <select id="waterSource" bind:value={$waterSource}>
      <option value="municipal">Municipal</option>
      <option value="borewell">Borewell</option>
      <option value="tanker">Tanker</option>
      <option value="rainwater">Rainwater</option>
    </select>
  </div>
  
  
  <div class="form-group">
    <label for="activityLevel">Daily Activity Level</label>
    <select id="activityLevel" bind:value={$activityLevel}>
      <option value="low">Low</option>
      <option value="moderate">Moderate</option>
      <option value="high">High</option>
    </select>
  </div>
  
  <button on:click={logUsage}>Log Usage</button>
</div>

<style>
  .data-input {
    max-width: 500px;
    margin: 40px auto;
    padding: 30px;
    background: linear-gradient(135deg, #ffffff, #f9f9ff);
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    font-family: "Poppins", sans-serif;
    transition: transform 0.3s ease;
  }

  .data-input:hover {
    transform: translateY(-3px);
  }

  .data-input h2 {
    text-align: center;
    margin-bottom: 25px;
    font-size: 1.9rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 1rem;
    color: #555;
    font-weight: 500;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 12px;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: #0077cc;
  }

  button {
    width: 100%;
    padding: 12px;
    font-size: 1rem;
    color: #fff;
    background: #0077cc;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
    margin-top: 10px;
  }

  button:hover {
    background: #005fa3;
    transform: scale(1.03);
  }
</style>