const WEEK = 7 * 24 * 60 * 60 * 1000;
// Auth timestamps come from getUser(), never editable user_metadata or the browser.
export function accessFor(user, isOwner, now = Date.now()) {
  if (isOwner) return { plan: 'owner', active: true, trialEndsAt: null };
  const start = Date.parse(user.created_at);
  const end = start + WEEK;
  return { plan: 'trial', active: Boolean(user.email_confirmed_at) && Number.isFinite(end) && now < end,
    trialEndsAt: Number.isFinite(end) ? new Date(end).toISOString() : null };
}
export function validateSignup(input) {
  if (!input || typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.email.length > 254)
    throw Object.assign(new Error('Enter a valid email address.'), { status: 400 });
  if (typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 128)
    throw Object.assign(new Error('Use a password between 12 and 128 characters.'), { status: 400 });
  return { email: input.email.trim(), password: input.password };
}
