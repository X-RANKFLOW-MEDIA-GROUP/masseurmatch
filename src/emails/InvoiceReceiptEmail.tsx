// src/emails/InvoiceReceiptEmail.tsx
import { Text, Button, Section, Row, Column } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface InvoiceReceiptEmailProps {
  therapistName: string;
  amount: string;
  invoiceNumber: string;
  date: string;
  invoicePdfUrl: string;
}

export default function InvoiceReceiptEmail({
  therapistName = "Alex",
  amount = "$99.00",
  invoiceNumber = "INV-2026-00142",
  date = "October 15, 2026",
  invoicePdfUrl = "https://checkout.stripe.com/..."
}: InvoiceReceiptEmailProps) {
  return (
    <BaseLayout previewText={`Receipt for your MasseurMatch payment (${amount})`}>
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Payment Received. Thank you!
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Hi {therapistName}, we have successfully processed your payment. Your profile continues to benefit from premium placement on MasseurMatch. Below are your invoice details.
      </Text>

      <Section className="bg-white border-2 border-slate-900 p-6 mb-6 rounded-md shadow-sm">
        <Row className="mb-4 pb-4 border-b border-slate-100">
          <Column><Text className="text-slate-500 text-xs uppercase tracking-widest m-0">Invoice Number</Text></Column>
          <Column align="right"><Text className="text-slate-900 font-mono text-xs m-0">{invoiceNumber}</Text></Column>
        </Row>
        <Row className="mb-4 pb-4 border-b border-slate-100">
          <Column><Text className="text-slate-500 text-xs uppercase tracking-widest m-0">Issue Date</Text></Column>
          <Column align="right"><Text className="text-slate-900 font-sans text-xs m-0">{date}</Text></Column>
        </Row>
        <Row>
          <Column><Text className="text-slate-500 text-xs uppercase tracking-widest m-0 font-bold">Total Paid</Text></Column>
          <Column align="right"><Text className="text-emerald-600 font-mono text-lg font-bold m-0">{amount}</Text></Column>
        </Row>
      </Section>

      <Section className="text-center mb-6">
        <Button
          href={invoicePdfUrl}
          className="bg-slate-100 text-slate-900 border border-slate-300 px-8 py-3 rounded-md text-sm font-semibold tracking-wide hover:bg-slate-200 transition-colors"
        >
          Download PDF Invoice
        </Button>
      </Section>
    </BaseLayout>
  );
}
