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

<div class="min-h-screen bg-gradient-to-b from-[#FF0606] via-[#6F1414] to-[#050202] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
  <div class="w-full max-w-md flex flex-col gap-4">
    <div class="mb-1">
      <div class="rounded-3xl border border-white/1 bg-transparent/10 p-1  flex flex-col items-center mx-auto w-full">
        <!-- Zentry Logo -->
        <img src="/zentry logo.png" alt="Zentry Logo" class="h-58 w-auto" />
      </div>
    </div>
    <div class="rounded-3xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur w-full space-y-5 relative z-10 overflow-hidden">
      <h1 class="text-5xl font-bold text-center text-white mb-6">Zentry</h1>
      <div class="flex justify-center gap-4 mb-6">
        
        <button
          class="px-6 py-2 rounded-full border transition font-semibold focus:outline-none text-base disabled:opacity-50 {activeTab === 'login' ? 'bg-emerald-600/40 text-emerald-100 border-emerald-400 shadow' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}"
          on:click={() => switchTab('login')}
          disabled={activeTab === 'login'}
        >
          Login
        </button>
        <button
          class="px-6 py-2 rounded-full border transition font-semibold focus:outline-none text-base disabled:opacity-50 {activeTab === 'register' ? 'bg-emerald-600/40 text-emerald-100 border-emerald-400 shadow' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}"
          on:click={() => switchTab('register')}
          disabled={activeTab === 'register'}
        >
          Register
        </button>
      </div>
      <form 
        class="mt-8 space-y-6" 
        on:submit|preventDefault={handleSubmit}
        bind:this={formElement}
      >
        <div class="space-y-4">
          {#if activeTab === 'register'}
            <div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                on:input={handleUsernameInput}
                class="block w-full px-4 py-3 bg-black/30 text-white border border-white/10 rounded-lg placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Username"
              />
              {#if usernameError}
                <p class="mt-1 text-sm text-amber-300">{usernameError}</p>
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
                class="block w-full px-4 py-3 bg-black/30 text-white border border-white/10 rounded-lg placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
              class="block w-full px-4 py-3 bg-black/30 text-white border border-white/10 rounded-lg placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Email address"
            />
            {#if emailError}
              <p class="mt-1 text-sm text-amber-300">{emailError}</p>
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
              class="block w-full px-4 py-3 bg-black/30 text-white border border-white/10 rounded-lg placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Password"
            />
            {#if passwordError}
              <p class="mt-1 text-sm text-amber-300">{passwordError}</p>
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
            class="w-full flex justify-center py-3 px-4 border border-emerald-400 text-base font-semibold rounded-lg text-white bg-emerald-600/70 hover:bg-emerald-700 transition shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
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
              class="text-sm text-emerald-300 hover:text-white transition"
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