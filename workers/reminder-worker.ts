import { getBoss, REMINDER_JOB_NAME } from '../lib/jobs';
import { prisma } from '../lib/prisma';

const run = async () => {
  const boss = await getBoss();

  await boss.work(REMINDER_JOB_NAME, async (jobs) => {
    for (const job of jobs) {
      const payload = job.data as { reminderId?: string };
      if (!payload.reminderId) continue;

      await prisma.reminder.update({
        where: { id: payload.reminderId },
        data: { sentAt: new Date() }
      });

      console.log(`Reminder ${payload.reminderId} marked as sent.`);
    }
  });

  console.log('Reminder worker running...');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
