import { Webhook } from 'standardwebhooks';
import { clerkClient } from '@clerk/express';

const premiumAliases = (process.env.PREMIUM_PLAN_ALIASES || 'premium,pro')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

function findPlanValue(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (premiumAliases.includes(normalized)) {
      return 'premium';
    }
    if (['free', 'trial', 'inactive', 'canceled', 'cancelled'].includes(normalized)) {
      return 'free';
    }
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const plan = findPlanValue(item);
      if (plan) return plan;
    }
    return null;
  }

  if (typeof value === 'object') {
    for (const entry of Object.values(value)) {
      const plan = findPlanValue(entry);
      if (plan) return plan;
    }
  }

  return null;
}

function resolvePlanFromEvent(eventData) {
  const directPlanCandidates = [
    eventData?.private_metadata?.plan,
    eventData?.public_metadata?.plan,
    eventData?.unsafe_metadata?.plan,
    eventData?.privateMetadata?.plan,
    eventData?.publicMetadata?.plan,
    eventData?.unsafeMetadata?.plan,
    eventData?.plan,
    eventData?.subscription?.plan,
    eventData?.subscription?.status,
    eventData?.billing?.status,
    eventData?.status,
  ];

  for (const candidate of directPlanCandidates) {
    const plan = findPlanValue(candidate);
    if (plan) return plan;
  }

  return findPlanValue(eventData);
}

function resolveUserIdFromEvent(eventData) {
  if (!eventData || typeof eventData !== 'object') {
    return null;
  }

  const directCandidates = [
    eventData.user_id,
    eventData.userId,
    eventData.clerk_user_id,
    eventData.owner_id,
    eventData.account_id,
    eventData.data?.user_id,
    eventData.data?.userId,
    eventData.user?.id,
    eventData.data?.user?.id,
    eventData.data?.id,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.startsWith('user_')) {
      return candidate;
    }
  }

  for (const value of Object.values(eventData)) {
    if (typeof value === 'string' && value.startsWith('user_')) {
      return value;
    }

    if (typeof value === 'object' && value) {
      const nestedUserId = resolveUserIdFromEvent(value);
      if (nestedUserId) {
        return nestedUserId;
      }
    }
  }

  return null;
}

export const handleClerkWebhook = async (req, res) => {
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!signingSecret) {
      return res.status(500).json({ success: false, message: 'Missing CLERK_WEBHOOK_SIGNING_SECRET' });
    }

    const webhook = new Webhook(signingSecret);
    const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
    const headers = Object.fromEntries(
      Object.entries(req.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)])
    );

    const event = webhook.verify(payload, headers);
    const eventType = event?.type || '';
    const eventUserId = resolveUserIdFromEvent(event?.data);

    const plan = resolvePlanFromEvent(event?.data);

    if (eventUserId && plan) {
      await clerkClient.users.updateUserMetadata(eventUserId, {
        privateMetadata: {
          plan,
          free_usage: plan === 'premium' ? 0 : 0,
        },
      });
    }

    return res.json({ success: true, received: eventType, plan: plan || 'unknown' });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};