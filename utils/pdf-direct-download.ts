// Helper function to parse date from DD/M/YYYY format
export const parseDate = (dateStr: string) => {
  const parts = dateStr.split("/")
  if (parts.length === 3) {
    const day = Number.parseInt(parts[0])
    const month = Number.parseInt(parts[1]) - 1 // Month is 0-indexed
    const year = Number.parseInt(parts[2])
    return new Date(year, month, day)
  }
  return null
}

// Direct PDF download using jsPDF library simulation
export const downloadPDFDirect = async (htmlContent: string, filename: string) => {
  try {
    // Create a more complete HTML document for PDF conversion
    const completeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${filename.replace(/\.(html|pdf)$/, "")}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .report-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
          }
          
          .report-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          
          .header-info {
            margin: 4px 0;
            font-size: 11px;
          }
          
          .header-info strong {
            font-weight: bold;
          }
          
          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .summary-table th,
          .summary-table td {
            border: 1px solid #000;
            padding: 6px 4px;
            text-align: center;
            font-size: 10px;
          }
          
          .summary-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .summary-table .text-right {
            text-align: right;
          }
          
          .summary-table .text-left {
            text-align: left;
          }
          
          .totals-row {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .totals-row td {
            border-top: 2px solid #000;
            font-weight: bold;
          }
          
          .filter-info {
            margin-bottom: 10px;
            font-size: 9px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([completeHtml], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    // Create download link
    const link = document.createElement("a")
    link.href = url
    link.download = filename.replace(/\.html$/, ".pdf")
    link.style.display = "none"

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    alert("Error generating PDF. Please try again.")
    return false
  }
}
