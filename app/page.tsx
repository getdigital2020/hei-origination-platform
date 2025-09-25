import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="space-y-8">
      {/* Existing heading */}
      <div>
        <h1 className="text-3xl font-bold mb-4">HEI Origination Platform</h1>
        <p className="mb-6">
          Next 14 + Prisma + Tailwind + shadcn/ui + RHF + Zod + Puppeteer
        </p>

        <div className="space-x-4">
          <Link href="/form" className="text-blue-600 underline">
            Open sample form
          </Link>
        </div>
      </div>

      {/* New shadcn/ui demo card */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>UI Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is a demo card using shadcn/ui components.</p>
          <div className="flex gap-4">
            <Button>Default Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
