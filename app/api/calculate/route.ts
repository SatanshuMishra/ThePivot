import {
  FractionOperations,
  fractionTableToString,
  fractionToString,
} from '@/lib/utils'
import { TableaOperation, Fraction } from '@/types/types'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body: TableaOperation = await req.json()
  const { data, parameterIndices, basicIndices, pivot } = body

  // TODO: Server-side input validation or more complex validation
  if (!data) {
    return new NextResponse('Data is required', { status: 400 })
  }

  if (!parameterIndices) {
    return new NextResponse('Parameter indices are required', { status: 400 })
  }

  if (!basicIndices) {
    return new NextResponse('Basis indices are required', { status: 400 })
  }

  if (!pivot) {
    return new NextResponse('Pivot is required', { status: 400 })
  }

  fractionTableToString(data)
  console.log(`Pivoting: ${pivot.fromIndex + 1} |-> ${pivot.toIndex + 1}`)

  const dimX = data[0].length
  const dimY = data.length
  var factor: Fraction
  const oneFraction = {
    numerator: 1,
    denominator: 1,
  }
  const negativeOneFraction = {
    numerator: -1,
    denominator: 1,
  }

  // // Locate row where 1 exists
  var operationRow = -1
  for (var i = 0; i < dimY; i++) {
    if (
      data[i][pivot.fromIndex].numerator /
        data[i][pivot.fromIndex].denominator ==
      1
    ) {
      operationRow = i
      break
    }
  }

  if (operationRow == -1) {
    return new NextResponse('Invalid data', { status: 400 })
  }

  // Do first row operation to set toIndex value to 1
  factor = FractionOperations.divideFractions(
    oneFraction,
    data[operationRow][pivot.toIndex],
  )

  for (var i = 0; i < dimX; i++) {
    data[operationRow][i] = FractionOperations.multiplyFractions(
      data[operationRow][i],
      factor,
    )
  }

  // Do remaining row operation to set column of toIndex to 0
  for (var i = 0; i < dimY; i++) {
    if (i == operationRow) {
      continue
    }
    factor = FractionOperations.multiplyFractions(
      data[i][pivot.toIndex],
      negativeOneFraction,
    )

    for (var j = 0; j < dimX; j++) {
      const temp = FractionOperations.multiplyFractions(
        data[operationRow][j],
        factor,
      )
      const temp2 = FractionOperations.addFractions(data[i][j], temp)
      data[i][j] = FractionOperations.addFractions(data[i][j], temp)
    }
  }

  fractionTableToString(data)

  return NextResponse.json({})
}
