'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

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
import { createEmptyStringArray } from '@/lib/utils'

const tableDataFormSchema = z.object({
  rows: z.coerce.number().int().min(2),
  columns: z.coerce.number().int().min(2),
})

const tableauFormSchema = z.object({
  data: z.array(
    z.array(
      z.custom((value: any) => {
        if (/^\d+$/.test(value)) {
          // It's a whole number
          return value
        } else if (/^\d+\/\d+$/.test(value)) {
          // It's a fraction
          const [numerator, denominator] = value.split('/').map(Number)
          if (denominator === 0) {
            return 'Invalid input. Denominator cannot be zero.'
          }
          return value
        } else {
          return 'Invalid input. Please enter a valid whole number or a fraction in the form of "numerator/denominator".'
        }
      }),
    ),
  ),
})

type tableDataFormValues = z.infer<typeof tableDataFormSchema>
type tableauFormValues = z.infer<typeof tableauFormSchema>

const Home = () => {
  const [data, setData] = useState(createEmptyStringArray(2, 2))
  const [loading, setLoading] = useState(false)

  const tableDataForm = useForm<tableDataFormValues>({
    resolver: zodResolver(tableDataFormSchema),
    defaultValues: {
      rows: 2,
      columns: 2,
    },
  })

  const tableauForm = useForm<tableauFormValues>({
    resolver: zodResolver(tableauFormSchema),
    defaultValues: {
      data: createEmptyStringArray(2, 2),
    },
  })

  const onTableFormSubmit = async (data: tableDataFormValues) => {
    try {
      setLoading(true)
      tableauForm.setValue(
        'data',
        createEmptyStringArray(data.rows, data.columns),
      )
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const onTableauFormSubmit = async (data: tableauFormValues) => {
    try {
      setLoading(true)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Form {...tableDataForm}>
        <form
          onSubmit={tableDataForm.handleSubmit(onTableFormSubmit)}
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
      <Form {...tableauForm}>
        <form
          onSubmit={tableauForm.handleSubmit(onTableauFormSubmit)}
          className="w-full space-y-8"
        >
          {Array.from(
            { length: tableauForm.getValues('data').length },
            (_, index) => index,
          ).map((rowIndex) => (
            <div key={rowIndex} className="flex">
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
                          value={field.value[rowIndex][columnIndex]}
                          disabled={loading}
                          placeholder={`Row: ${rowIndex}, Column: ${columnIndex}`}
                          onChange={(e) => {
                            const newData = [...field.value]
                            newData[rowIndex][columnIndex] = e.target.value
                            field.onChange(newData)
                          }}
                        />
                      </FormControl>
                      <FormMessage>
                        {tableauForm.formState.errors.data &&
                          tableauForm.formState.errors.data.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          ))}
          <Button disabled={loading} className="" type="submit">
            Pivot
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Home
