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
      '{ "summary": string, "discussionPoints": string[], "actionItems": ' +
      '[{ "description": string, "assignee": string|null, "deadline": string|null, ' +
      '"status": "OPEN"|"IN_PROGRESS"|"DONE" }] }. No text outside the JSON.';

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          format: 'json',
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
            assignee: a?.assignee ?? undefined,
            deadline: a?.deadline ?? undefined,
            status: a?.status ?? 'OPEN',
          }))
        : [],
    };
  }
}
