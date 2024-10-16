import { faker } from '@faker-js/faker/locale/en';
import { CustomerData } from '../interfaces/CustomerData';

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
    private readonly street_one_line: string;
    private readonly state: string;
    private readonly city: string;
    private readonly zip: string;
    private readonly state_code : string;
    private readonly country: string;
    private readonly phone: string;

    constructor() {
        this.firstName = faker.name.firstName();
        this.lastName = faker.name.lastName();
        this.email = this.firstName+'.'+this.lastName+'@example.com';
        this.password = '2RDMUjuGO7ojLYI%' // i want a known password for logging in myself to check things
        this.street_one_line = faker.address.streetAddress();
        this.state = faker.address.state();
        this.city = faker.address.city();
        this.zip = faker.address.zipCodeByState(this.state);
        this.state_code = faker.address.stateAbbr();
        this.country = faker.address.country();
        this.phone = faker.phone.number('555-#######');
    }

    getCustomerData(): CustomerData {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password,
            street_one_line: this.street_one_line,
            state: this.state,
            city: this.city,
            zip: this.zip,
            state_code: this.state_code,
            country: this.country,
            phone: this.phone
        };
    }



}
