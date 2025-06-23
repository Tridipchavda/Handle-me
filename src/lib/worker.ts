import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { sendEventNotification } from '../utils/mailer'; // adjust path as needed

const connection = new Redis({
  maxRetriesPerRequest: null, // ✅ this fixes the error
});

const worker = new Worker(
  'event-notify-queue',
  async (job) => {
      const { to, eventName, notifyBeforeMinutes } = job.data;
      console.log(to,eventName,notifyBeforeMinutes)
    await sendEventNotification({
      to,
      subject: `Reminder: ${eventName} is coming up!`,
      text: `Your event "${eventName}" is starting in ${notifyBeforeMinutes} minutes.`,
    });
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`✅ Email sent for job ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});