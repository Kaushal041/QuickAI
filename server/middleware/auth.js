
import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const { userId } = await req.auth();

    // In development allow a quick bypass when testing without real Clerk users.
    if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-bypass'] === 'true') {
      console.log('auth middleware: dev-bypass detected for userId', userId);
      req.plan = req.plan || 'premium';
      req.free_usage = req.free_usage ?? 0;
      return next();
    }

    console.log('auth middleware: fetching Clerk user for', userId);

    const user = await clerkClient.users.getUser(userId);

    let subscription = null;
    try {
      subscription = await clerkClient.billing.getUserBillingSubscription(userId);
    } catch {
      subscription = null;
    }

    const isPremium = subscription?.status === 'active';

    if (!isPremium && user.privateMetadata.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else {
      if (user.privateMetadata.free_usage !== 0) {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: { free_usage: 0 }
        });
      }
      req.free_usage = 0;
    }

    req.plan = isPremium ? 'premium' : 'free';
    req.subscription = subscription;
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};






// import { clerkClient } from "@clerk/express";

// export const auth = async (req, res, next) => {
//   try {
//     const { userId } = req.auth();

//     const user = await clerkClient.users.getUser(userId);

//     const plan = user.privateMetadata?.plan || "free";
//     const free_usage = user.privateMetadata?.free_usage || 0;

//     req.plan = plan;
//     req.free_usage = free_usage;

//     console.log("PLAN:", plan);

//     next();
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };