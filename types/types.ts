export interface TableauOperation {
  data: Fraction[][]
  pivot: {
    rowIndex: number
    columnIndex: number
  }
}

export interface Fraction {
  numerator: number
  denominator: number
}
