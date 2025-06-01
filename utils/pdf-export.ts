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

// Helper function to generate and download actual PDF files
export const downloadPDF = (htmlContent: string, filename: string) => {
  // Create a temporary iframe to render the HTML content
  const iframe = document.createElement("iframe")
  iframe.style.position = "absolute"
  iframe.style.left = "-9999px"
  iframe.style.width = "210mm"
  iframe.style.height = "297mm"
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    alert("Unable to generate PDF. Please try again.")
    return
  }

  // Write the HTML content to the iframe
  iframeDoc.open()
  iframeDoc.write(htmlContent)
  iframeDoc.close()

  // Wait for content to load, then trigger print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()

      // Clean up after a delay
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }, 1000)
    } catch (error) {
      console.error("Error generating PDF:", error)
      // Fallback: download as HTML if PDF generation fails
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename.replace(".html", ".pdf")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }
  }, 500)
}

// Alternative PDF generation using window.print() for better browser compatibility
export const generatePDF = (htmlContent: string, filename: string) => {
  const printWindow = window.open("", "_blank", "width=800,height=600")
  if (!printWindow) {
    alert("Please allow popups to generate PDF")
    return
  }

  const enhancedHtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${filename.replace(".html", "")}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
        
        @media print {
          body { 
            margin: 0; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { 
            display: none !important; 
          }
          .summary-table th {
            background-color: #f0f0f0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .totals-row {
            background-color: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
          margin: 20px;
        }
        
        .report-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #000;
        }
        
        .report-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        
        .header-info {
          margin: 5px 0;
          font-size: 12px;
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
          padding: 8px 6px;
          text-align: center;
          font-size: 11px;
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
        }
        
        .filter-info {
          margin-bottom: 10px;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        
        .print-controls {
          position: fixed;
          top: 10px;
          right: 10px;
          background: white;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        
        .print-btn {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 8px;
          font-size: 12px;
        }
        
        .close-btn {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      ${htmlContent
        .replace(/<body[^>]*>|<\/body>/gi, "")
        .replace(/<html[^>]*>|<\/html>/gi, "")
        .replace(/<head[^>]*>.*?<\/head>/gis, "")}
      
      <div class="print-controls no-print">
        <button class="print-btn" onclick="window.print()">📄 Save as PDF</button>
        <button class="close-btn" onclick="window.close()">✖ Close</button>
      </div>

      <script>
        // Set document title for better PDF naming
        document.title = '${filename.replace(".html", "")}';
        
        // Auto-focus print button
        window.onload = function() {
          setTimeout(function() {
            const printBtn = document.querySelector('.print-btn');
            if (printBtn) {
              printBtn.focus();
            }
          }, 500);
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(enhancedHtmlContent)
  printWindow.document.close()
}
