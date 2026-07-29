import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiResultDto } from './dto/ai-result.dto';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('OLLAMA_BASE_URL') ?? 'http://localhost:11434';
    this.model = this.config.get<string>('OLLAMA_MODEL') ?? 'llama3.1';
  }

  async generateMeetingInsights(transcript: string): Promise<AiResultDto> {
    const systemPrompt =
      'You analyze meeting transcripts. Respond ONLY with a JSON object of this shape: ' +
      '{ "summary": string, "attendees": string[], "discussionPoints": string[], "actionItems": ' +
      '[{ "description": string, "details": string|null, "assignee": string|null, "deadline": string|null, ' +
      '"status": "OPEN"|"IN_PROGRESS"|"DONE" }] }. No text outside the JSON. ' +
      'The "description" field is a short title (under 10 words). The "details" field is 1-2 full ' +
      'sentences giving the fuller context of the task as discussed in the transcript, so someone ' +
      'returning to this item later understands what it involves without rereading the transcript. ' +
      'If there is nothing beyond the description worth adding, use null. ' +
      'For example, if the transcript says "Bob will finish the API integration by Friday, it needs ' +
      'to support the new payment gateway," the description should be "Finish API integration" and ' +
      'the details should be "Needs to support the new payment gateway." Only use null when the ' +
      'transcript gives no information beyond what is already in the description. ' +
      'The attendees field is required in every response, even for long transcripts with many ' +
      'action items: list the full name of every distinct person who spoke or was addressed, ' +
      'exactly as it appears (e.g. "John Smith"), with no duplicates. If the transcript states ' +
      "that person's role or title, include it in parentheses after the name, for example " +
      '"Maria (Program Manager)" or "Jordan (Backend Lead)". If no role is stated for a person, ' +
      'list just their name with no parentheses, for example "John Smith". Always use this ' +
      'parenthetical format for roles, never a colon or other separator. If no names are ' +
      'identifiable, use []. ' +
      'For the deadline field: if the transcript states an explicit calendar date ' +
      '(e.g. "2026-07-16" or "July 16"), output it as YYYY-MM-DD. If the transcript ' +
      'uses a relative or relative day reference (e.g. "wednesday", "next friday", ' +
      '"in 3 days"), output that phrase exactly as said, in lowercase, do not calculate ' +
      'or resolve it yourself. A deadline is often stated in a separate sentence from the task ' +
      'itself, for example "I can run the load tests. I will report results the following Monday" ' +
      'means the deadline for running the load tests is "the following monday", do not skip the ' +
      'deadline just because it is not in the same sentence as the task. If no deadline is ' +
      'mentioned anywhere for a task, use null. ' +
      'Deadlines are sometimes settled through a back-and-forth exchange rather than stated once: ' +
      'for example, if one person says "I can have it done by next Thursday," and another person ' +
      'then asks to confirm, "that\'s the 6th?", and the first person confirms, "correct, the 6th," ' +
      'then the deadline for that task is the confirmed explicit date, output as YYYY-MM-DD ' +
      '(e.g. "2026-08-06"), not left as null and not the original relative phrase. Always use the ' +
      'most specific, most recently confirmed version of a deadline, even if reaching it takes ' +
      'several exchanges between different speakers. ' +
      'Before responding, re-read the transcript once more and verify that every task discussed, ' +
      'every deadline mentioned, and every distinct topic covered has been included in your response. ' +
      'Do not omit an action item, a deadline, or a discussion point that is explicitly stated in the ' +
      'transcript, even if the transcript is long or covers many topics.';
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          format: 'json',
          options: { temperature: 0.2 },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Transcript:\n${transcript}` },
          ],
        }),
      });
    } catch (err) {
      this.logger.error(`Cannot reach Ollama at ${this.baseUrl}`, err as Error);
      throw new ServiceUnavailableException('AI service is unreachable');
    }

    if (!response.ok) {
      this.logger.error(`Ollama returned ${response.status}`);
      throw new ServiceUnavailableException('AI service returned an error');
    }

    const data = (await response.json()) as { message?: { content?: string } };
    const content = data.message?.content;
    if (!content) throw new ServiceUnavailableException('AI service returned an empty response');

    return this.parseResult(content);
  }

  private parseResult(content: string): AiResultDto {
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      this.logger.error(`AI response was not valid JSON: ${content}`);
      throw new ServiceUnavailableException('AI service returned malformed data');
    }

    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      discussionPoints: Array.isArray(parsed.discussionPoints)
        ? parsed.discussionPoints.filter((p: unknown) => typeof p === 'string')
        : [],
      actionItems: Array.isArray(parsed.actionItems)
        ? parsed.actionItems.map((a: any) => ({
            description: String(a?.description ?? ''),
            details:
              typeof a?.details === 'string' && a.details.trim() !== '' ? a.details : undefined,
            assignee: a?.assignee ?? undefined,
            deadline: a?.deadline ?? undefined,
            status: a?.status ?? 'OPEN',
          }))
        : [],
      attendees: Array.isArray(parsed.attendees)
        ? parsed.attendees.filter(
            (a: unknown): a is string => typeof a === 'string' && a.trim() !== '',
          )
        : [],
    };
  }
}
