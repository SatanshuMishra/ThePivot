import { Fraction } from '@/types/types'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export class FractionOperations {
  static addFractions(f1: Fraction, f2: Fraction) {
    const commonDenominator = f1.denominator * f2.denominator

    const numeratorSum =
      f1.numerator * f2.denominator + f2.numerator * f1.denominator

    return this.formatFraction({
      numerator: numeratorSum,
      denominator: commonDenominator,
    })
  }

  static multiplyFractions(f1: Fraction, f2: Fraction) {
    const result = {
      numerator: f1.numerator * f2.numerator,
      denominator: f1.denominator * f2.denominator,
    }
    return this.formatFraction(result)
  }

  static divideFractions(f1: Fraction, f2: Fraction) {
    const inverseF2 = this.getInverse(f2)
    return this.formatFraction(this.multiplyFractions(f1, inverseF2))
  }

  static getInverse(f: Fraction) {
    const result = {
      numerator: f.denominator,
      denominator: f.numerator,
    }
    return this.formatFraction(result)
  }

  static simplifyFraction(f: Fraction) {
    if (f.denominator === 0) {
      throw new Error('Denominator cannot be zero.')
    }

    const gcd = this.findGCD(f)

    return {
      numerator: f.numerator / gcd,
      denominator: f.denominator / gcd,
    }
  }

  static findGCD(f: Fraction): number {
    if (f.denominator === 0) {
      return f.numerator
    }
    return this.findGCD({
      numerator: f.denominator,
      denominator: f.numerator % f.denominator,
    })
  }

  static swapNegativeFractionFormat(f: Fraction) {
    if (f.numerator >= 0 && f.denominator < 0) {
      return {
        numerator: -f.numerator,
        denominator: -f.denominator,
      }
    } else {
      return {
        numerator: f.numerator,
        denominator: f.denominator,
      }
    }
  }

  static formatFraction(f: Fraction) {
    var formattedFraction = this.simplifyFraction(f)
    formattedFraction = this.swapNegativeFractionFormat(formattedFraction)

    return formattedFraction
  }
}

export function fractionTableToString(
  data: Fraction[][],
  columnSpacing: number = 5,
) {
  const maxColumnWidths = getMaxColumnWidths(data)

  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[0].length; j++) {
      const cell = formatCell(
        fractionToString(data[i][j]),
        maxColumnWidths[j] + columnSpacing,
      )
      process.stdout.write(cell)
    }
    process.stdout.write('\n')
  }
}

function getMaxColumnWidths(data: Fraction[][]) {
  const maxColumnWidths: number[] = []
  for (const row of data) {
    for (let j = 0; j < row.length; j++) {
      const value = fractionToString(row[j])
      maxColumnWidths[j] = Math.max(maxColumnWidths[j] || 0, value.length)
    }
  }
  return maxColumnWidths
}

function formatCell(value: string, maxWidth: number) {
  return value.padEnd(maxWidth)
}

export function fractionToString(f: Fraction) {
  if (f.numerator == 0) {
    return '(0)'
  }

  return `(${f.numerator}${f.denominator !== 1 ? '/' + f.denominator : ''})`
}

export function createEmptyStringArray(
  rows: number,
  columns: number,
): string[][] {
  return Array.from({ length: rows }, () => Array(columns).fill(''))
}

export function formatNumberOrFraction(f: Fraction) {
  if (f.denominator === 1) {
    // If the denominator is 1, it's a whole number
    return f.numerator.toString()
  } else {
    // Otherwise, it's a fraction
    return `${f.numerator}/${f.denominator}`
  }
}

export function isEmptyObject(obj: any) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false // Object has at least one property
    }
  }
  return true // Object is empty
}
