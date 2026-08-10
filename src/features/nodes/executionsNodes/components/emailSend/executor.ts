import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { emailSendChannel } from "@/inngest/channels/executions/emailSend";

type EmailSendData = {
  variableName?: string;
  credentialId?: string;
  to?: string;
  subject?: string;
  body?: string;
  bodyType?: "text" | "html";
};

type SmtpConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
};

export const EmailSendExecutor: NodeExecutor<EmailSendData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    emailSendChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (
    !data.credentialId ||
    !data.to ||
    !data.subject ||
    !data.body ||
    !data.variableName
  ) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      emailSendChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw new NonRetriableError(
      "EMAIL_SEND: Missing credential, recipient, subject, body, or variable name",
    );
  }

  try {
    const result = await step.run(`email-send-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: { id: data.credentialId, userId },
      });

      if (!credential) {
        throw new NonRetriableError(
          "EMAIL_SEND: Credential not found or not owned by this user",
        );
      }

      let smtpConfig: SmtpConfig;
      try {
        smtpConfig = JSON.parse(decrypt(credential.value)) as SmtpConfig;
      } catch {
        throw new NonRetriableError(
          "EMAIL_SEND: Invalid SMTP credential configuration",
        );
      }

      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password,
        },
      });

      const to = Handlebars.compile(data.to!)(context);
      const subject = Handlebars.compile(data.subject!)(context);
      const bodyContent = Handlebars.compile(data.body!)(context);

      const info = await transporter.sendMail({
        from: smtpConfig.username,
        to,
        subject,
        ...(data.bodyType === "html"
          ? { html: bodyContent }
          : { text: bodyContent }),
      });

      return {
        ...context,
        [data.variableName!]: [
          {
            messageId: info.messageId,
            accepted: info.accepted,
          },
        ],
      };
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      emailSendChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      emailSendChannel.status,
      {
        nodeId,
        status: "error",
        error: message,
      },
    );
    throw error;
  }
};
