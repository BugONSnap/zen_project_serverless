<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";

  export let data: PageData;

  const { isAuthorized, username, error, weeklyReport } = data;
  const siteStats = (data as any).siteStats;

  // Format date for display
  function getWeekRange() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    return `${formatDate(sevenDaysAgo)} - ${formatDate(today)}`;
  }
</script>

<div class="min-h-screen text-white relative" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); font-family: poppins;">
  <!-- Animated gradient overlay -->
  <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
  <!-- Subtle dot pattern -->
  <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>

{#if data.loading}
  <div class="flex justify-center items-center min-h-[60vh] relative z-10">
    <div class="border border-emerald-400 bg-emerald-600/10 text-emerald-100 px-8 py-5 rounded-2xl shadow-xl text-lg font-semibold text-center">
      Loading...
    </div>
  </div>
{:else if error}
  <div class="flex justify-center items-center min-h-[60vh] relative z-10">
    <div class="border border-red-400 bg-red-700/20 text-red-100 px-8 py-5 rounded-2xl shadow-xl text-lg font-semibold text-center">
      {error}
    </div>
  </div>
{:else if isAuthorized && weeklyReport}
  <div class="max-w-7xl mx-auto px-4 py-10 relative z-10">
    <!-- Welcome Header -->
    <div class="text-center mb-10">
      <h1 class="text-5xl font-bold text-amber-400 mb-3">Welcome, {username || "Admin"}!</h1>
      <p class="text-gray-300 text-xl mb-2">Weekly Report Summary</p>
      <p class="text-amber-300/70 text-sm">{getWeekRange()}</p>
    </div>

    <!-- Weekly Report Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- Community Posts Card -->
      <div class="rounded-2xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 hover:border-amber-400/50 transition-all">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-amber-400">Community Posts</h3>
          <svg class="w-8 h-8 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <div class="space-y-2">
          <p class="text-4xl font-bold text-white">{weeklyReport.communityPosts}</p>
          <p class="text-sm text-gray-400">Total posts this week</p>
          <p class="text-xs text-amber-300/70 mt-2">{weeklyReport.uniquePosters} unique users posted</p>
        </div>
      </div>

      <!-- Engagement Card -->
      <div class="rounded-2xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 hover:border-amber-400/50 transition-all">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-amber-400">Engagement</h3>
          <svg class="w-8 h-8 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        </div>
        <div class="space-y-2">
          <p class="text-4xl font-bold text-white">{weeklyReport.totalEngagement}</p>
          <p class="text-sm text-gray-400">Total interactions</p>
          <div class="text-xs text-amber-300/70 mt-2 space-y-1">
            <p>• {weeklyReport.likes} likes</p>
            <p>• {weeklyReport.replies} replies</p>
            <p>• {weeklyReport.replyLikes} reply likes</p>
          </div>
        </div>
      </div>

      <!-- New Registrations Card -->
      <div class="rounded-2xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 hover:border-amber-400/50 transition-all">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-amber-400">New Users</h3>
          <svg class="w-8 h-8 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
        <div class="space-y-2">
          <p class="text-4xl font-bold text-white">{weeklyReport.newRegistrations}</p>
          <p class="text-sm text-gray-400">Registered this week</p>
          <div class="text-xs text-amber-300/70 mt-2 space-y-1">
            <p>• {weeklyReport.registrationsByType.STUDENT} Students</p>
            <p>• {weeklyReport.registrationsByType.PROFESSIONAL} Professionals</p>
            <p>• {weeklyReport.registrationsByType.HOBBYIST} Hobbyists</p>
          </div>
        </div>
      </div>

      <!-- Quiz Attempts Card -->
      <div class="rounded-2xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 hover:border-amber-400/50 transition-all">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-amber-400">Quiz Activity</h3>
          <svg class="w-8 h-8 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
        </div>
        <div class="space-y-2">
          <p class="text-4xl font-bold text-white">{weeklyReport.quizAttempts}</p>
          <p class="text-sm text-gray-400">Quiz attempts this week</p>
        </div>
      </div>

      <!-- Active Users Card -->
      <div class="rounded-2xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 hover:border-amber-400/50 transition-all">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-amber-400">Active Users</h3>
          <svg class="w-8 h-8 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <div class="space-y-2">
          <p class="text-4xl font-bold text-white">{weeklyReport.activeUsers}</p>
          <p class="text-sm text-gray-400">Users engaged in community</p>
        </div>
      </div>

      <!-- Site Visits Card -->
      <div class="rounded-2xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 hover:border-amber-400/50 transition-all">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-amber-400">Site Visits</h3>
          <svg class="w-8 h-8 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </div>
        <div class="space-y-2">
          <p class="text-4xl font-bold text-white">{siteStats?.totalVisits || 0}</p>
          <p class="text-sm text-gray-400">Total visits this week</p>
          <p class="text-xs text-amber-300/70 mt-2">{siteStats?.uniqueVisitors || 0} unique visitors</p>
        </div>
      </div>

      <!-- Quick Actions Card -->
      <div class="rounded-2xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 hover:border-amber-400/50 transition-all">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-amber-400">Quick Actions</h3>
          <svg class="w-8 h-8 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div class="space-y-3">
          <a href="/admin/users" class="block w-full bg-amber-600/90 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow font-semibold text-center">
            Manage Users
          </a>
          <a href="/admin/quizzes" class="block w-full bg-amber-600/90 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow font-semibold text-center">
            Manage Quizzes
          </a>
          <a href="/admin/analytics" class="block w-full bg-amber-600/90 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow font-semibold text-center">
            View Analytics
          </a>
        </div>
      </div>
    </div>

    <!-- Summary Section -->
    <div class="rounded-2xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 mt-6">
      <h2 class="text-2xl font-semibold text-amber-400 mb-4">Weekly Summary</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
        <div>
          <p class="text-sm text-amber-300/70 mb-2">Community Activity</p>
          <p class="text-base">This week saw <span class="text-amber-400 font-semibold">{weeklyReport.communityPosts} new posts</span> from <span class="text-amber-400 font-semibold">{weeklyReport.uniquePosters} users</span>, with a total of <span class="text-amber-400 font-semibold">{weeklyReport.totalEngagement} interactions</span> across likes, replies, and comments.</p>
        </div>
        <div>
          <p class="text-sm text-amber-300/70 mb-2">User Growth</p>
          <p class="text-base"><span class="text-amber-400 font-semibold">{weeklyReport.newRegistrations} new users</span> joined this week, including <span class="text-amber-400 font-semibold">{weeklyReport.registrationsByType.STUDENT} Students</span>, <span class="text-amber-400 font-semibold">{weeklyReport.registrationsByType.PROFESSIONAL} Professionals</span>, and <span class="text-amber-400 font-semibold">{weeklyReport.registrationsByType.HOBBYIST} Hobbyists</span>.</p>
        </div>
        <div>
          <p class="text-sm text-amber-300/70 mb-2">Learning Activity</p>
          <p class="text-base">Users completed <span class="text-amber-400 font-semibold">{weeklyReport.quizAttempts} quiz attempts</span> this week, showing strong engagement with the learning platform.</p>
        </div>
        <div>
          <p class="text-sm text-amber-300/70 mb-2">Platform Health</p>
          <p class="text-base"><span class="text-amber-400 font-semibold">{weeklyReport.activeUsers} active users</span> participated in community discussions, indicating healthy platform engagement.</p>
        </div>
        <div>
          <p class="text-sm text-amber-300/70 mb-2">Website Traffic</p>
          <p class="text-base">The website received <span class="text-amber-400 font-semibold">{siteStats?.totalVisits || 0} visits</span> this week from <span class="text-amber-400 font-semibold">{siteStats?.uniqueVisitors || 0} unique visitors</span> (both logged in and anonymous users).</p>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="flex justify-center items-center min-h-[60vh] relative z-10">
    <div class="border border-amber-400 bg-gray-900/40 text-amber-200 px-8 py-5 rounded-2xl shadow-xl text-lg font-semibold text-center">
      Access denied. Redirecting to login...
    </div>
  </div>
{/if}
</div>
