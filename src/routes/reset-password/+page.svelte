<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let step: 'email' | 'verify' | 'reset' = 'email';
    let email = '';
    let uniqueInfo = '';
    let newPassword = '';
    let confirmPassword = '';
    let error = '';
    let successMessage = '';
    let loading = false;

    // Validation states
    let emailError = '';
    let passwordError = '';
    let confirmPasswordError = '';
    let passwordStrength = 0;

    // Validation patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = {
        minLength: 8,
        hasUpperCase: /[A-Z]/,
        hasLowerCase: /[a-z]/,
        hasNumber: /[0-9]/,
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
    };

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

    function validateConfirmPassword(value: string): boolean {
        if (!value) {
            confirmPasswordError = 'Please confirm your password';
            return false;
        }
        if (value !== newPassword) {
            confirmPasswordError = 'Passwords do not match';
            return false;
        }
        confirmPasswordError = '';
        return true;
    }

    async function handleEmailSubmit() {
        if (!validateEmail(email)) return;

        loading = true;
        error = '';

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            step = 'verify';
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    async function handleResetSubmit() {
        if (!validatePassword(newPassword) || !validateConfirmPassword(confirmPassword)) return;

        loading = true;
        error = '';

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, uniqueInfo, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            successMessage = 'Password reset successful! Redirecting to login...';
            setTimeout(() => goto('/'), 2000);
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    function handleUniqueInfoSubmit() {
        if (!uniqueInfo) {
            error = 'Please enter your recovery information';
            return;
        }
        step = 'reset';
    }
</script>

<div style="background-image: url('/BG.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;" class=" min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-5 bg-white/95 p-8 rounded-lg shadow-2xl border border-gray-200">
        <h1 class="text-center text-3xl font-extrabold text-gray-900">
            Reset Password
        </h1>

        {#if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span class="block sm:inline">{error}</span>
            </div>
        {/if}

        {#if successMessage}
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span class="block sm:inline">{successMessage}</span>
            </div>
        {/if}

        {#if step === 'email'}
            <form on:submit|preventDefault={handleEmailSubmit} class="mt-8 space-y-6">
                <div>
                    <label for="email" class="sr-only">Email address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        bind:value={email}
                        class="appearance-none rounded relative block w-full px-3 py-2 border {emailError ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                    />
                    {#if emailError}
                        <p class="mt-1 text-sm text-red-600">{emailError}</p>
                    {/if}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {#if loading}
                            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        {/if}
                        Continue
                    </button>
                </div>
            </form>
        {:else if step === 'verify'}
            <form on:submit|preventDefault={handleUniqueInfoSubmit} class="mt-8 space-y-6">
                <div>
                    <label for="uniqueInfo" class="block text-sm font-medium text-gray-700">
                        Enter your recovery information
                    </label>
                    <input
                        id="uniqueInfo"
                        name="uniqueInfo"
                        type="text"
                        required
                        bind:value={uniqueInfo}
                        class="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Enter your recovery information"
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Verify
                    </button>
                </div>
            </form>
        {:else if step === 'reset'}
            <form on:submit|preventDefault={handleResetSubmit} class="mt-8 space-y-6">
                <div>
                    <label for="newPassword" class="block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        bind:value={newPassword}
                        class="mt-1 appearance-none rounded relative block w-full px-3 py-2 border {passwordError ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Enter new password"
                    />
                    {#if passwordError}
                        <p class="mt-1 text-sm text-red-600">{passwordError}</p>
                    {/if}
                    {#if newPassword}
                        <div class="mt-2">
                            <div class="flex space-x-2">
                                {#each Array(4) as _, i}
                                    <div class="flex-1 h-2 rounded-full {i < passwordStrength ? 'bg-green-500' : 'bg-gray-200'}"></div>
                                {/each}
                            </div>
                            <p class="mt-1 text-xs text-gray-500">
                                Password strength: {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || 'None'}
                            </p>
                        </div>
                    {/if}
                </div>

                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        bind:value={confirmPassword}
                        class="mt-1 appearance-none rounded relative block w-full px-3 py-2 border {confirmPasswordError ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Confirm new password"
                    />
                    {#if confirmPasswordError}
                        <p class="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
                    {/if}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {#if loading}
                            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        {/if}
                        Reset Password
                    </button>
                </div>
            </form>
        {/if}

        <div class="text-center mt-4">
            <a href="/" class="text-sm text-indigo-600 hover:text-indigo-500">
                Back to Login
            </a>
        </div>
    </div>
</div> 