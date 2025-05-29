import {expect} from '@playwright/test';

export class customers {
    readonly baseUrl: string;
    readonly request: any;

    constructor(request: object) {
        this.request = request;
        this.baseUrl = process.env.url
    }

    async checkEmailCanRegister(email: string) {
        const account = await this.request.post(this.baseUrl + 'rest/default/V1/customers/isEmailAvailable', {
            data: {
                customerEmail: email
            }
        });
        expect(account.ok()).toBeTruthy();
        const responseBody = await account.json();
        return responseBody; // false means it exists! (ie, email is not available for register)
    }


}
