import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  dataset: z.string().min(1),
  issue: z.object({
    column: z.string(), severity: z.string(), message: z.string(), failed: z.number(), total: z.number(), evidence: z.record(z.any()).optional(),
  }),
  analysis: z.object({
    rowCount: z.number(), columnCount: z.number(), score: z.number(), schemaHash: z.string(), volumeDelta: z.number().optional(), columns: z.array(z.any()),
  }),
});

const DEFAULT_BASE_URL = 'https://router.huggingface.co/v1';
const DEFAULT_MODEL = 'openai/gpt-oss-120b:fastest';

function deterministic(input: z.infer<typeof schema>) {
  return { headline: `${input.issue.column} quality degradation`, cause: 'The available evidence confirms a quality failure but does not prove the upstream cause.', evidence: [`${input.issue.failed.toLocaleString()} of ${input.issue.total.toLocaleString()} rows fail the ${input.issue.column} check.`, `Dataset quality score is ${input.analysis.score}%.`, input.analysis.volumeDelta === undefined ? 'No previous run is available for volume correlation.' : `Row volume changed ${(input.analysis.volumeDelta * 100).toFixed(1)}% from the previous run.`], nextSteps: ['Compare the current source schema with the previous successful run.', 'Inspect failed records in the source system.', 'Check deployments or mapping changes near the ingestion timestamp.'], confidence: 'Evidence-limited' };
}

function parseModelJson(content: string) {
  const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  try { return JSON.parse(cleaned); } catch { return { headline: 'AI investigation', cause: cleaned, evidence: [], nextSteps: ['Validate the model explanation against source and pipeline evidence.'], confidence: 'Unknown' }; }
}

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());
    const token = process.env.HF_TOKEN;
    if (!token) return NextResponse.json({ mode: 'deterministic', investigation: deterministic(input) });

    const baseUrl = (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
    const model = process.env.AI_MODEL || DEFAULT_MODEL;
    const prompt = ['You are DataGuard AI, a production data reliability investigator.', 'Analyze ONLY the supplied structured metadata. Never invent an upstream cause.', 'Distinguish observed evidence from hypotheses. If evidence is insufficient, say so.', 'Return ONLY valid JSON with exactly these fields: headline, cause, evidence, nextSteps, confidence.', 'evidence and nextSteps must be arrays of concise strings.', `Dataset: ${input.dataset}`, `Issue: ${JSON.stringify(input.issue)}`, `Analysis: ${JSON.stringify(input.analysis)}`].join('\n');

    const response = await fetch(`${baseUrl}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ model, messages: [{ role: 'system', content: 'Return valid JSON only. Do not include markdown fences.' }, { role: 'user', content: prompt }], temperature: 0.1 }), cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ mode: 'deterministic', fallback: true, providerError: `Hugging Face returned ${response.status}`, investigation: deterministic(input) });
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) return NextResponse.json({ mode: 'deterministic', fallback: true, investigation: deterministic(input) });
    return NextResponse.json({ mode: 'model', investigation: parseModelJson(content), model });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Investigation failed' }, { status: 400 });
  }
}
