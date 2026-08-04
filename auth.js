// ===========================================
// TYNWALD — Signup / Login logic
// Sends real requests to the backend (see config.js for the API URL),
// stores the returned JWT in localStorage, and redirects into the app.
// Signup is now two steps: request a code (sent to email), then verify
// it to actually create the account. Login is unchanged.
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
  const tabSignup = document.getElementById('tabSignup');
  const tabLogin = document.getElementById('tabLogin');
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const verifyForm = document.getElementById('verifyForm');
  const forgotRequestForm = document.getElementById('forgotRequestForm');
  const forgotResetForm = document.getElementById('forgotResetForm');
  const authError = document.getElementById('authError');

  // Holds the details from step 1 so step 2 (verify) and "Resend code"
  // can re-submit them without asking the user to type everything again.
  let pendingSignup = null;

  // Holds the email between forgot-password step 1 (request code) and
  // step 2 (enter code + new password), same idea as pendingSignup above.
  let pendingResetEmail = null;

  // ----- Tab switching (Sign Up <-> Log In) -----
  function showSignup() {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    verifyForm.classList.add('hidden');
    forgotRequestForm.classList.add('hidden');
    forgotResetForm.classList.add('hidden');
    hideError();
  }

  function showLogin() {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    verifyForm.classList.add('hidden');
    forgotRequestForm.classList.add('hidden');
    forgotResetForm.classList.add('hidden');
    hideError();
  }

  function showVerify(email) {
    signupForm.classList.add('hidden');
    loginForm.classList.add('hidden');
    verifyForm.classList.remove('hidden');
    forgotRequestForm.classList.add('hidden');
    forgotResetForm.classList.add('hidden');
    document.getElementById('verifyEmailDisplay').textContent = email;
    document.getElementById('verifyCode').value = '';
    document.getElementById('verifyCode').focus();
    hideError();
  }

  function showForgotRequest() {
    signupForm.classList.add('hidden');
    loginForm.classList.add('hidden');
    verifyForm.classList.add('hidden');
    forgotResetForm.classList.add('hidden');
    forgotRequestForm.classList.remove('hidden');
    hideError();
  }

  function showForgotReset(email) {
    signupForm.classList.add('hidden');
    loginForm.classList.add('hidden');
    verifyForm.classList.add('hidden');
    forgotRequestForm.classList.add('hidden');
    forgotResetForm.classList.remove('hidden');
    document.getElementById('forgotEmailDisplay').textContent = email;
    document.getElementById('forgotCode').value = '';
    document.getElementById('forgotCode').focus();
    hideError();
  }

  tabSignup.addEventListener('click', showSignup);
  tabLogin.addEventListener('click', showLogin);

  // ----- Show/hide password toggles -----
  document.querySelectorAll('.password-toggle[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetInput = document.getElementById(button.getAttribute('data-target'));
      const isHidden = targetInput.type === 'password';

      targetInput.type = isHidden ? 'text' : 'password';
      button.textContent = isHidden ? 'Hide' : 'Show';
      button.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });

  // ----- Error message helpers -----
  function showError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
  }

  function hideError() {
    authError.classList.add('hidden');
  }

  // ----- Shared helper: save the session and go to the app -----
  function saveSessionAndRedirect(data) {
    // localStorage persists across browser restarts, unlike sessionStorage.
    // We store the token (for authenticated requests) and basic user info
    // (so pages can show "Hi, Amara" without a separate request).
    localStorage.setItem('tynwald_token', data.token);
    localStorage.setItem('tynwald_user', JSON.stringify(data.user));
    window.location.href = 'index.html';
  }

  // ----- Step 1: request a verification code -----
  async function requestSignupCode() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingSignup),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Something went wrong sending your code.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Request code failed:', err);
      showError('Could not reach the server. Is the backend running?');
      return false;
    }
  }

  // ----- Signup form submit (step 1: send the code) -----
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    pendingSignup = { name, email, password, role };

    const submitButton = document.getElementById('signupSubmit');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending code...';

    const sent = await requestSignupCode();

    submitButton.disabled = false;
    submitButton.textContent = 'Open my file';

    if (sent) {
      showVerify(email);
    }
  });

  // ----- Verify form submit (step 2: enter the code, create the account) -----
  verifyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    if (!pendingSignup) {
      showError('Your signup details expired — please start again.');
      showSignup();
      return;
    }

    const code = document.getElementById('verifyCode').value.trim();
    const submitButton = document.getElementById('verifySubmit');
    submitButton.disabled = true;
    submitButton.textContent = 'Verifying...';

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingSignup.email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Invalid or expired code.');
        return;
      }

      pendingSignup = null;
      saveSessionAndRedirect(data);
    } catch (err) {
      console.error('Verify code failed:', err);
      showError('Could not reach the server. Is the backend running?');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Verify & open my file';
    }
  });

  // ----- Back to the signup form -----
  document.getElementById('verifyBack').addEventListener('click', () => {
    showSignup();
  });

  // ----- Resend the code -----
  document.getElementById('verifyResend').addEventListener('click', async () => {
    if (!pendingSignup) {
      showSignup();
      return;
    }

    const resendBtn = document.getElementById('verifyResend');
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';

    const sent = await requestSignupCode();

    resendBtn.disabled = false;
    resendBtn.textContent = 'Resend code';

    if (sent) {
      hideError();
    }
  });

  // ----- Login form submit -----
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const submitButton = document.getElementById('loginSubmit');
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Invalid email or password.');
        return;
      }

      saveSessionAndRedirect(data);
    } catch (err) {
      console.error('Login request failed:', err);
      showError('Could not reach the server. Is the backend running?');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Log in';
    }
  });

  // ----- Show the forgot-password panel -----
  document.getElementById('showForgotPassword').addEventListener('click', () => {
    showForgotRequest();
  });

  document.getElementById('forgotRequestBack').addEventListener('click', () => {
    showLogin();
  });

  document.getElementById('forgotResetBack').addEventListener('click', () => {
    showForgotRequest();
  });

  // ----- Forgot password step 1: request a code -----
  async function requestPasswordResetCode(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Something went wrong sending your code.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Request reset code failed:', err);
      showError('Could not reach the server. Is the backend running?');
      return false;
    }
  }

  forgotRequestForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    const email = document.getElementById('forgotEmail').value.trim();
    pendingResetEmail = email;

    const submitButton = document.getElementById('forgotRequestSubmit');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    const sent = await requestPasswordResetCode(email);

    submitButton.disabled = false;
    submitButton.textContent = 'Send reset code';

    if (sent) {
      showForgotReset(email);
    }
  });

  // ----- Resend the reset code -----
  document.getElementById('forgotResendCode').addEventListener('click', async () => {
    if (!pendingResetEmail) {
      showForgotRequest();
      return;
    }

    const resendBtn = document.getElementById('forgotResendCode');
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';

    const sent = await requestPasswordResetCode(pendingResetEmail);

    resendBtn.disabled = false;
    resendBtn.textContent = 'Resend code';

    if (sent) {
      hideError();
    }
  });

  // ----- Forgot password step 2: submit code + new password -----
  forgotResetForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    if (!pendingResetEmail) {
      showError('Your reset session expired — please start again.');
      showForgotRequest();
      return;
    }

    const code = document.getElementById('forgotCode').value.trim();
    const newPassword = document.getElementById('forgotNewPassword').value;

    const submitButton = document.getElementById('forgotResetSubmit');
    submitButton.disabled = true;
    submitButton.textContent = 'Resetting...';

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingResetEmail, code, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Invalid or expired code.');
        return;
      }

      pendingResetEmail = null;
      saveSessionAndRedirect(data);
    } catch (err) {
      console.error('Reset password failed:', err);
      showError('Could not reach the server. Is the backend running?');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Reset password & log in';
    }
  });
});