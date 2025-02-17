<script>
   import "../../lib/styles/leaderboard.css";
  import { getLeaderboard } from "$lib/firebase.js";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  let loading = writable(true);
  let leaderboard = writable([]);
  let locationLeaderboards = writable({});

  onMount(async () => {
    const { overallLeaderboard, locationLeaderboards: locations } = await getLeaderboard();
    leaderboard.set(overallLeaderboard);
    locationLeaderboards.set(locations);
    loading.set(false);
  });
</script>

<div class="leaderboard-container">
  <h2 class="leaderboard-title">Water Usage Leaderboard</h2>

  {#if $loading}
    <p>Loading...</p>
  {:else}
    {#if $leaderboard.length === 0}
      <p>No data available</p>
    {:else}
      <!-- Overall Leaderboard -->
      <h3 class="leaderboard-subtitle">Overall Ranking</h3>
      <ul class="leaderboard-list">
        {#each $leaderboard as user, index}
          <li class="leaderboard-item">
            <span class="leaderboard-rank">#{index + 1}</span>
            {#if user.photoURL}
              <img class="leaderboard-avatar" src={user.photoURL} alt="Profile Picture" />
            {/if}
            <span class="leaderboard-name">{user.name}</span>
            <span class="leaderboard-usage">{user.totalUsage} L</span>
          </li>
        {/each}
      </ul>

      <!-- Location-Based Leaderboards -->
      {#each Object.keys($locationLeaderboards) as location}
        <h3 class="leaderboard-subtitle">{location} Leaderboard</h3>
        <ul class="leaderboard-list">
          {#each $locationLeaderboards[location] as user, index}
            <li class="leaderboard-item">
              <span class="leaderboard-rank">#{index + 1}</span>
              {#if user.photoURL}
                <img class="leaderboard-avatar" src={user.photoURL} alt="Profile Picture" />
              {/if}
              <span class="leaderboard-name">{user.name}</span>
              <span class="leaderboard-usage">{user.totalUsage} L</span>
            </li>
          {/each}
        </ul>
      {/each}
    {/if}
  {/if}
</div>

