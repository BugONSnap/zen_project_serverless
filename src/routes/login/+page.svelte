<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import CryptoJS from 'crypto-js';

  let activeTab: 'login' | 'register' = 'login';
  let email = '';
  let password = '';
  let username = '';
  let error = '';
  let loading = false;
  let formElement: HTMLFormElement;
  let successMessage = '';
  let uniqueInfo = '';

  // Validation states
  let emailError = '';
  let passwordError = '';
  let usernameError = '';
  let passwordStrength = 0;
  let resumeQuiz: any = null;

  // Validation patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
  const passwordPattern = {
    minLength: 8,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
  };

  // Clean up function
  function cleanup() {
    email = '';
    password = '';
    username = '';
    error = '';
    loading = false;
    emailError = '';
    passwordError = '';
    usernameError = '';
    passwordStrength = 0;
    successMessage = '';
    uniqueInfo = '';
    if (formElement) {
      formElement.reset();
    }
  }

  onMount(() => {
    return () => {
      cleanup();
    };
  });

  onDestroy(() => {
    cleanup();
  });

  // Validation functions
  function validateEmail(value: string): boolean {
    if (!value) {
      emailError = 'Email is required';
      return false;
    }
    if (!emailPattern.test(value)) {
      emailError = 'Please enter a valid email address';
      return false;
    }
    emailError = '';
    return true;
  }

  function validatePassword(value: string): boolean {
    if (!value) {
      passwordError = 'Password is required';
      return false;
    }

    if (value.length < passwordPattern.minLength) {
      passwordError = `Password must be at least ${passwordPattern.minLength} characters`;
      return false;
    }

    // Calculate password strength
    passwordStrength = 0;
    if (passwordPattern.hasUpperCase.test(value)) passwordStrength++;
    if (passwordPattern.hasLowerCase.test(value)) passwordStrength++;
    if (passwordPattern.hasNumber.test(value)) passwordStrength++;
    if (passwordPattern.hasSpecialChar.test(value)) passwordStrength++;

    if (passwordStrength < 3) {
      passwordError = 'Password must include uppercase, lowercase, number, and special character';
      return false;
    }

    passwordError = '';
    return true;
  }

  function validateUsername(value: string): boolean {
    if (!value) {
      usernameError = 'Username is required';
      return false;
    }
    if (!usernamePattern.test(value)) {
      usernameError = 'Username must be 3-20 characters and can only contain letters, numbers, and underscores';
      return false;
    }
    usernameError = '';
    return true;
  }

  function validateUniqueInfo(value: string): boolean {
    if (!value) {
      error = 'Unique recovery information is required';
      return false;
    }
    error = '';
    return true;
  }

  // Input handlers with validation
  function handleEmailInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    email = value;
    validateEmail(value);
  }

  function handlePasswordInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    password = value;
    validatePassword(value);
  }

  function handleUsernameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    username = value;
    validateUsername(value);
  }

  function handleUniqueInfoInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    uniqueInfo = value;
    validateUniqueInfo(value);
  }

  async function handleSubmit() {
    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isUsernameValid = activeTab === 'register' ? validateUsername(username) : true;
    const isUniqueInfoValid = activeTab === 'register' ? validateUniqueInfo(uniqueInfo) : true;

    if (!isEmailValid || !isPasswordValid || !isUsernameValid || !isUniqueInfoValid) {
      return;
    }

    loading = true;
    error = '';
    successMessage = '';

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      let body = activeTab === 'login' ? { email, password } : { email, password, username, uniqueInfo };

      // Encrypt payload if it's a login request
      if (activeTab === 'login') {
        const secretKey = 'your-secret-key'; // WARNING: Insecure for production!
        const encryptedEmail = CryptoJS.AES.encrypt(email, secretKey).toString();
        const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();
        body = { email: encryptedEmail, password: encryptedPassword };

        // For demonstration: decrypt to preview
        const decryptedEmailBytes = CryptoJS.AES.decrypt(encryptedEmail, secretKey);
        const decryptedEmail = decryptedEmailBytes.toString(CryptoJS.enc.Utf8);
        const decryptedPasswordBytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
        const decryptedPassword = decryptedPasswordBytes.toString(CryptoJS.enc.Utf8);

      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Handle login redirect based on adminLevel
      if (activeTab === 'login') {
        const { adminLevel } = data.user;
        if (adminLevel === 0 || adminLevel === 1) {
          goto('/admin');
        } else {
          goto('/dashboard');
        }
      } else {
        // Registration successful: switch to login tab and show message
        switchTab('login');
        successMessage = 'Registration successful! Please log in.';
        return;
      }
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function switchTab(tab: 'login' | 'register') {
    activeTab = tab;
    cleanup();
  }

  function continueQuiz() {
    if (resumeQuiz && resumeQuiz.quizId) {
      window.location.href = `/quiz?id=${resumeQuiz.quizId}`;
    }
  }

  // Fetch resume quiz data on component mount
  onMount(async () => {
    try {
      const res = await fetch('/api/quiz/resume');
      if (res.ok) {
        const data = await res.json();
        if (data && data.quizId) {
          resumeQuiz = data;
        }
      }
    } catch (e) {}
  });
</script>

<div class="min-h-screen text-white font-medium relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); font-family: poppins;">
  <!-- Animated gradient overlay -->
  <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
  <!-- Subtle dot pattern -->
  <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
  <div class="w-full max-w-md flex flex-col gap-6 relative z-10">
    <div class="rounded-3xl backdrop-filter backdrop-blur-xl bg-gray-900/60 border border-gray-700/50 p-8 shadow-2xl w-full space-y-6 relative z-10 overflow-hidden flex flex-col items-center">
      <!-- Logo -->
      <img src="/server-logo.png" alt="Zen-Try Logo" class="h-24 w-24 mb-3" />
      <h1 style="font-family: poppins;" class="text-4xl font-bold text-center text-white mb-4">ZenTry</h1>
      <div class="flex justify-center gap-3 mb-4">
        
        <button
          class="px-5 py-1.5 rounded-full border transition font-semibold focus:outline-none text-sm disabled:opacity-50 {activeTab === 'login' ? 'bg-[#d97706] text-white border-[#d97706] shadow-lg shadow-amber-900/50' : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'}"
          on:click={() => switchTab('login')}
          disabled={activeTab === 'login'}
        >
          Login
        </button>
        <button
          class="px-5 py-1.5 rounded-full border transition font-semibold focus:outline-none text-sm disabled:opacity-50 {activeTab === 'register' ? 'bg-[#d97706] text-white border-[#d97706] shadow-lg shadow-amber-900/50' : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'}"
          on:click={() => switchTab('register')}
          disabled={activeTab === 'register'}
        >
          Register
        </button>
      </div>
      <form 
        class="w-full mt-4 space-y-5" 
        on:submit|preventDefault={handleSubmit}
        bind:this={formElement}
      >
        <div class="space-y-3">
          {#if activeTab === 'register'}
            <div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                on:input={handleUsernameInput}
                class="block w-full px-4 py-2.5 bg-gray-800/50 text-white border border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-[#d97706] text-sm"
                placeholder="Username"
              />
              {#if usernameError}
                <p class="mt-1 text-sm text-red-400">{usernameError}</p>
              {/if}
            </div>
            <div>
              <input
                id="uniqueInfo"
                name="uniqueInfo"
                type="text"
                required
                value={uniqueInfo}
                on:input={handleUniqueInfoInput}
                class="block w-full px-4 py-2.5 bg-gray-800/50 text-white border border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-[#d97706] text-sm"
                placeholder="Unique Recovery Info (e.g., Mother's maiden name)"
              />
            </div>
          {/if}
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              on:input={handleEmailInput}
              class="block w-full px-4 py-2.5 bg-gray-800/50 text-white border border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-[#d97706] text-sm"
              placeholder="Email address"
            />
            {#if emailError}
              <p class="mt-1 text-sm text-red-400">{emailError}</p>
            {/if}
          </div>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              on:input={handlePasswordInput}
              class="block w-full px-4 py-2.5 bg-gray-800/50 text-white border border-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-[#d97706] text-sm"
              placeholder="Password"
            />
            {#if passwordError}
              <p class="mt-1 text-sm text-red-400">{passwordError}</p>
            {/if}
            {#if activeTab === 'register' && password}
              <div class="mt-2">
                <div class="flex space-x-2">
                  {#each Array(4) as _, i}
                    <div class="flex-1 h-2 rounded-full {i < passwordStrength ? 'bg-[#d97706]' : 'bg-gray-700/50'}"></div>
                  {/each}
                </div>
                <p class="mt-1 text-xs text-gray-400">
                  Password strength: {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || 'None'}
                </p>
              </div>
            {/if}
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            class="w-full flex justify-center py-2.5 px-4 border-0 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] hover:shadow-lg hover:shadow-amber-900/50 transition-all shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d97706] focus:ring-offset-gray-900 disabled:opacity-50"
          >
            {#if loading}
              <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            {/if}
            {activeTab === 'login' ? 'Sign in' : 'Register'}
          </button>
        </div>
        {#if activeTab === 'login'}
          <div class="text-center">
            <a
              href="/reset-password"
              class="text-sm text-[#d97706] hover:text-[#f59e0b] transition font-semibold"
            >
              Forgot your password?
            </a>
          </div>
        {/if}
      </form>
    </div>
  </div>
  {#if resumeQuiz}
    <div class="mt-10 flex flex-col items-center relative z-10">
      <div class="rounded-2xl border border-[#d97706]/40 bg-gray-900/60 backdrop-blur px-6 py-5 shadow-xl flex flex-col items-center w-full max-w-lg mx-auto">
        <span class="font-semibold text-lg text-white mb-2">Continue where you left off</span>
        <span class="text-[#d97706] mb-4 font-semibold">{resumeQuiz.title || 'Untitled Quiz'}</span>
        <button class="px-6 py-2 bg-[#d97706] text-white rounded-lg hover:bg-[#f59e0b] transition-all font-semibold shadow-lg shadow-amber-900/50" on:click={continueQuiz}>
          Continue Quiz
        </button>
      </div>
    </div>
  {/if}
</div>