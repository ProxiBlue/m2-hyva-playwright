import { faker } from '@faker-js/faker/locale/en';

export class Customer {
    /**
     * Sure, an anti-pattern, but rather than rolling all tests in one massive
     * test, I prefer to have a serial based test run that tests aspects of the
     * created user account
     * @private
     */
    private readonly firstName: string;
    private readonly lastName: string;
    private readonly email: string;
    private readonly password: string;

    constructor() {
        this.firstName = faker.name.firstName();
        this.lastName = faker.name.lastName();
        this.email = this.firstName+'.'+this.lastName+'@example.com';
        this.password = '2RDMUjuGO7ojLYI%' // i want a known password for logging in myself to check things
    }

    getFirstName()    {
        return this.firstName;
    }

    getLastName()    {
        return this.lastName;
    }

    getEmail()    {
        return this.email;
    }

    getPassword()    {
        return this.password;
    }


}
