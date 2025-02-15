<!-- src/routes/+layout.svelte -->
<nav class="navbar">
    <div class="logo">💧 WaterApp</div>
    <div class="nav-links">
      <a href="/dashboard" sveltekit:prefetch>Dashboard</a>
      <a href="/auth" sveltekit:prefetch>Auth</a>
      <a href="/data-input" sveltekit:prefetch>Data Input</a>
      <a href="/insights" sveltekit:prefetch>Insights</a>
      <a href="/recommendations" sveltekit:prefetch>Recommendations</a>
    </div>
  </nav>
  
  <slot />
  
  <style>
    :global(body) {
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #f4f4f4;
    }
  
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 2rem;
      background: #0077cc;
      color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border-radius: 0 0 20px 20px;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
  
    .logo {
      font-size: 1.4rem;
      font-weight: bold;
      letter-spacing: 1px;
    }
  
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
  
    .nav-links a {
      color: white;
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      transition: all 0.3s ease;
    }
  
    .nav-links a:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  </style>