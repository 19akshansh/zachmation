import { CredentialType } from "@/generated/prisma/enums";

export type CredentialTypeOption = {
  type: CredentialType;
  label: string;
  logo: string;
};

export const credentialTypeOptions: CredentialTypeOption[] = [
  {
    type: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/openai.svg",
  },
  {
    type: CredentialType.GEMINI,
    label: "GEMINI",
    logo: "/gemini.svg",
  },
  {
    type: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/anthropic.svg",
  },
  {
    type: CredentialType.HUGGING_FACE,
    label: "Hugging Face",
    logo: "/huggingface.svg",
  },
  {
    type: CredentialType.IMG_BB,
    label: "Image BB",
    logo: "/imgbb.png",
  },
  {
    type: CredentialType.TELEGRAM_BOT,
    label: "Telegram Bot",
    logo: "/telegram.svg",
  },
  {
    type: CredentialType.ZACHURL,
    label: "Zachurl",
    logo: "/zachurl.svg",
  },
  {
    type: CredentialType.ZACHCOURSE,
    label: "Zachcourse",
    logo: "/zachcourse.svg",
  },
  {
    type: CredentialType.SMTP,
    label: "SMTP",
    logo: "/smtp.svg",
  },
  {
    type: CredentialType.GOOGLE_SHEETS,
    label: "Google Sheets",
    logo: "/googleSheets.svg",
  },
  {
    type: CredentialType.POSTGRES,
    label: "Postgres",
    logo: "/postgres.svg",
  },
  {
    type: CredentialType.AIRTABLE,
    label: "Airtable",
    logo: "/airtable.svg",
  },
  {
    type: CredentialType.NOTION,
    label: "Notion",
    logo: "/notion.svg",
  },
  {
    type: CredentialType.GITHUB,
    label: "GitHub",
    logo: "/github.svg",
  },
];

export const CREDENTIAL_TYPE_OPTIONS = credentialTypeOptions;

export const credentialTypeMap = Object.fromEntries(
  credentialTypeOptions.map((option) => [option.type, option]),
) as Record<CredentialType, CredentialTypeOption>;

export const getCredentialTypeOption = (type: CredentialType) =>
  credentialTypeMap[type];

export const credentialLogos = Object.fromEntries(
  credentialTypeOptions.map((option) => [option.type, option.logo]),
) as Record<CredentialType, string>;