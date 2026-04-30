import { apiClient } from '@/lib/api-client';

export const webauthnService = {
  /**
   * Start registration process
   */
  startRegistration: async (userId: string) => {
    // 1. Get options from server
    const optionsRes = await apiClient.post<any>('/auth/webauthn/register/options', { userId });
    const options = optionsRes.data;

    // 2. Adjust options for Web Browser API
    options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
    options.user.id = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0));
    if (options.excludeCredentials) {
      options.excludeCredentials = options.excludeCredentials.map((c: any) => ({
        ...c,
        id: Uint8Array.from(atob(c.id), c => c.charCodeAt(0))
      }));
    }

    // 3. Create credential
    const credential = await navigator.credentials.create({
      publicKey: options
    }) as any;

    // 4. Send response back to server
    const response = {
      id: credential.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      type: credential.type,
      response: {
        attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject))),
        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
      },
    };

    return apiClient.post('/auth/webauthn/register/verify', response);
  },

  /**
   * Start authentication process (Sign-off)
   */
  authenticate: async (userId: string) => {
    // 1. Get options from server
    const optionsRes = await apiClient.post<any>('/auth/webauthn/login/options', { userId });
    const options = optionsRes.data;

    // 2. Adjust options for Web Browser API
    options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    if (options.allowCredentials) {
      options.allowCredentials = options.allowCredentials.map((c: any) => ({
        ...c,
        id: Uint8Array.from(atob(c.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
      }));
    }

    // 3. Get assertion
    const assertion = await navigator.credentials.get({
      publicKey: options
    }) as any;

    // 4. Send response back to server
    const response = {
      id: assertion.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
      type: assertion.type,
      response: {
        authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData))),
        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON))),
        signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature))),
        userHandle: assertion.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(assertion.response.userHandle))) : null,
      },
    };

    return apiClient.post('/auth/webauthn/login/verify', response);
  }
};
