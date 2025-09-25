"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SubmissionForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    applicantName: "",
    coApplicantName: "",
    propertyAddress: "",
    email: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to submit form")
      }

      // ✅ redirect to submissions dashboard
      router.push("/submissions")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">New Submission</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Applicant Name</label>
          <input
            type="text"
            value={form.applicantName}
            onChange={(e) =>
              setForm({ ...form, applicantName: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Co-Applicant Name</label>
          <input
            type="text"
            value={form.coApplicantName}
            onChange={(e) =>
              setForm({ ...form, coApplicantName: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Property Address</label>
          <input
            type="text"
            value={form.propertyAddress}
            onChange={(e) =>
              setForm({ ...form, propertyAddress: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">Error: {error}</p>}
    </div>
  )
}
