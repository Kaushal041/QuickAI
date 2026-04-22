
import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();
    const hashPremiumPlan = await has({ plan: 'premium' });
    const user = await clerkClient.users.getUser(userId);
    if (!hashPremiumPlan && user.privateMetadata.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: 0 }
      });
      req.free_usage = 0;
    }
    req.plan = hashPremiumPlan ? 'premium' : 'free';
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