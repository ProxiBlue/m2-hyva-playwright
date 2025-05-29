/**
 * Utility functions for price operations
 */

/**
 * Parses a price string by removing all non-numeric characters except decimal point and minus sign
 * @param price The price string to parse (e.g., "$123.45" or "€123,45")
 * @returns The parsed price as a number
 */
export const parsePrice = function (price: string): number {
    return parseFloat(price.replace(/[^0-9-.]+/g, ""));
}
