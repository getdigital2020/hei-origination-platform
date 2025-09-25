"use client"

import { useEffect, useState } from "react"

type Submission = {
  id: number
  applicantName: string
  coApplicantName?: string | null
  propertyAddress: string
  email: string
  phone: string
  createdAt: string
  status: string
  applicationId?: string | null
}

type InvestorWithDesigns = {
  id: string
  name: string
  designs: { id: string; name: string }[]
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [investorData, setInvestorData] = useState<InvestorWithDesigns[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [promotingId, setPromotingId] = useState<number | null>(null)

  const [selectedInvestor, setSelectedInvestor] = useState<Record<number, string>>({})
  const [selectedDesign, setSelectedDesign] = useState<Record<number, string>>({})

  useEffect(() => {
    async function fetchData() {
      try {
        const [subsRes, invDesRes] = await Promise.all([
          fetch("/api/submissions"),
          fetch("/api/investor-designs"),
        ])

        if (!subsRes.ok || !invDesRes.ok) {
          throw new Error("Failed to load dashboard data")
        }

        const [subsData, invDesData] = await Promise.all([
          subsRes.json(),
          invDesRes.json(),
        ])

        setSubmissions(subsData)
        setInvestorData(invDesData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function promoteSubmission(id: number, investorId: string, contractDesignId: string) {
    setPromotingId(id)
    try {
      const res = await fetch("/api/submissions/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id, investorId, contractDesignId }),
      })

      if (!res.ok) throw new Error("Failed to promote submission")

      alert("Submission promoted to Application ✅")
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setPromotingId(null)
    }
  }

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Submissions Dashboard</h1>

      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Applicant</th>
            <th className="border px-4 py-2">Property</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Phone</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Created</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => {
            const investorId = selectedInvestor[s.id] || ""
            const designId = selectedDesign[s.id] || ""

            const designsForInvestor =
              investorData.find((i) => i.id === investorId)?.designs || []

            return (
              <tr key={s.id} className="text-center">
                <td className="border px-4 py-2">{s.id}</td>
                <td className="border px-4 py-2">
                  {s.applicantName}
                  {s.coApplicantName ? ` & ${s.coApplicantName}` : ""}
                </td>
                <td className="border px-4 py-2">{s.propertyAddress}</td>
                <td className="border px-4 py-2">{s.email}</td>
                <td className="border px-4 py-2">{s.phone}</td>
                <td className="border px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      s.status === "NEW"
                        ? "bg-blue-500"
                        : s.status === "PROMOTED"
                        ? "bg-green-500"
                        : s.status === "REJECTED"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {s.status === "NEW" ? (
                    <div className="flex flex-col space-y-2">
                      {/* Investor dropdown */}
                      <select
                        className="border rounded px-2 py-1"
                        value={investorId}
                        onChange={(e) => {
                          setSelectedInvestor({ ...selectedInvestor, [s.id]: e.target.value })
                          setSelectedDesign({ ...selectedDesign, [s.id]: "" })
                        }}
                      >
                        <option value="">Select Investor</option>
                        {investorData.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name}
                          </option>
                        ))}
                      </select>

                      {/* Contract Design dropdown */}
                      <select
                        className="border rounded px-2 py-1"
                        value={designId}
                        onChange={(e) =>
                          setSelectedDesign({ ...selectedDesign, [s.id]: e.target.value })
                        }
                        disabled={!investorId}
                      >
                        <option value="">Select Contract Design</option>
                        {designsForInvestor.map((des) => (
                          <option key={des.id} value={des.id}>
                            {des.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => promoteSubmission(s.id, investorId, designId)}
                        disabled={promotingId === s.id || !investorId || !designId}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {promotingId === s.id ? "Promoting..." : "Promote"}
                      </button>
                    </div>
                  ) : s.applicationId ? (
                    <a
                      href={`/applications/${s.applicationId}`}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      View Application
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
