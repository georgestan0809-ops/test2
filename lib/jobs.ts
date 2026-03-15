import { ReminderChannel } from '@prisma/client';
import PgBoss from 'pg-boss';

let boss: PgBoss | null = null;

export const REMINDER_JOB_NAME = 'send-reminder';

export type ReminderJobPayload = {
  reminderId: string;
  firmId: string;
};

export const getBoss = async () => {
  if (!boss) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required to initialize background jobs.');
    }

    boss = new PgBoss({
      connectionString,
      schema: process.env.PG_BOSS_SCHEMA ?? 'public',
      monitorStateIntervalSeconds: 0
    });
    await boss.start();
  }

  return boss;
};

export const dispatchReminder = async ({ channel, companyName, title, message }: { channel: ReminderChannel; companyName: string; title: string; message: string }) => {
  if (channel === 'IN_APP') {
    return;
  }

  // Placeholder transport implementation for demo environments.
  // In production, wire this to SES/Mailgun/Twilio adapters.
  console.log(`[MOCK DELIVERY] ${channel} :: ${companyName} :: ${title} :: ${message}`);
};
