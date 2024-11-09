
export function numberOfDecimals(currency: string): number {
    const strCurrency = currency.toUpperCase();
    switch(strCurrency) {
        case 'USD':
        case 'EUR':
            return 2;
        case 'JPY':
            return 0;
        default:
            return 2;
    }
}