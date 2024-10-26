import { allFakers } from '@faker-js/faker';
import {CustomerData} from '@common/interfaces/CustomerData';


/**
 * Country is excluded as it does not adhere to locale.
 * If you need to put / set country, it needs to be a separate action in your tests
 *
 * @param locale
 */
export async function createCustomerData(locale: string = "en_US"): Promise<CustomerData> {
    // @ts-ignore
    const stateMap: { [key: string]: string } = {
        NSW: "New South Wales",
        ACT: "Australian Capital Territory",
        VIC: "Victoria",
        QLD: "Queensland",
        SA: "South Australia",
        WA: "Western Australia",
        TAS: "Tasmania",
        NT: "Northern Territory"
    };
    const fakerLocale = allFakers[locale];
    fakerLocale.rawDefinitions.location.postcode_by_state = {
        NSW: [
            '{{number.int({"min": 2000,"max": 2599})}}',
            '{{number.int({"min": 2619,"max": 2899})}}'
        ],
        ACT: [
            '{{number.int({"min": 2600,"max": 2618})}}',
            '{{number.int({"min": 2900,"max": 2920})}}'
        ],
        VIC: [
            '{{number.int({"min": 3000,"max": 3999})}}',
            '{{number.int({"min": 8000,"max": 8999})}}'
        ],
        QLD: [
            '{{number.int({"min": 4000,"max": 4999})}}',
            '{{number.int({"min": 9000,"max": 9999})}}'
        ],
        SA: [
            '{{number.int({"min": 5000,"max": 5799})}}',
            '{{number.int({"min": 5800,"max": 5999})}}'
        ],
        WA: [
            '{{number.int({"min": 6000,"max": 6797})}}',
            '{{number.int({"min": 6800,"max": 6999})}}'
        ],
        TAS: [
            '{{number.int({"min": 7000,"max": 7799})}}',
            '{{number.int({"min": 7800,"max": 7999})}}'
        ],
        NT: [
            '{{number.int({"min": 0800,"max": 0899})}}',
            '{{number.int({"min": 0900,"max": 0999})}}'
        ]
    }
    let firstname = fakerLocale.person.firstName();
    let lastname = fakerLocale.person.lastName();
    let email = fakerLocale.internet.email({firstName: firstname, lastName: lastname});
    let state = fakerLocale.location.state( {abbreviated: true});
    return {
        firstName: firstname,
        lastName: lastname,
        email: email,
        password: fakerLocale.internet.password({length: 20, memorable: true, pattern: /[A-Z0-9]/, prefix: '@-1'}),
        street_one_line: fakerLocale.location.streetAddress(),
        state: stateMap[state],
        city: fakerLocale.location.city(),
        zip: fakerLocale.location.zipCode({
            state: state
        }),
        state_code: fakerLocale.location.state({abbreviated: true}),
        phone: fakerLocale.phone.number()
    };
}


