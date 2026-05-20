import { NextRequest } from 'next/server';
import type { ChatRequest } from '@drama-buddy/shared';
import { buildSystemPrompt } from '@/lib/prompt-builder';
import { streamChat } from '@/lib/ai-client';
import { inferMoodFromMessage, addExp } from '@/lib/pet/engine';
import { getPet, savePet, appendChatMessage } from '@/lib/db';
import type { PetState } from '@drama-buddy/shared/pet';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body: ChatRequest = await req.json();
  const { messages, context } = body;

  const userId = req.headers.get('x-user-id') || 'anonymous';
  const systemPrompt = buildSystemPrompt(context);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chatMessages = messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

        // --- Pet: process user's last message ---
        const lastUserMsg = [...chatMessages].reverse().find((m) => m.role === 'user');
        const pet = getPet(userId);

        if (lastUserMsg && pet) {
          // Add EXP for sending message
          const expResult = addExp(pet, 'send_message');

          // Infer mood from message content
          const mood = inferMoodFromMessage(lastUserMsg.content);
          if (mood !== 'neutral') {
            expResult.pet.mood = mood;
          }
          expResult.pet.lastInteraction = Date.now();
          savePet(userId, expResult.pet);

          // Send pet update event
          const petEvent = {
            type: 'pet_update',
            data: {
              level: expResult.pet.level,
              stage: expResult.pet.stage,
              mood: expResult.pet.mood,
              exp: expResult.pet.exp,
              expToNext: expResult.pet.expToNext,
              leveledUp: expResult.leveledUp,
              evolved: expResult.evolved,
              newStage: expResult.newStage,
            },
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(petEvent)}\n\n`)
          );

          // Persist user message
          appendChatMessage({
            userId,
            role: 'user',
            content: lastUserMsg.content,
            dramaTitle: context.title,
            episode: context.episode,
          });
        }

        // --- Stream AI response ---
        let fullResponse = '';
        for await (const token of streamChat({
          systemPrompt,
          messages: chatMessages,
        })) {
          fullResponse += token;
          const event = `data: ${JSON.stringify({ type: 'token', data: token })}\n\n`;
          controller.enqueue(encoder.encode(event));
        }

        // --- Pet: add EXP for receiving reply ---
        const petAfter = getPet(userId);
        if (petAfter) {
          const replyResult = addExp(petAfter, 'receive_reply');
          savePet(userId, replyResult.pet);
        }

        // --- Persist assistant message ---
        if (fullResponse) {
          appendChatMessage({
            userId,
            role: 'assistant',
            content: fullResponse,
            dramaTitle: context.title,
            episode: context.episode,
          });
        }

        // --- Done ---
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'done', data: '', meta: { charCount: fullResponse.length } })}\n\n`
          )
        );
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Chat API Error]', msg);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', data: msg })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
    },
  });
}
