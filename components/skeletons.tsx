import { Label } from "@radix-ui/react-label";

// Loading animation
export const shimmer =
  'relative overflow-hidden before:content-[""] before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

  export function TextSkeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${shimmer} relative h-4 overflow-hidden rounded-md bg-gray-100 ${props.className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-muted p-4 shadow-sm`}
    >
      <div className="flex items-center space-x-4">
        <div className="h-5 w-5 rounded-md bg-muted-foreground/20" />
        <div className="h-6 w-16 rounded-md bg-muted-foreground/20" />
      </div>
      <div className="flex items-center justify-center mt-4 rounded-xl bg-background px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-muted-foreground/20" />
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-muted" />
      <div className="rounded-xl bg-muted p-4">
        <div className="sm:grid-cols-13 mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-background p-4 md:gap-4" />
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-muted-foreground/20" />
          <div className="ml-2 h-4 w-20 rounded-md bg-muted-foreground/20" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className={`${shimmer} flex flex-row items-center justify-between border-b border-border py-4`}>
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-muted-foreground/20" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-muted-foreground/20" />
          <div className="mt-2 h-4 w-12 rounded-md bg-muted-foreground/20" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-muted-foreground/20" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-muted" />
      <div className="flex grow flex-col justify-between rounded-xl bg-muted p-4">
        <div className="bg-background px-6">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-muted-foreground/20" />
          <div className="ml-2 h-4 w-20 rounded-md bg-muted-foreground/20" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-muted`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChartSkeleton />
        <LatestInvoicesSkeleton />
      </div>
    </>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className={`${shimmer} w-full border-b border-border last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg`}>

      <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
         <div className="h-6 w-24 rounded bg-muted-foreground/20"></div>
      </td>
      {/* Email */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-muted-foreground/20"></div>
      </td>
      {/* Amount */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-muted-foreground/20"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-[28px] w-[28px] rounded bg-muted-foreground/20"></div>
          <div className="h-[28px] w-[28px] rounded bg-muted-foreground/20"></div>
          <div className="h-[38px] w-[38px] rounded bg-muted-foreground/20"></div>
          <div className="h-[38px] w-[38px] rounded bg-muted-foreground/20"></div>
        </div>
      </td>
    </tr>
  );
}

export function InvoicesMobileSkeleton() {
  return (
    <div className={`${shimmer} mb-2 w-full rounded-md bg-background p-4`}>
      <div className="flex items-center justify-between border-b border-border pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-muted-foreground/20"></div>
          <div className="h-6 w-16 rounded bg-muted-foreground/20"></div>
        </div>
        <div className="h-6 w-16 rounded bg-muted-foreground/20"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded bg-muted-foreground/20"></div>
          <div className="mt-2 h-6 w-24 rounded bg-muted-foreground/20"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-muted-foreground/20"></div>
          <div className="h-10 w-10 rounded bg-muted-foreground/20"></div>
        </div>
      </div>
    </div>
  );
}

export function CategoryTableSkeleton() {
  return (
    <div className="flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-muted/50 md:pt-0">
          <div className="md:hidden">
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
          </div>
          <table className="hidden min-w-full text-foreground md:table">
            <tbody >
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function FormRestaurantSkeleton() {
return (
    <main className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Restaurante</Label>
          <TextSkeleton className="h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <TextSkeleton className="h-10" />

        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <TextSkeleton className="h-20" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo</Label>
        <TextSkeleton className="h-32" />
      </div>

      <TextSkeleton className="h-10" />
    </main>
  )
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <TextSkeleton className="h-8 w-64" />
          <TextSkeleton className="h-4 w-96" />
        </div>
        <TextSkeleton className="h-10 w-32" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <TextSkeleton className="h-10 w-24" />
          <TextSkeleton className="h-10 w-32" />
          <TextSkeleton className="h-10 w-24" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <TextSkeleton className="h-6 w-48 mb-4" />
            <TextSkeleton className="h-80 w-full" />
          </div>
          <div className="rounded-lg border bg-card p-6">
            <TextSkeleton className="h-6 w-40 mb-4" />
            <TextSkeleton className="h-80 w-full" />
          </div>
        </div>

        {/* Recent Items Skeleton */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <TextSkeleton className="h-6 w-48 mb-2" />
            <TextSkeleton className="h-4 w-64" />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <TextSkeleton className="h-5 w-48" />
                <TextSkeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <TextSkeleton className="h-5 w-16" />
                  <TextSkeleton className="h-5 w-20" />
                </div>
              </div>
              <div className="flex gap-2">
                <TextSkeleton className="h-8 w-16" />
                <TextSkeleton className="h-8 w-12" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <TextSkeleton className="h-5 w-40" />
                <TextSkeleton className="h-4 w-28" />
                <div className="flex gap-2">
                  <TextSkeleton className="h-5 w-12" />
                  <TextSkeleton className="h-5 w-18" />
                </div>
              </div>
              <div className="flex gap-2">
                <TextSkeleton className="h-8 w-16" />
                <TextSkeleton className="h-8 w-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Section Skeleton */}
        <div className="rounded-lg border bg-card p-6">
          <TextSkeleton className="h-6 w-56 mb-4" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <TextSkeleton className="h-4 w-32" />
              <TextSkeleton className="h-8 w-24" />
            </div>
            <div className="space-y-2">
              <TextSkeleton className="h-4 w-28" />
              <TextSkeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              <TextSkeleton className="h-4 w-24" />
              <TextSkeleton className="h-8 w-16" />
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="rounded-lg border bg-card p-6">
          <TextSkeleton className="h-6 w-40 mb-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TextSkeleton className="h-20 w-full" />
            <TextSkeleton className="h-20 w-full" />
            <TextSkeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
