import { dispatchReminder, getBoss, ReminderJobPayload, REMINDER_JOB_NAME } from '../lib/jobs';
import { prisma } from '../lib/prisma';

const run = async () => {
  const boss = await getBoss();

  await boss.work(REMINDER_JOB_NAME, async (jobs) => {
    for (const job of jobs) {
      const payload = job.data as Partial<ReminderJobPayload>;
      if (!payload.reminderId || !payload.firmId) {
        continue;
      }

      const reminder = await prisma.reminder.findFirst({
        where: {
          id: payload.reminderId,
          firmId: payload.firmId,
          sentAt: null
        },
        include: {
          company: {
            select: { legalName: true }
          }
        }
      });

      if (!reminder) {
        continue;
      }

      await dispatchReminder({
        channel: reminder.channel,
        companyName: reminder.company.legalName,
        title: reminder.title,
        message: reminder.message
      });

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
