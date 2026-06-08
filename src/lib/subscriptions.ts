import { polarClient } from "@/lib/polar";

export async function hasProSubscription(userId: string) {
  try {
    const customer = await polarClient.customers.getStateExternal({
      externalId: userId,
    });

    return (
      customer.activeSubscriptions?.some(
        (sub) =>
          sub.status === "active" &&
          sub.productId === process.env.POLAR_PRO_PRODUCT_ID,
      ) ?? false
    );
  } catch {
    return false;
  }
}
