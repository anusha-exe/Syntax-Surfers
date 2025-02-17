<script>
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  let darkMode = writable(false);
  let sidebarOpen = writable(true);

  function toggleTheme() {
    darkMode.update((value) => {
      const newMode = !value;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      document.body.classList.toggle("dark-mode", newMode);
      return newMode;
    });
  }

  function toggleSidebar() {
    sidebarOpen.update((value) => !value);
  }

  onMount(() => {
    const savedTheme = localStorage.getItem("theme") === "dark";
    darkMode.set(savedTheme);
    document.body.classList.toggle("dark-mode", savedTheme);
  });
</script>


<nav class="navbar">
  <div class="logo">
    <img src="src\routes\turtle-favicon1.png" width="40" alt="WaterApp Logo">
    <a href="/dashboard" style="text-decoration:none; color:white;" sveltekit:prefetch>TurtleTrack</a>
      
  </div>


  <!-- for mobile -->
  <button class="hamburger" on:click={toggleSidebar}>
    ☰
  </button>
</nav>

<div class="main-container">
  <!-- Sidebar -->
  <div class="sidebar { $sidebarOpen ? 'open' : 'closed' }">
    <div class="nav-links">
      <a href="/dashboard" sveltekit:prefetch> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door-fill" viewBox="0 0 16 16">
        <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/>
      </svg> Dashboard</a>
      <a href="/auth" sveltekit:prefetch> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
        <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
      </svg> Profile</a>
      <a href="/data-input" sveltekit:prefetch> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11"/> </svg> Data Input</a>
      <a href="/insights" sveltekit:prefetch> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bar-chart-line-fill" viewBox="0 0 16 16">
        <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1z"/>
      </svg> Insights</a>
      <a href="/recommendations" sveltekit:prefetch> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lightbulb-fill" viewBox="0 0 16 16">
        <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5"/>
      </svg> Recommendations</a>
      <a href="/leaderboard" sveltekit:prefetch> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
      </svg> Leaderboard</a>
    </div>
  </div>
  
  <!-- Main content area -->
  <div class="content">
    <slot />
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background:rgb(225, 225, 225);
    color: #333;
    transition: background 0.3s, color 0.3s;
  }

  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: linear-gradient(135deg,rgb(68, 112, 188),rgb(128, 131, 229));
    color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 20px 20px;
    position: sticky;
    top: 0;
    z-index: 1000;
    margin-left: -7px;
  }

  .logo {
    font-size: 1.6rem;
    font-weight: bold;
    letter-spacing: 1px;
  }

  img {
    margin-top: 5px;
  }

  /* for Mobile */
  .hamburger {
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    display: none;
  }

  .main-container {
    display: flex;
    height: 100vh;
    transition: margin-left 0.3s ease;
    margin-top: 70px; /* Adjusted for navbar height */
  }

  /* Sidebar */
  .sidebar {
    width: 240px;
    background-color: rgb(142, 173, 227);
    color: #333;
    padding-top: 20px;
    position: fixed;
    top: 70px; 
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
    border-right: 1px solid #ddd;
    transition: transform 0.3s ease-in-out;
    z-index: 500; /* Ensures the sidebar is above the content */
  }

  
  .sidebar.closed {
    transform: translateX(-240px);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-left: 1rem;
  }

  .nav-links a {
    color: rgb(245, 245, 245);
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    transition: all 0.3s ease;
    display: block;
  }

  .nav-links a:hover {
    background-color:rgb(205,192,137);
    transform: scale(1.05);
  }

  /* Add a line before each option */
  .nav-links a::before {
    content: "";
    display: block;
    height: 1px;
    background-color: #ddd;
    margin-bottom: 8px;
    width: 100%;
  }

  .content {
    margin-left: 240px; /* Adjusted for the sidebar */
    padding: 20px;
    width: 100%;
    transition: margin-left 0.3s ease;
    padding-top: 20px; /* Ensure content is not hidden under the navbar */
  }

  /* Responsive Styles */
  @media (max-width: 768px) {
    .hamburger {
      display: block;
    }

    .main-container {
      margin-left: 0;
    }

    .sidebar.open + .content {
      margin-left: 240px;
    }

    .content {
      margin-left: 0;
    }
  }

  
</style>

