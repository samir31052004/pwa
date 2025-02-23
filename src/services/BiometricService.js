import { ref } from 'vue'

class BiometricService {
  constructor() {
    this.isAvailable = ref(false)
    this.checkAvailability()
  }

  async checkAvailability() {
    if (window.PublicKeyCredential) {
      try {
        this.isAvailable.value = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      } catch (error) {
        console.error('Error checking biometric availability:', error)
        this.isAvailable.value = false
      }
    }
  }

  async register(username) {
    if (!this.isAvailable.value) {
      throw new Error('Biometric authentication is not available on this device')
    }

    try {
      // Get challenge from server
      const challenge = await this.getRegistrationChallenge(username)
      
      const publicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from(challenge, c => c.charCodeAt(0)),
        rp: {
          name: 'My Bus App',
          id: window.location.hostname
        },
        user: {
          id: Uint8Array.from(username, c => c.charCodeAt(0)),
          name: username,
          displayName: username
        },
        pubKeyCredParams: [{
          type: 'public-key',
          alg: -7 // ES256
        }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      })

      // Send credential to server for verification
      return await this.verifyRegistration(credential)
    } catch (error) {
      console.error('Error during biometric registration:', error)
      throw new Error('Failed to register biometric credentials')
    }
  }

  async authenticate(username) {
    if (!this.isAvailable.value) {
      throw new Error('Biometric authentication is not available on this device')
    }

    try {
      // Get challenge from server
      const challenge = await this.getAuthenticationChallenge(username)

      const publicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from(challenge, c => c.charCodeAt(0)),
        rpId: window.location.hostname,
        userVerification: 'required',
        timeout: 60000
      }

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      })

      // Verify assertion with server
      return await this.verifyAssertion(assertion)
    } catch (error) {
      console.error('Error during biometric authentication:', error)
      throw new Error('Failed to authenticate using biometrics')
    }
  }

  // Server communication methods (to be implemented based on your backend)
  async getRegistrationChallenge(username) {
    // TODO: Implement API call to get registration challenge
    return 'dummy-challenge'
  }

  async verifyRegistration(credential) {
    // TODO: Implement API call to verify registration
    return true
  }

  async getAuthenticationChallenge(username) {
    // TODO: Implement API call to get authentication challenge
    return 'dummy-challenge'
  }

  async verifyAssertion(assertion) {
    // TODO: Implement API call to verify assertion
    return true
  }
}

export const biometricService = new BiometricService()