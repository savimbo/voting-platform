import { AuthTokenPayload } from "auth/model/token-payload";


export function IsEmptyString(str:string) : boolean {
    if (str === "" || str === null || str === undefined)
      return true;
    else
      return false;
  }

