
import { AuthenticationSystem } from "auth/dto/authentication-system";
import { CreateUserRequest } from "users/dto/create-user.input";


export const sampleUsers: CreateUserRequest[] = [
    {
      authenticationBy: AuthenticationSystem.Google,
      legalFirstName: "Jonny",
      legalLastName: "Lopez",
      email: "jonny.lopez@savimbo.com",
      lang: "eng",
      password: "",
      token: ""
    },
    {
      authenticationBy: AuthenticationSystem.Google,
      legalFirstName: "Carlos",
      legalLastName: "Fernández",
      email: "c.fernandez@savimbo.com",
      lang: "spa",
      password: "",
      token: ""
    },
    {
      authenticationBy: AuthenticationSystem.Google,
      legalFirstName: "Andrew G.",
      legalLastName: "Martin",
      email: "andrew.martin@savimbo.com",
      lang: "eng",
      password: "",
      token: ""
    },
    {
      authenticationBy: AuthenticationSystem.Google,
      legalFirstName: "Grace G.",
      legalLastName: "Thompson",
      email: "grace.thompson@savimbo.com",
      lang: "eng",
      password: "",
      token: ""
    },
    {
      authenticationBy: AuthenticationSystem.Google,
      legalFirstName: "Daniel G.",
      legalLastName: "Garcia",
      email: "daniel.garcia@savimbo.com",
      lang: "eng",
      password: "",
      token: ""
    },
    {
        authenticationBy: AuthenticationSystem.Google,
        legalFirstName: "Anna C.",
        legalLastName: "Schmidt",
        email: "anna.schmidt@savimbo.com",
        lang: "eng",
        password: "",
        token: ""
    },
    {
        authenticationBy: AuthenticationSystem.Google,
        legalFirstName: "Peter C.",
        legalLastName: "Schneider",
        email: "peter.schneider@savimbo.com",
        lang: "eng",
        password: "",
        token: ""
    },
    {
        authenticationBy: AuthenticationSystem.Google,
        legalFirstName: "Klara C.",
        legalLastName: "Fischer",
        email: "klara.fischer@savimbo.com",
        lang: "eng",
        password: "",
        token: ""
    },
    {
        authenticationBy: AuthenticationSystem.Google,
        legalFirstName: "Lukas C.",
        legalLastName: "Weber",
        email: "lukas.weber@savimbo.com",
        lang: "eng",
        password: "",
        token: ""
    },
    {
        authenticationBy: AuthenticationSystem.Google,
        legalFirstName: "Sophie C.",
        legalLastName: "Meyer",
        email: "sophie.meyer@savimbo.com",
        lang: "eng",
        password: "",
        token: ""
    },
   
    ];
    