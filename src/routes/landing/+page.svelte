<script lang="ts">
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    let user: any = undefined;
    onMount(() => {
      user = undefined;
    });
</script>

<DashboardHeader {user} pageName="Zentry" />

<div style="font-family: poppins;" class="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center text-white">
  <!-- Hero Section -->
  <div class="w-full max-w-7xl px-4 md:px-0 py-20 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
    <!-- Left: Headline and CTA -->
    <div class="flex-1 flex flex-col items-start md:pl-8 mb-10 md:mb-0">
      <h1 class="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-7 drop-shadow-xl">
        Master web development,<br>
        <span class="text-amber-400">the ZenTry way.</span>
      </h1>
      <p class="text-lg md:text-xl text-gray-300 max-w-lg mb-7 font-medium">
        Interactive quizzes, hands-on playgrounds, and step-by-step mastery—powered by a friendly mascot! Discover a learning journey designed for all levels. Dive in. <span class="text-emerald-300 font-semibold">Try, learn, master!</span>
      </p>
      <div class="flex gap-4 flex-wrap">
        <a href="/login" class="px-8 py-4 rounded-lg bg-amber-400 text-gray-900 font-bold text-lg shadow-lg hover:bg-amber-300 transition ring-2 ring-amber-500 ring-offset-2">Get Started</a>
        <a href="/learn" class="px-8 py-4 rounded-lg bg-emerald-500 text-white font-bold text-lg shadow-lg hover:bg-emerald-400 transition">Explore Learn</a>
      </div>
    </div>
    <!-- Right: Logo Card with Glow -->
    <div class="flex-1 flex flex-col items-center">
      <div class="relative bg-gray-900 rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col items-center z-10" style="box-shadow: 0 12px 48px 8px rgba(251,191,36,0.12), 0 0 100px 20px rgba(56,189,248,0.06);">
        <img src="/server-logo.png" alt="ZenTry Mascot Logo" class="w-52 h-52 mt-8 drop-shadow-2xl bg-white rounded-full border-4 border-amber-400" />
        <div class="px-8 py-4 pb-8 flex flex-col items-center">
          <h2 class="text-2xl font-bold text-amber-300 mb-1 text-center">Meet the ZenTry Mascot</h2>
          <p class="text-gray-200 text-center text-md font-medium">Curious. Focused. Always drooling for more code.<br /> ZenTry guides your journey from newbie to pro—one <span class="text-emerald-400 font-semibold">try</span> at a time!</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Features Below Hero -->
  <section style="font-family: poppins;" class="w-full max-w-6xl px-4 md:px-0 mt-12 mb-24 mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
      <!-- Learn Card -->
      <div style="font-family: poppins;" class="bg-gray-800/90 rounded-2xl shadow-xl p-7 flex flex-col items-center text-center border-t-4 border-emerald-400">
        <div class="text-4xl mb-2">📚</div>
        <h3 class="font-bold text-xl mb-2">Guided Learning</h3>
        <p class="text-gray-300 text-base">Tackle step-by-step modules, unlock lessons, and grow from beginner to ace. Self-paced, milestone-based, and fun!</p>
      </div>
      <!-- Playground Card -->
      <div style="font-family: poppins;" class="bg-gray-800/90 rounded-2xl shadow-xl p-7 flex flex-col items-center text-center border-t-4 border-blue-400">
        <div class="text-4xl mb-2">🧪</div>
        <h3 class="font-bold text-xl mb-2">Code Playground</h3>
        <p class="text-gray-300 text-base">Experiment in a safe coding environment. Test your HTML, CSS, and JS. Instant results—no setup needed!</p>
      </div>
      <!-- Leaderboard Card -->
      <div style="font-family: poppins;" class="bg-gray-800/90 rounded-2xl shadow-xl p-7 flex flex-col items-center text-center border-t-4 border-amber-400">
        <div class="text-4xl mb-2">🏆</div>
        <h3 class="font-bold text-xl mb-2">Leaderboard</h3>
        <p class="text-gray-300 text-base">Climb the ZenTry ranks and celebrate your victories! Track your progress, join friendly competition, and get inspired.</p>
      </div>
      <!-- Fun Card -->
    
    </div>
  </section>
  
  <!-- Facts About the Mascot Section -->
  <div class="w-full max-w-7xl px-4 md:px-0 py-20 flex flex-col md:flex-row items-center justify-between mb-[200px] gap-12 md:gap-0">
    <!-- Left: Headline and CTA -->
    <div style="font-family: poppins;" class="flex-1 flex flex-col items-center">
        <div class="relative bg-gray-900 rounded-[20px] shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col items-center z-10" style="box-shadow: 0 12px 48px 8px rgba(251,191,36,0.12), 0 0 100px 20px rgba(56,189,248,0.06);">
          <img src="/server-logo.png" alt="ZenTry Mascot Logo" class="w-90 h-90 mt-8 drop-shadow-2xl bg-white rounded-full border-4 border-amber-400" />
          <div class="px-4 py-4 pb-2 flex flex-col items-center">
        </div>
        </div>
      </div>
    <div style="font-family: poppins;" class="flex-1 flex flex-col items-start md:pl-8 mb-10 md:mb-0">
      <h1 class="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-7 drop-shadow-xl">
        Meet the Mascot<br>
        <span class="text-amber-400">Zentreya</span>
      </h1>
      <p class="text-xl md:text-2xl text-gray-300 max-w-lg mb-7 font-medium">
        Her name is <span class="text-amber-500 font-bold">Zentreya</span> the famous VTuber who the creator watched while stressing over deadlines and who helped him get through them. <span class="text-emerald-300 font-semibold">Every try counts, and every coder needs their <span class="text-pink-500 font-bold">hero!</span></span>
      </p>
      <div class="flex gap-8 flex-wrap ">
            </div>
    </div>
    <!-- Right: Logo Card with Glow -->
    
  </div>
</div>