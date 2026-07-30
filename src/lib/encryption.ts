import Cryptr from "cryptr";
import { envSchem } from "@/config/envSchema";

const cryptr = new Cryptr(envSchem.ENCRYPTION_KEY);

export const encrypt = (text: string) => cryptr.encrypt(text);
export const decrypt = (text: string) => cryptr.decrypt(text);
