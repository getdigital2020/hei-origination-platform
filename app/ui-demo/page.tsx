"use client"

import { Button } from "@/components/ui/button"
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function UIDemoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold">UI Demo</h1>

      {/* Buttons */}
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🔔</Button>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
        </CardContent>
      </Card>

      {/* Mixed demo */}
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Combined Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Enter your name" />
          <Button className="w-full">Submit</Button>
        </CardContent>
      </Card>
    </div>
  )
}
