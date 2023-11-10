import { expect, request } from '@playwright/test';

export class mailhog {
  readonly baseUrl: string;
  readonly request: any;

  constructor( request : object ) {
    this.request = request;
    this.baseUrl = process.env.mailcatcher;
  }

  async getEmailByToAndSubject( to: string, subject: string ) {
    const emails = await this.request.get(this.baseUrl + 'api/v2/search?kind=to&query='+to);
    expect(emails.ok()).toBeTruthy();
    const responseBody = await emails.json();
    let matched = [];
    responseBody.items.forEach(email => {
        if(email.Content.Headers.Subject[0] == subject) {
            this.deleteEmailById(email.ID);
            matched.push(email);
        }
    });
    return matched.length;
  }

  async deleteEmailById( id: number ) {
    await this.request.delete(this.baseUrl + 'api/v1/messages/'+id);
  }

  async deleteAll() {
    await this.request.delete(this.baseUrl + 'api/v1/messages');
  }



}
