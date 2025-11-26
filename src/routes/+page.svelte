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

<div class="min-h-screen text-[#4a1c1c] font-medium relative overflow-hidden dashboard-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style="background: linear-gradient(to bottom, #ffbdbd 0%, #ff9b9b 50%, #ff7b7b 100%);">
  <div class="w-full max-w-md flex flex-col gap-6">
    <div class="rounded-3xl border-2 border-white/30 bg-gradient-to-br from-[#ffb0b0] to-[#ffd4d4] p-8 shadow-2xl backdrop-blur w-full space-y-6 relative z-10 overflow-hidden flex flex-col items-center">
      <!-- Logo -->
      <img src="/server-logo.png" alt="Zen-Try Logo" class="h-24 w-24 mb-3" />
      <h1 class="text-4xl font-bold text-center text-[#4a1c1c] mb-4">ZenTry</h1>
      <div class="flex justify-center gap-3 mb-4">
        
        <button
          class="px-5 py-1.5 rounded-full border transition font-semibold focus:outline-none text-sm disabled:opacity-50 {activeTab === 'login' ? 'bg-emerald-500/80 text-[#4a1c1c] border-emerald-600 shadow' : 'bg-white/80 text-[#4a1c1c] border-white/30 hover:bg-white'}"
          on:click={() => switchTab('login')}
          disabled={activeTab === 'login'}
        >
          Login
        </button>
        <button
          class="px-5 py-1.5 rounded-full border transition font-semibold focus:outline-none text-sm disabled:opacity-50 {activeTab === 'register' ? 'bg-emerald-500/80 text-[#4a1c1c] border-emerald-600 shadow' : 'bg-white/80 text-[#4a1c1c] border-white/30 hover:bg-white'}"
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
                class="block w-full px-4 py-2.5 bg-white/90 text-[#4a1c1c] border border-white/30 rounded-lg placeholder-[#4a1c1c]/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                placeholder="Username"
              />
              {#if usernameError}
                <p class="mt-1 text-sm text-[#4a1c1c]">{usernameError}</p>
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
                class="block w-full px-4 py-2.5 bg-white/90 text-[#4a1c1c] border border-white/30 rounded-lg placeholder-[#4a1c1c]/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
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
              class="block w-full px-4 py-2.5 bg-white/90 text-[#4a1c1c] border border-white/30 rounded-lg placeholder-[#4a1c1c]/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
              placeholder="Email address"
            />
            {#if emailError}
              <p class="mt-1 text-sm text-[#4a1c1c]">{emailError}</p>
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
              class="block w-full px-4 py-2.5 bg-white/90 text-[#4a1c1c] border border-white/30 rounded-lg placeholder-[#4a1c1c]/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
              placeholder="Password"
            />
            {#if passwordError}
              <p class="mt-1 text-sm text-[#4a1c1c]">{passwordError}</p>
            {/if}
            {#if activeTab === 'register' && password}
              <div class="mt-2">
                <div class="flex space-x-2">
                  {#each Array(4) as _, i}
                    <div class="flex-1 h-2 rounded-full {i < passwordStrength ? 'bg-emerald-400' : 'bg-white/15'}"></div>
                  {/each}
                </div>
                <p class="mt-1 text-xs text-white/70">
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
            class="w-full flex justify-center py-2.5 px-4 border-0 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-[#ff9b9b] via-[#ff7b7b] to-[#ff5d5d] hover:opacity-90 transition-all shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff9b9b] disabled:opacity-50"
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
              class="text-sm text-[#4a1c1c] hover:text-[#2a0c0c] transition"
            >
              Forgot your password?
            </a>
          </div>
        {/if}
      </form>
    </div>
  </div>
  {#if resumeQuiz}
    <div class="mt-10 flex flex-col items-center">
      <div class="rounded-2xl border border-amber-300/40 bg-amber-400/10 px-6 py-5 shadow-xl backdrop-blur flex flex-col items-center w-full max-w-lg mx-auto">
        <span class="font-semibold text-lg text-white mb-2">Continue where you left off</span>
        <span class="text-amber-100 mb-4">{resumeQuiz.title || 'Untitled Quiz'}</span>
        <button class="px-6 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow" on:click={continueQuiz}>
          Continue Quiz
        </button>
      </div>
    </div>
  {/if}
</div>