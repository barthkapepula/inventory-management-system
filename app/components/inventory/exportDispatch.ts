import jsPDF from "jspdf";

// Define the DispatchRecord interface
interface DispatchRecord {
  barcodeId: string;
  driverName: string;
  destination: string;
  dispatchbookNumber: string;
  carRegistration: string;
  driverLicence: string;
  registra: string;
  date: string;
}
 
// Function to format the date as DD-MM-YY
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export const exportDispatchDataPDF = async (dispatchRecord: DispatchRecord) => {
  console.log(`Exporting dispatch data for book number: ${dispatchRecord.dispatchbookNumber}`);

  try {
    const doc = new jsPDF();

    // Set font
    doc.setFont('helvetica', 'normal');

    // Add company header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('EASTERN TOBACCO ASSOCIATION', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(127, 140, 141);
    doc.text('DISPATCH DOCUMENT', doc.internal.pageSize.width / 2, 30, { align: 'center' });

    // Draw header line
    doc.setDrawColor(52, 73, 94);
    doc.setLineWidth(0.5);
    doc.line(20, 35, doc.internal.pageSize.width - 20, 35);

    // Header Section (formatted like a form)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 50;
    const leftMargin = 20;
    const lineHeight = 10;

    // Form-style layout with consistent spacing
    doc.text(`Dispatch book No:   ${dispatchRecord.dispatchbookNumber}`, leftMargin, yPosition);
    yPosition += lineHeight;
    
    doc.text(`Driver Name:        ${dispatchRecord.driverName}`, leftMargin, yPosition);
    yPosition += lineHeight;
    
    doc.text(`Driver Licence:     ${dispatchRecord.driverLicence}`, leftMargin, yPosition);
    yPosition += lineHeight;
    
    doc.text(`Destination:        ${dispatchRecord.destination}`, leftMargin, yPosition);
    yPosition += lineHeight;
    
    doc.text(`Truck Reg No:       ${dispatchRecord.carRegistration}`, leftMargin, yPosition);
    yPosition += lineHeight;
    
    doc.text(`Date:               ${formatDate(dispatchRecord.date)}`, leftMargin, yPosition);
    yPosition += lineHeight * 2;

    // Barcode Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Barcode', leftMargin, yPosition);
    yPosition += lineHeight;

    // Draw a line under "Barcode" title
    doc.setLineWidth(0.3);
    doc.line(leftMargin, yPosition, leftMargin + 40, yPosition);
    yPosition += 8;

    // Barcode Grid (3-4 columns per row)
    const barcodeIds = dispatchRecord.barcodeId.split(',').map(id => id.trim()).filter(id => id.length > 0);
    const barcodeGridX = leftMargin;
    let barcodeGridY = yPosition;
    const barcodeColumnWidth = 45;
    const maxColumns = 4;
    let barcodeColumn = 0;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    barcodeIds.forEach((barcodeId: string, index: number) => {
      const xPos = barcodeGridX + (barcodeColumn * barcodeColumnWidth);
      
      // Check if we need a new page
      if (barcodeGridY > 250) {
        doc.addPage();
        barcodeGridY = 30;
        
        // Add header on new page
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Barcode (continued)', leftMargin, barcodeGridY);
        barcodeGridY += 15;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      }
      
      doc.text(barcodeId, xPos, barcodeGridY);
      
      barcodeColumn++;
      if (barcodeColumn >= maxColumns) {
        barcodeColumn = 0;
        barcodeGridY += lineHeight;
      }
    });

    // Move to next line if we ended mid-row
    if (barcodeColumn > 0) {
      barcodeGridY += lineHeight;
    }

    // Count Barcodes at the bottom of barcode section
    barcodeGridY += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Count Barcodes: ${barcodeIds.length}`, leftMargin, barcodeGridY);

    // Add some spacing before footer
    barcodeGridY += lineHeight * 3;

    // Add signature section
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Driver Signature: ____________________________', leftMargin, barcodeGridY);
    barcodeGridY += lineHeight * 2;
    doc.text('Receiver Signature: __________________________', leftMargin, barcodeGridY);
    barcodeGridY += lineHeight * 2;
    doc.text(`Registrar: ${dispatchRecord.registra}`, leftMargin, barcodeGridY);

    // Add footer with generation info
    barcodeGridY += lineHeight * 2;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, leftMargin, barcodeGridY);

    // Save the PDF with descriptive filename
    const filename = `Dispatch_${dispatchRecord.dispatchbookNumber}_${dispatchRecord.driverName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    console.log(`PDF generated successfully: ${filename}`);
    alert(`Dispatch document generated successfully!\nFile: ${filename}`);

  } catch (error) {
    console.error("Error exporting dispatch data:", error);
    throw error; // Re-throw to let the calling component handle it
  }
};
