
import { Decimal } from "decimal.js";
import { numberOfDecimals } from "./currency";

export function distributeAmount(amount: string, currency: string, nParts: number): { quotient: string, remainder: string} {
    const numDecimals = numberOfDecimals(currency);

    let amountNum = new Decimal(amount);
    if (numDecimals !== 3) {  // amounts are stored with 3 digits, nothing to fix
        amountNum = amountNum.toDecimalPlaces(numDecimals, Decimal.ROUND_FLOOR) // let's drop the extra decimals
    }
    return doDistribute(amountNum, numDecimals, nParts);
}

export function distributeDecimalAmount(amount: Decimal, currency: string, nParts: number): { quotient: string, remainder: string} {
    const numDecimals = numberOfDecimals(currency);

    let amountNum = amount;
    if (numDecimals !== 3) {  // amounts are stored with 3 digits, nothing to fix
        amountNum = amount.toDecimalPlaces(numDecimals, Decimal.ROUND_FLOOR) // let's drop the extra decimals
    }
    return doDistribute(amountNum, numDecimals, nParts);
}

function doDistribute(amountNum: Decimal, numDecimals: number, nParts: number) : { quotient: string, remainder: string} {
    let cocienteNum = amountNum.div(nParts);
    cocienteNum = cocienteNum.toDecimalPlaces(numDecimals, Decimal.ROUND_FLOOR) // let's keep the significant digits
    let restoNum = amountNum.sub(cocienteNum.times(nParts));

    return { quotient: cocienteNum.toFixed(numDecimals), remainder: restoNum.toFixed(numDecimals) };
}

export function amountToMinorUnits(amount: string, currency: string): number {
    const numDecimals = numberOfDecimals(currency);
    let amountNum = new Decimal(amount);
    for (let i = 0; i < numDecimals; i++) {
        amountNum = amountNum.times(10);
    }
    return amountNum.toNumber();
}