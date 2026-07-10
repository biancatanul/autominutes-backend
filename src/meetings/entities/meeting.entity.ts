export enum ProcessingStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class Meeting {
  id: string;
  title: string;
  datetime: Date;
  description?: string;
  processingStatus: ProcessingStatus;
  createdAt: Date;
  updatedAt: Date;
}
