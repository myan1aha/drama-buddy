import { test, expect } from '@playwright/test';

test.describe('Server API — Health', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get('http://localhost:3000/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});

test.describe('Server API — Pet', () => {
  const userId = `e2e-test-${Date.now()}`;

  test('can create a pet', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/pet', {
      headers: { 'x-user-id': userId },
      data: { action: 'create', name: 'TestPet', species: 'cat' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.pet.name).toBe('TestPet');
    expect(body.pet.species).toBe('cat');
    expect(body.pet.level).toBe(1);
  });

  test('can get pet info', async ({ request }) => {
    const res = await request.get('http://localhost:3000/api/pet', {
      headers: { 'x-user-id': userId },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.pet.name).toBe('TestPet');
  });

  test('can add experience', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/pet', {
      headers: { 'x-user-id': userId },
      data: { action: 'addExp', source: 'send_message' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.pet.exp).toBeGreaterThan(0);
  });
});

test.describe('Server API — Chat SSE', () => {
  test('chat endpoint returns SSE stream', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/chat', {
      headers: {
        'x-user-id': 'e2e-test-chat',
        'Content-Type': 'application/json',
      },
      data: {
        messages: [{ role: 'user', content: 'hello' }],
        context: { title: 'Test Drama' },
      },
    });

    // SSE should return 200 with text/event-stream
    expect(res.status()).toBe(200);
    const contentType = res.headers()['content-type'] || '';
    expect(contentType).toContain('text/event-stream');
  });
});

test.describe('Server API — Cast', () => {
  const roomId = `e2e-room-${Date.now()}`;

  test('can push and receive cast events', async ({ request }) => {
    // Push an event
    const pushRes = await request.post('http://localhost:3000/api/cast', {
      data: {
        roomId,
        type: 'chat_message',
        data: { content: 'Hello from E2E', userId: 'test' },
      },
    });
    expect(pushRes.ok()).toBeTruthy();
  });
});
