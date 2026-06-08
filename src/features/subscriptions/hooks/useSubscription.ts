import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/authClient";

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data } = await authClient.customer.state();
      return data;
    },
  });
};

export const useHasActivePROSubscription = () => {
  const { data: customerState, isLoading, ...rest } = useSubscription();

  const hasActivePROSubscription =
    customerState?.activeSubscriptions &&
    customerState.activeSubscriptions.length > 0;

  return {
    hasActivePROSubscription,
    subscription: customerState?.activeSubscriptions?.[0],
    isLoading,
    ...rest,
  };
};
