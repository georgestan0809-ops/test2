import PgBoss from 'pg-boss';

let boss: PgBoss | null = null;

export const getBoss = async () => {
  if (!boss) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required to initialize background jobs.');
    }

    boss = new PgBoss({
      connectionString,
      schema: 'public',
      monitorStateIntervalSeconds: 0
    });
    await boss.start();
  }

  return boss;
};

export const REMINDER_JOB_NAME = 'send-reminder';
