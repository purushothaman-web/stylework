import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/app';
import { prisma } from '../src/config/db';

describe('Lead Tracker Backend Integration Tests', () => {
  let server: Server;
  let baseUrl: string;
  const testPrefix = `test-${Date.now()}`;

  before(async () => {
    // Clean up any old test records
    await prisma.lead.deleteMany({
      where: { email: { contains: 'test-' } },
    });

    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as AddressInfo).port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Clean up test records created during the run
    await prisma.lead.deleteMany({
      where: { email: { contains: 'test-' } },
    });

    await prisma.$disconnect();

    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('1. Health & Root Info Routes', () => {
    it('GET /health returns 200 and status ok', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'ok');
      assert.equal(typeof body.uptime, 'number');
    });

    it('GET / returns 200 API information', async () => {
      const res = await fetch(`${baseUrl}/`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.name, 'Lead Tracker API');
    });

    it('GET /api/unknown-route returns 404', async () => {
      const res = await fetch(`${baseUrl}/api/unknown-route`);
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.message, 'Route not found');
    });
  });

  describe('2. POST /api/leads (Create Lead)', () => {
    it('successfully creates a new lead with status NEW', async () => {
      const payload = {
        name: 'Alice Johnson',
        email: `${testPrefix}-alice@example.com`,
        phone: '+1 555-0199',
      };

      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.name, payload.name);
      assert.equal(body.data.email, payload.email.toLowerCase());
      assert.equal(body.data.phone, payload.phone);
      assert.equal(body.data.status, 'NEW');
      assert.ok(body.data.id);
    });

    it('returns 400 when name is missing or empty', async () => {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '   ',
          email: `${testPrefix}-noname@example.com`,
          phone: '1234567890',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Name is required/);
    });

    it('returns 400 when email format is invalid', async () => {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Invalid Email User',
          email: 'not-an-email',
          phone: '1234567890',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /valid email/i);
    });

    it('returns 400 when phone number is too short', async () => {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Short Phone User',
          email: `${testPrefix}-shortphone@example.com`,
          phone: '123',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /phone number/i);
    });

    it('returns 400 when phone number contains alphabetic characters (e.g. 9123456780f)', async () => {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Alpha Phone User',
          email: `${testPrefix}-alphaphone@example.com`,
          phone: '9123456780f',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /alphabetic/i);
    });

    it('returns 400 when name contains numbers or special characters', async () => {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '<script>alert(1)</script>',
          email: `${testPrefix}-xss@example.com`,
          phone: '+1 555-0123',
        }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /letters, spaces, hyphens/i);
    });

    it('returns 409 Conflict when creating a lead with a duplicate email', async () => {
      const payload = {
        name: 'Duplicate Lead',
        email: `${testPrefix}-duplicate@example.com`,
        phone: '+1 555-4321',
      };

      // First creation should succeed
      const firstRes = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.equal(firstRes.status, 201);

      // Second creation with identical email should fail with 409
      const secondRes = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      assert.equal(secondRes.status, 409);
      const body = await secondRes.json();
      assert.equal(body.success, false);
      assert.match(body.message, /already exists/i);
    });
  });

  describe('3. GET /api/leads (List, Search & Filter)', () => {
    let leadAId: string;
    let leadBId: string;

    before(async () => {
      // Create two distinct test leads
      const resA = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Connor',
          email: `${testPrefix}-sarah@cyberdyne.org`,
          phone: '+1 310-555-0100',
        }),
      });
      const dataA = await resA.json();
      leadAId = dataA.data.id;

      const resB = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Kyle Reese',
          email: `${testPrefix}-kyle@resistance.net`,
          phone: '+1 310-555-0199',
        }),
      });
      const dataB = await resB.json();
      leadBId = dataB.data.id;

      // Update lead B to QUALIFIED status
      await fetch(`${baseUrl}/api/leads/${leadBId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'QUALIFIED' }),
      });
    });

    it('returns all leads with count and 200 status', async () => {
      const res = await fetch(`${baseUrl}/api/leads`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(typeof body.count, 'number');
      assert.ok(Array.isArray(body.data));
      assert.ok(body.count >= 2);
    });

    it('filters leads by search term matching name', async () => {
      const res = await fetch(`${baseUrl}/api/leads?search=Connor`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.some((l: { id: string }) => l.id === leadAId));
      assert.ok(!body.data.some((l: { id: string }) => l.id === leadBId));
    });

    it('filters leads by search term matching email', async () => {
      const res = await fetch(`${baseUrl}/api/leads?search=cyberdyne.org`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.some((l: { id: string }) => l.id === leadAId));
    });

    it('filters leads by search term matching phone', async () => {
      const res = await fetch(`${baseUrl}/api/leads?search=0199`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.some((l: { id: string }) => l.id === leadBId));
    });

    it('filters leads by status', async () => {
      const res = await fetch(`${baseUrl}/api/leads?status=QUALIFIED`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.every((l: { status: string }) => l.status === 'QUALIFIED'));
      assert.ok(body.data.some((l: { id: string }) => l.id === leadBId));
      assert.ok(!body.data.some((l: { id: string }) => l.id === leadAId));
    });

    it('returns 400 when an invalid status query parameter is passed', async () => {
      const res = await fetch(`${baseUrl}/api/leads?status=BOGUS_STATUS`);
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Invalid status filter/i);
    });
  });

  describe('4. GET /api/leads/:id (Get Lead By ID)', () => {
    let createdLeadId: string;

    before(async () => {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Connor',
          email: `${testPrefix}-john@future.org`,
          phone: '+1 555-9999',
        }),
      });
      const data = await res.json();
      createdLeadId = data.data.id;
    });

    it('returns the lead details for an existing ID', async () => {
      const res = await fetch(`${baseUrl}/api/leads/${createdLeadId}`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.id, createdLeadId);
      assert.equal(body.data.name, 'John Connor');
    });

    it('returns 404 for a non-existent lead UUID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await fetch(`${baseUrl}/api/leads/${nonExistentId}`);
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Lead not found/i);
    });
  });

  describe('5. PATCH /api/leads/:id/status (Update Lead Status)', () => {
    let leadId: string;

    before(async () => {
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Status Test User',
          email: `${testPrefix}-statustest@example.com`,
          phone: '+1 555-7777',
        }),
      });
      const data = await res.json();
      leadId = data.data.id;
    });

    it('updates lead status to CONTACTED', async () => {
      const res = await fetch(`${baseUrl}/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONTACTED' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'CONTACTED');
    });

    it('updates lead status to WON', async () => {
      const res = await fetch(`${baseUrl}/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'WON' }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.status, 'WON');
    });

    it('returns 400 when updating with an invalid status enum', async () => {
      const res = await fetch(`${baseUrl}/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'INVALID_ENUM' }),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Invalid status/i);
    });

    it('returns 404 when updating status of non-existent lead', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await fetch(`${baseUrl}/api/leads/${nonExistentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'LOST' }),
      });

      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Lead not found/i);
    });
  });
});
