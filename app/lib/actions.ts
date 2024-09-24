'use server'

import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
// Update the login form
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

// If there's a 'CredentialsSignin' error, you want to show an appropriate error message.
// You can learn about NextAuth.js errors in the documentation
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData)
  }
  catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })

// This is temporary until @types/react-dom is updated
export interface State {
  errors?: {
    customerId?: string[]
    amount?: string[]
    status?: string[]
  }
  message?: string | null
}
// prevState - contains the state passed from the useFormState hook (create-form.tsx). You won't be using it in the action in this example, but it's a required prop
export async function createInvoice(prevState: State, formData: FormData) {
  /* const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  }; */
  // Test it out:
  // console.log(rawFormData);
  // console.log(typeof rawFormData.amount);

  // change the Zod parse() function to safeParse()
  // Validate form fields using Zod
  // const { customerId, amount, status } = CreateInvoice.parse({
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  // If form validation fails, return errors early. Otherwise, continue.
  // console.error('Missing Fields. Failed to Create Invoice.')
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    }
  }
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]

  // Insert data into the database
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `
  }
  catch (err) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice',
    }
  }
  finally {
    console.log(validatedFields)
  }
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true })

// ...

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  // const { customerId, amount, status } = UpdateInvoice.parse({
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    }
  }

  // Prepare data to insert into database
  const { customerId, amount, status } = validatedFields.data
  const amountInCents = amount * 100

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `
  }
  catch (err) {
    return {
      message: 'Database Error: Failed to Update Invoice',
    }
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice')

  // Unreachable code block
  // try {
  //   await sql`DELETE FROM invoices WHERE id = ${id}`
  // }
  // catch (err) {
  //   return {
  //     message: 'Database Error: Failed to Delete Invoice',
  //   }
  // }
  // revalidatePath('/dashboard/invoices')
}
