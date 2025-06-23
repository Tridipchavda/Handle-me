export type Event = {
    id: string;
    name: string;
    venue: string;
    eventDate: string;
    eventTime: string;
    duration: number;
    shouldNotify: boolean;
    notifyBeforeMinutes: number;
  }