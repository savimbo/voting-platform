


// Class to generate neat UUIDs to be used as primery key in entities exposed by the API
// It uses the time (with a hack to convert seconds to 0..99) and a random 6 digit number

import { BadRequestException, ConflictException } from "@nestjs/common";
import { InsertResult, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IsEmptyString } from "./basic-utils";
import c from "config";

// The classes should be prepared to manage the posibility of collision, but the probability is very low
export class SavimboUid {

    static CUSTOM_BASE62_ALPHABET = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"; // Removed '0', 'O', 'l', 'I', '1' to avoid confusion
    static BASE = BigInt(this.CUSTOM_BASE62_ALPHABET.length);

    //#region Public methods

    static generate(): string {
        const uid = this.getEncodedDate() + this.getRandomNumber();
        const uidBase62 = this.encodeHexNumberString(uid);
        return uidBase62;
    }

    static decodeSavimboUid(base62: string): string {
        const decimalValue = this.base62ToDecimal(base62);
        return this.decimalToHex(decimalValue);
    }

    //#region Private methods
    private static getRandomNumber(): string {  
        const rand = Math.floor(Math.random() * 16777215);  // random number between 0 and FFFFFF (random is always lower than 1)
        return rand.toString(16).toUpperCase().padStart(6, '0');
    }

    private static getEncodedDate(): string {
        const now = new Date();

        const year = now.getFullYear() - 2000;
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        // transform seconds fro 0..59 to 0..99
        const floatSeconds = now.getSeconds() + (now.getMilliseconds() / 1000);
        const centiSeconds = floatSeconds * (100 / 60);
        const seconds = Math.floor(centiSeconds);

        const ret : string =    seconds.toString().padStart(2, '0') +
                                minutes.toString().padStart(2, '0') +
                                hours.toString().padStart(2, '0') +
                                day.toString().padStart(2, '0') +
                                //month.toString().padStart(2, '0') +
                                month.toString(16).toUpperCase() +
                                year.toString();
        return ret;                         
    }

    // the string is expected to be a hex number
    private static encodeHexNumberString(input: string): string {
        //let num = BigInt("0x" + Buffer.from(input).toString('hex'));
        let num = BigInt("0x" + input);
        let base62Str = '';

        // Convert the BigInt to the custom Base62
        while (num > 0) {
            const remainder = num % this.BASE;
            base62Str = this.CUSTOM_BASE62_ALPHABET[Number(remainder)] + base62Str;
            num = num / this.BASE;
        }
        return base62Str || '0'; 
    }

    // Any string. The result will be probably longer than the input. Not used for generating UIDs
    private static encodeString(input: string): string {
        let num = BigInt("0x" + Buffer.from(input).toString('hex'));
        let base62Str = '';

        // Convert the BigInt to the custom Base62
        while (num > 0) {
            const remainder = num % this.BASE;
            base62Str = this.CUSTOM_BASE62_ALPHABET[Number(remainder)] + base62Str;
            num = num / this.BASE;
        }
        return base62Str || '0'; 
    }

    private static  base62ToDecimal(base62: string): bigint {
        let decimal = BigInt(0);
        for (const char of base62) {
            const index = BigInt(this.CUSTOM_BASE62_ALPHABET.indexOf(char));
            if (index === BigInt(-1)) {
                throw new Error(`Character ${char} is not in the alphabet.`);
            }
            decimal = decimal * BigInt(this.BASE) + index;
        }
        return decimal;
    }

    private static decimalToHex(decimal: bigint): string {
        return decimal.toString(16).toUpperCase().padStart(17, '0');
    }

}    



