import { expect, request } from '@playwright/test';

/**
 * Mailpit client (backwards-compatible with MailHog naming).
 *
 * Uses Mailpit v1 API: https://mailpit.axllent.org/docs/api-v1/
 * DDEV exposes Mailpit on localhost:8025 inside the container.
 */
export class mailhog {
  readonly baseUrl: string;
  readonly request: any;

  constructor( request : object ) {
    this.request = request;
    this.baseUrl = process.env.mailcatcher;
  }

  /**
   * Search for emails sent to `to` with a matching `subject`.
   * Returns the count of matched messages.
   */
  async getEmailByToAndSubject( to: string, subject: string ) {
    const searchQuery = encodeURIComponent(`to:${to} subject:${subject}`);
    const emails = await this.request.get(this.baseUrl + 'api/v1/search?query=' + searchQuery);
    expect(emails.ok()).toBeTruthy();
    const responseBody = await emails.json();
    const matched = responseBody.messages || [];
    for (const email of matched) {
      await this.deleteEmailById(email.ID);
    }
    return matched.length;
  }

  /**
   * Wait for an email matching `to` and `subject` to arrive within `timeoutMs`.
   * Polls every 2 seconds. Returns the count of matched messages.
   */
  async waitForEmail( to: string, subject: string, timeoutMs: number = 30000 ) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const searchQuery = encodeURIComponent(`to:${to} subject:${subject}`);
      const emails = await this.request.get(this.baseUrl + 'api/v1/search?query=' + searchQuery);
      if (emails.ok()) {
        const responseBody = await emails.json();
        const matched = responseBody.messages || [];
        if (matched.length > 0) {
          return matched.length;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return 0;
  }

  /**
   * Get full message content by ID (for body assertions).
   */
  async getEmailById( id: string ) {
    const response = await this.request.get(this.baseUrl + 'api/v1/message/' + id);
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  /**
   * Search and return full message objects (not just count).
   */
  async searchEmails( to: string, subject?: string ) {
    let query = `to:${to}`;
    if (subject) {
      query += ` subject:${subject}`;
    }
    const searchQuery = encodeURIComponent(query);
    const emails = await this.request.get(this.baseUrl + 'api/v1/search?query=' + searchQuery);
    expect(emails.ok()).toBeTruthy();
    const responseBody = await emails.json();
    return responseBody.messages || [];
  }

  async deleteEmailById( id: string ) {
    await this.request.delete(this.baseUrl + 'api/v1/messages', {
      data: { IDs: [id] },
    });
  }

  async deleteAll() {
    await this.request.delete(this.baseUrl + 'api/v1/messages');
  }
}
