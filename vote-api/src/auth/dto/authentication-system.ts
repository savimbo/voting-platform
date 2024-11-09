
import { ValueTransformer } from 'typeorm';

export enum AuthenticationSystem {
    EmailAndPassword = "EmailAndPassword",  // ToDo
    Google = "Google"
}

const AuthenticationSystemToInt = {
    [AuthenticationSystem.EmailAndPassword]: 1,
    [AuthenticationSystem.Google]: 2,
  };
  
  const intToAuthenticationSystem = {
    1: AuthenticationSystem.EmailAndPassword,
    2: AuthenticationSystem.Google,
  };
  
// We create a typeorm transformer to store the enum AuthenticationSystem as integer in the database for optimizing the space
export const authenticationSystemTransformer: ValueTransformer = {
  to(value: AuthenticationSystem): number {
    return AuthenticationSystemToInt[value];
  },
  from(value: number): AuthenticationSystem {
    return intToAuthenticationSystem[value];
  },
};