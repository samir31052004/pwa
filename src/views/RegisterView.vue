<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Driver Account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="first-name" class="sr-only">First Name</label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              v-model="firstName"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="First Name"
              :class="{ 'border-red-500': firstNameError }"
              @input="clearErrors"
            />
          </div>
          <div>
            <label for="last-name" class="sr-only">Last Name</label>
            <input
              id="last-name"
              name="lastName"
              type="text"
              v-model="lastName"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Last Name"
              :class="{ 'border-red-500': lastNameError }"
              @input="clearErrors"
            />
          </div>
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              v-model="email"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              :class="{ 'border-red-500': emailError }"
              @input="clearErrors"
            />
          </div>
          <div>
            <label for="phone" class="sr-only">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="text"
              v-model="phone"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Phone Number"
              :class="{ 'border-red-500': phoneError }"
              @input="clearErrors"
            />
          </div>
          <div>
            <label for="license" class="sr-only">Driver's License Number</label>
            <input
              id="license"
              name="license"
              type="text"
              v-model="license"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Driver's License Number"
              :class="{ 'border-red-500': licenseError }"
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
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              :class="{ 'border-red-500': passwordError }"
              @input="clearErrors"
            />
          </div>
          <div>
            <label for="confirm-password" class="sr-only"
              >Confirm Password</label
            >
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              v-model="confirmPassword"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Confirm Password"
              :class="{ 'border-red-500': passwordError }"
              @input="clearErrors"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </div>

        <div class="text-center">
          <router-link
            to="/login"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Already have an account? Sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { registerDriver } from "@/services/SupabaseService";

const router = useRouter();
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const phone = ref("");
const license = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const loading = ref(false);
const firstNameError = ref(false);
const lastNameError = ref(false);
const emailError = ref(false);
const phoneError = ref(false);
const licenseError = ref(false);
const passwordError = ref(false);

const clearErrors = () => {
  error.value = "";
  firstNameError.value = false;
  lastNameError.value = false;
  emailError.value = false;
  phoneError.value = false;
  licenseError.value = false;
  passwordError.value = false;
};

const validateForm = () => {
  let isValid = true;
  clearErrors();

  if (!firstName.value.trim()) {
    firstNameError.value = true;
    error.value = "First name is required";
    isValid = false;
  }

  if (!lastName.value.trim()) {
    lastNameError.value = true;
    error.value = error.value || "Last name is required";
    isValid = false;
  }

  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = true;
    error.value = error.value || "Please enter a valid email address";
    isValid = false;
  }

  if (!license.value || license.value.length < 5) {
    licenseError.value = true;
    error.value = error.value || "Please enter a valid driver's license number";
    isValid = false;
  }

  if (!password.value || password.value.length < 6) {
    passwordError.value = true;
    error.value = error.value || "Password must be at least 6 characters";
    isValid = false;
  }

  if (password.value !== confirmPassword.value) {
    passwordError.value = true;
    error.value = error.value || "Passwords do not match";
    isValid = false;
  }

  return isValid;
};

const isFormValid = computed(() => {
  return (
    firstName.value.trim().length > 0 &&
    lastName.value.trim().length > 0 &&
    email.value.length > 0 &&
    phone.value.length > 0 &&
    license.value.length > 0 &&
    password.value.length >= 6 &&
    password.value === confirmPassword.value
  );
});

const handleRegister = async () => {
  if (!validateForm()) return;

  error.value = "";
  loading.value = true;

  try {
    const { session, driver } = await registerDriver({
      name: `${firstName.value.trim()} ${lastName.value.trim()}`,
      email: email.value,
      licenseNumber: license.value,
      password: password.value,
    });

    if (session && driver) {
      localStorage.setItem('driver-session', JSON.stringify(session));
      router.push({ name: 'dashboard' });
    }
  } catch (err) {
    error.value = err.message || 'An error occurred during registration';
    if (err.code === 'DRIVER_EXISTS' || err.code === 'AUTH_USER_EXISTS') {
      emailError.value = true;
    }
  } finally {
    loading.value = false;
  }
};
</script>
