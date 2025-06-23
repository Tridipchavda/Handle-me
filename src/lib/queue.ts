import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis();

export const notificationQueue = new Queue('event-notify-queue', {
  connection,
});