"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

type Applicant = { id: string; fullName: string; type: string }
type Property = {
  id: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  zip: string
  occupancyType: string
  beginningHomeValue: number
}
type Document = { id: string; type: string; url?: string | null; createdAt: string }
type Offer = {
  id: string
  termYears: number
  investorCap: number
  multiplier: number
  minInvestmentAmt: number
  maxInvestmentAmt: number
  maxInvestmentPct: number
  highestInvestmentAmt?: number | null
  optionPurchasePremiumPaidToOwner: number
  optionPurchasePremiumPct: number
  investorOptionPercentage: number
  totalEstimatedPayoffsAtClosing: number
  additionalClosingCosts: number
  specifiedValuation?: string | null
  contractDesign: { id: string; name: string }
  isActive: boolean
  activatedAt?: string | null
}
type Investor = { id: string; name: string }
type Application = {
  id: string
  heaOptionAgreementNo: string
  offerDate: string
  investorName: string
  investor: Investor
  applicants: Applicant[]
  property?: Property | null
  documents: Document[]
  offers: Offer[]
}

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>()
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("summary")
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch(`/api/applications/${params.id}`)
        if (!res.ok) throw new Error("Failed to load application")
        const data = await res.json()
        setApp(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchApp()
  }, [params.id])

  async function handleFileUpload(file: File, type: string) {
    try {
      setUploadProgress(0)

      // Step 1: request signed URL + target URL
      const res = await fetch(`/api/applications/${app?.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          filename: file.name,
          contentType: file.type,
        }),
      })
      if (!res.ok) throw new Error("Failed to get signed URL")
      const { signedUrl, fileUrl } = await res.json()

      // Step 2: upload to S3 with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", signedUrl)
        xhr.setRequestHeader("Content-Type", file.type)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) resolve()
          else reject(new Error("Upload to S3 failed"))
        }

        xhr.onerror = () => reject(new Error("Upload failed"))
        xhr.send(file)
      })

      // Step 3: confirm + save DB record
      const confirmRes = await fetch(`/api/applications/${app?.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: true,
          type,
          url: fileUrl,
        }),
      })
      if (!confirmRes.ok) throw new Error("Failed to save document record")
      const newDoc = await confirmRes.json()

      setApp((prev) =>
        prev ? { ...prev, documents: [...prev.documents, newDoc] } : prev
      )
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploadProgress(null)
    }
  }

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>
  if (!app) return <p className="p-4">Application not found</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Application Detail</h1>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {["summary", "applicants", "property", "offers", "documents"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px border-b-2 font-medium ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary */}
      {activeTab === "summary" && (
        <div className="p-4 border rounded bg-gray-50 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p><strong>Agreement No:</strong> {app.heaOptionAgreementNo}</p>
          <p><strong>Offer Date:</strong> {new Date(app.offerDate).toLocaleDateString()}</p>
          <p><strong>Investor:</strong> {app.investor?.name || app.investorName}</p>

          {app.offers.some((o) => o.isActive) ? (
            (() => {
              const activeOffer = app.offers.find((o) => o.isActive)!
              return (
                <div className="mt-4 p-3 border rounded bg-white shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Active Offer</h3>
                  <p><strong>Contract Design:</strong> {activeOffer.contractDesign?.name}</p>
                  <p><strong>Term:</strong> {activeOffer.termYears} years</p>
                  <p><strong>Cap:</strong> {activeOffer.investorCap}</p>
                  <p><strong>Multiplier:</strong> {activeOffer.multiplier}</p>
                  <p><strong>Premium %:</strong> {activeOffer.optionPurchasePremiumPct}</p>
                  <p><strong>Activated At:</strong>{" "}
                    {activeOffer.activatedAt
                      ? new Date(activeOffer.activatedAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              )
            })()
          ) : (
            <p className="mt-4 italic text-gray-500">No active offer selected yet.</p>
          )}
        </div>
      )}

      {/* Applicants */}
      {activeTab === "applicants" && (
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">Applicants</h2>
          <ul className="list-disc list-inside">
            {app.applicants.map((a) => (
              <li key={a.id}>
                {a.fullName} <span className="text-gray-500">({a.type})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Property */}
      {activeTab === "property" && app.property && (
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">Property</h2>
          <p>
            {app.property.addressLine1}
            {app.property.addressLine2 ? `, ${app.property.addressLine2}` : ""}
          </p>
          <p>{app.property.city}, {app.property.state} {app.property.zip}</p>
          <p><strong>Occupancy:</strong> {app.property.occupancyType}</p>
          <p><strong>Home Value:</strong> ${app.property.beginningHomeValue.toLocaleString()}</p>
        </div>
      )}

      {/* Offers */}
      {activeTab === "offers" && (
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">Offers</h2>
          {app.offers.length > 0 ? (
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Active</th>
                  <th className="border px-4 py-2">Design</th>
                  <th className="border px-4 py-2">Term (Years)</th>
                  <th className="border px-4 py-2">Cap</th>
                  <th className="border px-4 py-2">Multiplier</th>
                  <th className="border px-4 py-2">Premium %</th>
                  <th className="border px-4 py-2">Payoffs</th>
                  <th className="border px-4 py-2">Activated At</th>
                </tr>
              </thead>
              <tbody>
                {app.offers.map((o) => (
                  <tr key={o.id} className="text-center">
                    <td className="border px-4 py-2">
                      {o.isActive ? (
                        <span className="px-2 py-1 rounded bg-green-500 text-white">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            const res = await fetch(`/api/offers/${o.id}/activate`, { method: "POST" })
                            if (res.ok) {
                              const updated = await res.json()
                              setApp((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      offers: prev.offers.map((offer) =>
                                        offer.id === updated.id
                                          ? { ...offer, isActive: true, activatedAt: updated.activatedAt }
                                          : { ...offer, isActive: false, activatedAt: null }
                                      ),
                                    }
                                  : prev
                              )
                            } else {
                              alert("Failed to activate offer")
                            }
                          }}
                          className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          Make Active
                        </button>
                      )}
                    </td>
                    <td className="border px-4 py-2">{o.contractDesign?.name}</td>
                    <td className="border px-4 py-2">{o.termYears}</td>
                    <td className="border px-4 py-2">{o.investorCap}</td>
                    <td className="border px-4 py-2">{o.multiplier}</td>
                    <td className="border px-4 py-2">{o.optionPurchasePremiumPct}</td>
                    <td className="border px-4 py-2">{o.totalEstimatedPayoffsAtClosing}</td>
                    <td className="border px-4 py-2">
                      {o.activatedAt ? new Date(o.activatedAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No offers available.</p>
          )}
        </div>
      )}

      {/* Documents */}
      {activeTab === "documents" && (
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">Documents</h2>

          {/* Upload form */}
          <form
            className="mt-4 flex items-center space-x-2"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget
              const fileInput = form.querySelector<HTMLInputElement>("input[type=file]")
              const typeSelect = form.querySelector<HTMLSelectElement>("select")
              if (!fileInput?.files?.[0] || !typeSelect?.value) return
              await handleFileUpload(fileInput.files[0], typeSelect.value)
              form.reset()
            }}
          >
            <select name="type" className="border rounded px-2 py-1" defaultValue="">
              <option value="" disabled>Select Type</option>
              <option value="Driver's License">Driver's License</option>
              <option value="Mortgage Statement">Mortgage Statement</option>
              <option value="Insurance Certificate">Homeowner's Insurance Certificate</option>
            </select>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="border rounded px-2 py-1"
              disabled={uploadProgress !== null}
            />
            <button
              type="submit"
              disabled={uploadProgress !== null}
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploadProgress !== null ? "Uploading..." : "Upload"}
            </button>
          </form>

          {/* Progress bar with % label */}
          {uploadProgress !== null && (
            <div className="mt-3 w-full bg-gray-200 rounded h-4 relative">
              <div
                className={`h-4 rounded ${uploadProgress === 100 ? "bg-green-600" : "bg-indigo-600"}`}
                style={{ width: `${uploadProgress}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {uploadProgress}%
              </span>
            </div>
          )}

          {/* Document list */}
          <div className="mt-4">
            {app.documents.length > 0 ? (
              <ul className="list-disc list-inside">
                {app.documents.map((doc) => (
                  <li key={doc.id}>
                    {doc.type} –{" "}
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "Not uploaded"
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No documents uploaded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
