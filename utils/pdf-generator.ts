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

// Generate PDF with proper table structure
export const generatePDFReport = (htmlContent: string, filename: string) => {
  // Create a new window for PDF generation
  const printWindow = window.open("", "_blank", "width=800,height=600")

  if (!printWindow) {
    alert("Please allow popups to generate PDF reports")
    return false
  }

  const fullHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filename}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 15mm;
        }
        
        @media print {
          body { 
            margin: 0; 
            font-size: 12px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { 
            display: none !important; 
          }
          .page-break {
            page-break-before: always;
          }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
          margin: 0;
          padding: 20px;
        }
        
        .report-container {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .report-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #000;
        }
        
        .report-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .header-info {
          margin: 8px 0;
          font-size: 14px;
          font-weight: 500;
        }
        
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        
        .summary-table th {
          background-color: #f8f9fa;
          border: 2px solid #000;
          padding: 12px 8px;
          text-align: center;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 11px;
        }
        
        .summary-table td {
          border: 1px solid #000;
          padding: 10px 8px;
          text-align: center;
          font-size: 11px;
        }
        
        .summary-table .text-left {
          text-align: left;
          font-weight: 500;
        }
        
        .summary-table .text-right {
          text-align: right;
          font-family: 'Courier New', monospace;
        }
        
        .totals-row {
          background-color: #e9ecef;
          font-weight: bold;
        }
        
        .totals-row td {
          border-top: 3px solid #000;
          border-bottom: 3px solid #000;
          font-weight: bold;
          font-size: 12px;
        }
        
        .print-controls {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          padding: 15px;
          border: 2px solid #007bff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
        }
        
        .btn {
          padding: 10px 20px;
          margin: 0 5px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .btn:hover {
          opacity: 0.9;
        }
        
        .filter-info {
          text-align: center;
          margin: 15px 0;
          padding: 10px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          font-size: 11px;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        ${htmlContent}
      </div>
      
      <div class="print-controls no-print">
        <button class="btn btn-primary" onclick="window.print()">📄 Download PDF</button>
        <button class="btn btn-secondary" onclick="window.close()">✖ Close</button>
      </div>

      <script>
        document.title = '${filename}';
        
        // Auto-focus and setup
        window.onload = function() {
          setTimeout(function() {
            document.querySelector('.btn-primary')?.focus();
          }, 500);
        };
        
        // Handle print completion
        window.onafterprint = function() {
          setTimeout(function() {
            window.close();
          }, 1000);
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(fullHtmlContent)
  printWindow.document.close()

  return true
}
