import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { amountToMinorUnits } from './model/money_arithmetics';


export interface PayoutResult {
    success: boolean;
    shortAnswer: string;
    longAnswer: string;
}

@Injectable()
export class StripeService {
    constructor() {}

    private readonly stripePayoutsAccount = 'sk_test_your_account'; // this is the account that will be used to pay out
    private stripe = new Stripe(this.stripePayoutsAccount, { apiVersion: "2024-09-30.acacia" });

    async payPayout(
            amount : string, currency: string, 
            recipient: string, 
            description: string, 
            payoutId: string, byUser: string, incomeId: string, recipient_id: string,
            transferGroup: string
            ) : Promise<PayoutResult> {

      let ok = false
      let shortAnswer = ""
      let longAnswer = ""

      try {
          const amountToTransfer: number = amountToMinorUnits(amount, currency);  // must be cents in stripe

          const transferData : Stripe.TransferCreateParams = {
            amount: amountToTransfer, // this shall be an integer number!
            currency: currency.toLowerCase(), 
            destination: recipient, // account
            description: description,
            metadata: { 'payoutId': payoutId, 'byUser': byUser, 'incomeId': incomeId, 'recipient_id': recipient_id },
            //transfer_group: transferGroup  // da error si lo pasamos vacio, hay que pasarlo o no pasarlo
          };
          const transferOptions : Stripe.RequestOptions = { // we can override also the sending account, api version....
              //  Specify the number of requests to retry in event of error.
              //  This overrides a default set on the Stripe object's config argument.
              //maxNetworkRetries?: number;
              //  Specify a timeout for this request in milliseconds.
              //timeout?: number;
              }

          const transfer = await this.stripe.transfers.create(transferData /*, transferOptions*/ );          
          ok = true;
          shortAnswer = transfer.id;
          longAnswer = JSON.stringify(transfer, Object.getOwnPropertyNames(transfer));
      } catch (error) {
          shortAnswer = "Error creating transfer"
          if (error instanceof Error) {
            shortAnswer = `${error.name}: ${error.message}`
          }
          longAnswer = JSON.stringify(error, Object.getOwnPropertyNames(error));
      }
      return { success: ok, shortAnswer: shortAnswer, longAnswer: longAnswer };
  }

}
