export class AiActionItemDto {
  description: string;
  assignee?: string;
  deadline?: string;
  status?: string;
}

export class AiResultDto {
  summary: string;
  discussionPoints: string[];
  actionItems: AiActionItemDto[];
  attendees: string[];
}
