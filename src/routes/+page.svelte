<script>
import { goto } from '$app/navigation';
  import DataInput from '../components/DataInput.svelte';
  import Insights from '../components/Insights.svelte';
  import Recommendations from '../components/Recommendations.svelte';
</script>

<h1>Water Consumption Management</h1>
<p>Welcome to My Water App</p>
<button on:click={() => goto('/auth')}>Go to Auth</button>

<DataInput />
<Insights />
<Recommendations />