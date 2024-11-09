import { Test, TestingModule } from '@nestjs/testing';
import { SavimboUid } from 'util/savimbo-uids';


const uidPairs : { uid: string, decoded: string }[] = [
  // v1: month as 2 decimal digits and random number as 5 digits
  { uid: "66Hx4RZUopJF", decoded: "49131125082480395" },
  { uid: "66Hx4RZUkZe5", decoded: "49131125082413244" },
  { uid: "38XmZWFa6sVk", decoded: "14151125082489876" },
  { uid: "5KCPPNZQjqJy", decoded: "43151125082431240" },
  { uid: "8AQmog8VTjnt", decoded: "76041825082408217" },
  // v2: month as 1 hex digit and random number as 6 digits
  { uid: "7rHDN9wJo29R", decoded: "61411331824295577" },
  { uid: "7uUbtJk2efJr", decoded: "62411331824731023" },
  { uid: "7EsJvvGPoweb", decoded: "65411331824729550" },
  { uid: "65dSYGcMwu3",  decoded: "01461331824771850" },
  // V2 with random number calculated with 6 hexadecimal digits
  { uid: "6xYoYmBXZHPb", decoded: "51521912A241AFA57"},
  { uid: "6BaUDWqgG7Sn", decoded: "52521912A24ECC428"},
  { uid: "6EmrkxdwaQcX", decoded: "53521912A2458A173"},
  { uid: "6LHtFHN4GQ8r", decoded: "55521912A24330F32"},
  { uid: "6PTZnjAkHsXr", decoded: "56521912A249752FB"}
];

describe('Savimbo-uids', () => {

  beforeEach(async () => {

  });

  it.skip('Print some numbers', async () => {
    for (let i = 0; i < 5; i++) {
      const date = (SavimboUid as any).getEncodedDate();
      const rand = (SavimboUid as any).getRandomNumber(); 
      const uid = (SavimboUid as any).encodeHexNumberString(date + rand);  // access to private method
      console.log(`date: ${date}, rand: ${rand}, uid: ${uid}`);
      await new Promise(resolve => setTimeout(resolve, 700));  // sleep(700)
    }
  });

  it('The random numbers have 6 digits', () => {
    for (let i = 0; i < 1000; i++) {
      const u1 = (SavimboUid as any).getRandomNumber();  // access to private method
      expect(u1.length).toBe(6);
    }
  });

  it('Date have 11 digits', () => {
    for (let i = 0; i < 1000; i++) {
      const u1 = (SavimboUid as any).getEncodedDate();  // access to private method
      expect(u1.length).toBe(11);
    }
  });

  it('Expected encoding', () => {
    for (let i = 0; i < uidPairs.length; i++) {
      const uid = (SavimboUid as any).encodeHexNumberString(uidPairs[i].decoded);
      const decoded = SavimboUid.decodeSavimboUid(uidPairs[i].uid);
      expect(uid).toBe(uidPairs[i].uid);
      expect(decoded).toBe(uidPairs[i].decoded);
    }
  });

  it('Creates reversible UIDs', () => {
    for (let i = 0; i < 1000; i++) {
      const date = (SavimboUid as any).getEncodedDate();
      const rand = (SavimboUid as any).getRandomNumber(); 
      const uid = (SavimboUid as any).encodeHexNumberString(date + rand);  // access to private method
      expect(uid.length).toBeGreaterThan(5); // not sure will the min value would be, but I reckon it will be more than 5
      const decoded = SavimboUid.decodeSavimboUid(uid); 
      expect(decoded).toBe(date + rand);
      //console.log(`date: ${date}, rand: ${rand}, uid: ${uid}, decoded: ${decoded}`);
    }
  });

  

});
