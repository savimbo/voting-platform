import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from 'decimal.js';
import { distributeAmount, distributeDecimalAmount } from 'money/model/money_arithmetics';

describe('Decimaljs-Use', () => {

  beforeEach(async () => {

  });

  const checkDistribution = (amountString: string, currency: string, divisor: number, part:string, remainderExp: string) => {
    const { quotient, remainder } = distributeAmount(amountString, currency, divisor);

    expect(remainder).toBe(remainderExp);
    expect(quotient).toBe(part);

    let amountNum = new Decimal(amountString);
    let cocienteNum = new Decimal(quotient);
    let restoNum = new Decimal(remainder);
    const proof = cocienteNum.times(divisor).plus(restoNum);

    expect(proof.equals(amountNum)).toBe(true);
    expect(proof.toFixed(3)).toBe(amountNum.toFixed(3));
  }

  const checkDistributionDecimal = (amountNum: Decimal, currency: string, divisor: number, part:string, remainderExp: string) => {
    const { quotient, remainder } = distributeDecimalAmount(amountNum, currency, divisor);

    expect(remainder).toBe(remainderExp);
    expect(quotient).toBe(part);

    let cocienteNum = new Decimal(quotient);
    let restoNum = new Decimal(remainder);
    const proof = cocienteNum.times(divisor).plus(restoNum);

    expect(proof.equals(amountNum)).toBe(true);
    expect(proof.toFixed(3)).toBe(amountNum.toFixed(3));
  }

  it('We didnt loose money after dividing it - string', () => {
    checkDistribution('52.15', 'USD', 3, '17.38', '0.01');
    checkDistribution('52.15', 'USD', 2, '26.07', '0.01');
    checkDistribution('3152.35', 'USD', 3, '1050.78', '0.01');   
    checkDistribution('3152.36', 'USD', 3, '1050.78', '0.02');   
    checkDistribution('10', 'JPY', 15, '0', '10');   
    checkDistribution('1', 'USD', 102, '0.00', '1.00');   
  });

  it('We didnt loose money after dividing it - decimal', () => {
    checkDistributionDecimal(new Decimal('52.15'), 'USD', 3, '17.38', '0.01');
    checkDistributionDecimal(new Decimal('52.15'), 'USD', 2, '26.07', '0.01');
    checkDistributionDecimal(new Decimal('3152.35'), 'USD', 3, '1050.78', '0.01');   
    checkDistributionDecimal(new Decimal('3152.36'), 'USD', 3, '1050.78', '0.02');   
    checkDistributionDecimal(new Decimal('10'), 'JPY', 15, '0', '10');   
    checkDistributionDecimal(new Decimal('1'), 'USD', 102, '0.00', '1.00');   
  });

});  



describe('Decimaljs-internals', () => {

  beforeEach(async () => {

  });

  it ('Zero means zero', () => {
    let zero = new Decimal(0);
    expect(zero.isZero()).toBe(true);
    zero = new Decimal("0.00");
    expect(zero.isZero()).toBe(true);
    zero = new Decimal("0");
    expect(zero.isZero()).toBe(true);
    zero = new Decimal(".0");
    expect(zero.isZero()).toBe(true);

  });

});