'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { createEmptyStringArray, isEmptyObject } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const tableDataFormSchema = z.object({
  rows: z.coerce.number().int().min(2),
  columns: z.coerce.number().int().min(2),
})

const tableauFormSchema = z.object({
  data: z.array(
    z.array(
      z.string().refine(
        (value) => {
          return (
            /^-?\d+$/.test(value) ||
            (/^-?\d+\/\d+$/.test(value) &&
              value.split('/').map(Number)[1] !== 0)
          )
        },
        {
          message:
            'Invalid input. Please enter a valid number (positive or negative) or a fraction with a non-zero denominator.',
        },
      ),
    ),
  ),
})

type tableDataFormValues = z.infer<typeof tableDataFormSchema>
type tableauFormValues = z.infer<typeof tableauFormSchema>

const Home = () => {
  const [data, setData] = useState(createEmptyStringArray(2, 2))
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(true)

  const tableDataForm = useForm<tableDataFormValues>({
    resolver: zodResolver(tableDataFormSchema),
    defaultValues: {
      rows: 3,
      columns: 6,
    },
  })

  const tableauForm = useForm<tableauFormValues>({
    resolver: zodResolver(tableauFormSchema),
    defaultValues: {
      data: [
        ['2', '6', '1', '0', '0', '700'],
        ['4', '5', '0', '1', '0', '810'],
        ['-20', '10', '0', '0', '1', '0'],
      ],
    },
  })

  const parseNumberOrFraction = (str: string) => {
    if (/^-?\d+$/.test(str)) {
      // If the input is a whole number (positive or negative)
      return {
        numerator: parseInt(str, 10),
        denominator: 1,
      }
    } else if (/^-?\d+\/\d+$/.test(str)) {
      // If the input is a fraction (positive or negative)
      const [numerator, denominator] = str.split('/').map(Number)
      return {
        numerator,
        denominator,
      }
    } else {
      // Invalid input, you can handle this case as needed
      return null
    }
  }

  const handleGenericSubmitForm = async (
    e: any,
    form: any,
    submitFunction: any,
    message: string = 'Invalid data.',
  ) => {
    e.preventDefault()

    if (isEmptyObject(form.formState.errors)) {
      // Validation passed, proceed with form submission
      form.handleSubmit(submitFunction)(e)
    } else {
      toast.error(message)
    }
  }

  const onTableFormSubmit = async (formData: tableDataFormValues) => {
    try {
      setLoading(true)
      tableauForm.setValue(
        'data',
        createEmptyStringArray(formData.rows, formData.columns),
      )
    } catch (error) {
      toast.error('Something went wrong.')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const onTableauFormSubmit = async (formData: tableauFormValues) => {
    try {
      setLoading(true)
      setEditing(false)

      setData(formData.data as string[][])
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const onPivot = async (rowIndex: number, columnIndex: number) => {
    try {
      setLoading(true)
      const parsedData = data.map((row) =>
        row.map((cell) => parseNumberOrFraction(cell)),
      )

      const body = {
        data: parsedData,
        pivot: {
          rowIndex,
          columnIndex,
        },
      }

      const response: any = await axios.post(`/api/calculate`, body)
      setData(response.data.data)
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const onEdit = () => {
    tableauForm.setValue('data', data)
    setEditing(true)
  }

  const checkError = (rowIndex: number, columnIndex: number) => {
    if (
      tableauFormErrors &&
      tableauFormErrors[rowIndex] &&
      tableauFormErrors[rowIndex][columnIndex] &&
      tableauFormErrors[rowIndex][columnIndex].message
    ) {
      return true
    }
    return false
  }

  const tableauFormErrors: any = tableauForm.formState.errors.data

  return (
    <>
      <div className="p-3">
        <h1 className="text-3xl font-bold">The Pivot</h1>
      </div>
      <Separator className="mb-3" />
      <div className="m-auto flex w-fit max-w-screen-2xl flex-col gap-10">
        <Form {...tableDataForm}>
          <form
            onSubmit={(e) =>
              handleGenericSubmitForm(e, tableDataForm, onTableFormSubmit)
            }
            className="w-full space-y-8"
          >
            <div className="flex items-end justify-center gap-4">
              <FormField
                control={tableDataForm.control}
                name="rows"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rows</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Table rows"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tableDataForm.control}
                name="columns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Columns</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Table Columns"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={loading} className="" type="submit">
                Create Table
              </Button>
            </div>
          </form>
        </Form>
        {editing ? (
          <Form {...tableauForm}>
            <form
              onSubmit={(e) =>
                handleGenericSubmitForm(e, tableauForm, onTableauFormSubmit)
              }
              className="w-full pt-2"
            >
              <div className="flex w-full flex-col items-center justify-center">
                {Array.from(
                  { length: tableauForm.getValues('data').length },
                  (_, index) => index,
                ).map((rowIndex) => (
                  <div key={rowIndex} className="mb-4 flex gap-4">
                    {Array.from(
                      { length: tableauForm.getValues('data')[0].length },
                      (_, index) => index,
                    ).map((columnIndex) => (
                      <FormField
                        key={`field-${rowIndex}-${columnIndex}`}
                        control={tableauForm.control}
                        name="data"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className={`${
                                  checkError(rowIndex, columnIndex)
                                    ? 'border-red-400 focus-visible:ring-red-600'
                                    : ''
                                } max-w-[100px]`}
                                value={field.value[rowIndex][columnIndex]}
                                disabled={loading}
                                placeholder={`Row: ${rowIndex}, Column: ${columnIndex}`}
                                onChange={(e) => {
                                  const newData = [...field.value]
                                  newData[rowIndex][columnIndex] =
                                    e.target.value
                                  field.onChange(newData)
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex w-full items-center justify-center">
                <Button disabled={loading} className="" type="submit">
                  Begin Pivot
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex w-full flex-col gap-2">
            <table className="max-w-screen-lg table-auto">
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, columnIndex) => (
                      <td key={columnIndex} className="p-2">
                        <Button
                          onClick={() => onPivot(rowIndex, columnIndex)}
                          className="w-full" // Adjust the width as needed
                          disabled={data[rowIndex][columnIndex] === '0'}
                          variant={`${
                            data[rowIndex][columnIndex] === '0'
                              ? 'secondary'
                              : 'outline'
                          }`}
                        >
                          {data[rowIndex][columnIndex]}
                        </Button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex w-full items-center justify-center">
              <Button disabled={loading} onClick={onEdit}>
                Edit Tableau
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home
