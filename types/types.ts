export interface TableaOperation extends Tablea {
  pivot: {
    fromIndex: number
    toIndex: number
  }
}

export interface Tablea {
  data: Fraction[][]
  parameterIndices: number[]
  basicIndices: number[]
}

export interface Fraction {
  numerator: number
  denominator: number
}
