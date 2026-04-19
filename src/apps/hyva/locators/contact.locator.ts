// Scope to the main Helpdesk/contact form on the page. Some Magento installs
// (including LCD's Mage-OS + Helpdesk extension) render the on-page contact form
// with id="helpdesk-contacts-form" and also render an additional popup contact
// form (id="hdmx-popup-contact-form") on the SAME page. Selectors that only use
// [name=...] will resolve to multiple elements across both forms and cause
// ambiguous / stuck fills. The helpdesk form also uses a hidden honeypot input
// with name="email" — the real, visible email field is id="mail".
export const nameField = "#helpdesk-contacts-form #name, #contact-form [name='name']"
export const emailField = "#helpdesk-contacts-form #mail, #contact-form #email"
export const telephoneField = "#helpdesk-contacts-form #telephone, #contact-form #telephone"
export const subjectField = "#helpdesk-contacts-form #subject, #contact-form [name='subject']"
export const commentField = "#helpdesk-contacts-form #comment, #contact-form #comment"
export const submitButton = "#helpdesk-contacts-form button[type='submit'], #contact-form button[type='submit'][title='Submit']"
