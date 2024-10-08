import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data'
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'
import Form from '@/app/ui/invoices/edit-form'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
// similar to your /create invoice page, except it imports a different form (from the edit-form.tsx file)
// This form should be pre-populated with a defaultValue for the customer's name, invoice amount, and status

export const metadata: Metadata = {
  title: 'Edit Invoice',
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ])
  if (!invoice) {
    notFound()
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  )
}
