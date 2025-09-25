import { NextResponse } from "next/server"
import puppeteer from "puppeteer"

type Disposition = "inline" | "attachment"
type PageFormat = "Letter" | "Legal" | "A4" | "A3" | "Tabloid"

interface PdfRequest {
  html: string
  filename?: string
  disposition?: Disposition
  format?: PageFormat
  margin?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  displayHeaderFooter?: boolean
  headerTemplate?: string
  footerTemplate?: string
  styles?: string                // inline CSS
  stylesheets?: string[]         // external CSS URLs/paths
  images?: { src: string; alt?: string; style?: string }[] // optional injected images
  enablePageBreaks?: boolean     // allow <div class="page-break"></div>
  watermark?: {                  // watermark support
    text?: string
    image?: string               // base64 or URL
    opacity?: number             // default: 0.1
    fontSize?: string            // default: 80px
    color?: string               // default: #000
  }
}

export async function POST(request: Request) {
  try {
    const {
      html,
      filename,
      disposition,
      format,
      margin,
      displayHeaderFooter,
      headerTemplate,
      footerTemplate,
      styles,
      stylesheets,
      images,
      enablePageBreaks,
      watermark,
    }: PdfRequest = await request.json()

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    const page = await browser.newPage()

    // ✅ Build final HTML with styles, sheets, images, watermark, and page breaks
    let finalHtml = html

    if (stylesheets?.length) {
      const links = stylesheets
        .map((href) => `<link rel="stylesheet" href="${href}">`)
        .join("\n")
      finalHtml = `${links}\n${finalHtml}`
    }

    let extraCss = ""

    if (styles) {
      extraCss += styles
    }

    if (enablePageBreaks) {
      extraCss += `
        .page-break {
          page-break-before: always;
        }
      `
    }

    if (watermark) {
      extraCss += `
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          opacity: ${watermark.opacity ?? 0.1};
          z-index: 9999;
          pointer-events: none;
          text-align: center;
          width: 100%;
        }
        .watermark-text {
          font-size: ${watermark.fontSize ?? "80px"};
          color: ${watermark.color ?? "#000"};
        }
        .watermark img {
          max-width: 60%;
          opacity: ${watermark.opacity ?? 0.1};
        }
      `
    }

    if (extraCss) {
      finalHtml = `<style>${extraCss}</style>\n${finalHtml}`
    }

    if (images?.length) {
      const imgs = images
        .map(
          (img) =>
            `<img src="${img.src}" alt="${img.alt || ""}" style="${
              img.style || "max-width:100%; margin:10px 0;"
            }" />`
        )
        .join("\n")
      finalHtml = `${finalHtml}\n${imgs}`
    }

    if (watermark) {
      let wmHtml = `<div class="watermark">`
      if (watermark.text) {
        wmHtml += `<div class="watermark-text">${watermark.text}</div>`
      }
      if (watermark.image) {
        wmHtml += `<img src="${watermark.image}" alt="watermark" />`
      }
      wmHtml += `</div>`
      finalHtml = `${finalHtml}\n${wmHtml}`
    }

    // ✅ Ensure resources load before rendering
    await page.setContent(finalHtml, { waitUntil: "networkidle0" })

    const pdfBytes = await page.pdf({
      format: format || "A4",
      margin: margin || {
        top: "20mm",
        right: "10mm",
        bottom: "20mm",
        left: "10mm",
      },
      displayHeaderFooter: displayHeaderFooter || false,
      headerTemplate: headerTemplate || "",
      footerTemplate: footerTemplate || "",
    })

    await browser.close()

    const contentDisposition = `${disposition || "attachment"}; filename="${
      filename || "document.pdf"
    }"`

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
      },
    })
  } catch (err) {
    console.error("Error generating PDF:", err)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
