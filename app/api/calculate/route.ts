import {
  FractionOperations,
  formatNumberOrFraction,
  fractionTableToString,
  fractionToString,
} from '@/lib/utils'
import { TableauOperation, Fraction } from '@/types/types'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body: TableauOperation = await req.json()
  const { data, pivot } = body

  // TODO: Server-side input validation or more complex validation
  if (!data) {
    return new NextResponse('Data is required', { status: 400 })
  }

  if (!pivot) {
    return new NextResponse('Pivot is required', { status: 400 })
  }

  fractionTableToString(data)

  const dimX = data.length
  const dimY = data[0].length
  var factor: Fraction
  const oneFraction = {
    numerator: 1,
    denominator: 1,
  }
  const negativeOneFraction = {
    numerator: -1,
    denominator: 1,
  }

  // Do first row operation to set toIndex value to 1
  factor = FractionOperations.divideFractions(
    oneFraction,
    data[pivot.rowIndex][pivot.columnIndex],
  )

  for (var i = 0; i < dimY; i++) {
    data[pivot.rowIndex][i] = FractionOperations.multiplyFractions(
      data[pivot.rowIndex][i],
      factor,
    )
  }

  // Do remaining row operation to set column of toIndex to 0
  for (var i = 0; i < dimX; i++) {
    if (i == pivot.rowIndex) {
      continue
    }
    factor = FractionOperations.multiplyFractions(
      data[i][pivot.columnIndex],
      negativeOneFraction,
    )

    for (var j = 0; j < dimY; j++) {
      const temp = FractionOperations.multiplyFractions(
        data[pivot.rowIndex][j],
        factor,
      )
      data[i][j] = FractionOperations.addFractions(data[i][j], temp)
    }
  }

  fractionTableToString(data)

  const parsedData = data.map((row) =>
    row.map((cell) => formatNumberOrFraction(cell)),
  )

  const result = {
    data: parsedData,
  }

  return NextResponse.json(result)
}
