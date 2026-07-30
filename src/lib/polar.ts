import { Polar } from "@polar-sh/sdk";
import { envSchem } from "@/config/envSchema";

export const polarClient = new Polar({
    accessToken: envSchem.POLAR_ACCESS_TOKEN,
    server: envSchem.POLAR_SERVER === "production" ? undefined : "sandbox",
});
