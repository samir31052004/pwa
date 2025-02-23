<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to MyBus</h2>
        <p class="mt-2 text-center text-sm text-gray-600">Enter your credentials to access your account</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              v-model="email"
              required
              autocomplete="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              :class="{ 'border-red-500': emailError }"
              @input="clearErrors"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              v-model="password"
              required
              autocomplete="current-password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              :class="{ 'border-red-500': passwordError }"
              @input="clearErrors"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center" role="alert">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>

        <div class="text-center mt-4">
          <router-link
            to="/register"
            class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Don't have an account? Create one
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { signInDriver } from '@/services/SupabaseService';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const emailError = ref(false);
const passwordError = ref(false);

const isFormValid = computed(() => {
  return email.value.length > 0 && password.value.length >= 6;
});

const clearErrors = () => {
  error.value = '';
  emailError.value = false;
  passwordError.value = false;
};

const validateForm = () => {
  let isValid = true;
  clearErrors();

  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = true;
    error.value = 'Please enter a valid email address';
    isValid = false;
  }

  if (!password.value || password.value.length < 6) {
    passwordError.value = true;
    error.value = error.value || 'Password must be at least 6 characters';
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';

  try {
    const { session, driver } = await signInDriver(email.value, password.value);
    
    if (session && driver) {
      localStorage.setItem('driver-session', JSON.stringify(session));
      localStorage.setItem('driver-info', JSON.stringify(driver));
      router.push({ name: 'dashboard' });
    } else {
      throw new Error('Authentication failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    
    if (err.code === 'INVALID_EMAIL') {
      emailError.value = true;
      error.value = 'Please enter a valid email address';
    } else if (err.code === 'INVALID_PASSWORD') {
      passwordError.value = true;
      error.value = 'Password must be at least 6 characters';
    } else if (err.code === 'INVALID_CREDENTIALS') {
      error.value = 'Invalid email or password. Please try again';
    } else if (err.code === 'DRIVER_NOT_FOUND') {
      emailError.value = true;
      error.value = 'Driver not found. Please check your email address';
    } else if (err.code === 'EMAIL_NOT_CONFIRMED') {
      error.value = 'Please check your email and confirm your account before signing in';
    } else {
      error.value = 'An error occurred during sign in. Please try again';
    }
  } finally {
    loading.value = false;
  }
};
</script>
