import { jsPDF } from 'jspdf';
import { Filesystem, Directory, WriteFileResult } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface PDFGenerationParams {
  userName: string;
  orderId: string;
  latitude: number;
  longitude: number;
  date: string;
}

/**
 * Service to generate a Delivery Invoice PDF with an embedded map link.
 * Uses jsPDF for generation and Capacitor Filesystem for storage.
 */
export const PDFMapService = {
  /**
   * Generates a PDF and saves it locally or triggers a download in the browser.
   */
  async generateDeliveryInvoice({ userName, orderId, latitude, longitude, date }: PDFGenerationParams): Promise<string> {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // 1. Header & Title (Simulating standard invoice layout)
      doc.setFontSize(22);
      doc.setTextColor(6, 95, 70); // Theme green
      doc.text('مشتل زون - فاتورة تسليم', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`تاريخ الطلب: ${date}`, 20, 40);
      doc.text(`رقم الطلب: ${orderId}`, 20, 48);
      doc.text(`اسم العميل: ${userName}`, 20, 56);

      // 2. Map Section Title
      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55); // Dark gray
      doc.text('موقع التسليم المعتمد:', 20, 75);

      // 3. Static Map Placeholder (Since we can't fetch real-time map images without API key here)
      // For real use, you'd use a URL from Google Static Maps or OpenStreetMap
      // We'll draw a rectangle as a placeholder and overlay the link
      const mapX = 20;
      const mapY = 80;
      const mapWidth = 170;
      const mapHeight = 80;

      // Draw Map Placeholder Box
      doc.setDrawColor(200);
      doc.setFillColor(243, 244, 246);
      doc.rect(mapX, mapY, mapWidth, mapHeight, 'FD');
      
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('انقر هنا لفتح الموقع في خرائط جوجل', 105, mapY + 40, { align: 'center' });
      
      // Blue Link text
      doc.setTextColor(37, 99, 235);
      doc.text(`${latitude}, ${longitude}`, 105, mapY + 50, { align: 'center' });

      // 4. THE IMPORTANT HYPERLINK
      // We overlay a clickable link over the entire map area
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      doc.link(mapX, mapY, mapWidth, mapHeight, { url: mapsUrl });

      // 5. Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('تم توليد هذا الملف آلياً من طبيب زون - أمان وخصوصية تامة', 105, 280, { align: 'center' });

      // --- Saving logic ---
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileName = `Zone_Invoice_${orderId}.pdf`;

      if (Capacitor.isNativePlatform()) {
        // Save to Android/iOS Filesystem
        const result: WriteFileResult = await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Documents,
          recursive: true
        });
        return `تم حفظ الملف بنجاح في: ${result.uri}`;
      } else {
        // Browser Download Fallback
        doc.save(fileName);
        return 'جاري بدء تحميل الملف في المتصفح...';
      }

    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      throw new Error(`فشل إنشاء ملف الـ PDF: ${error.message}`);
    }
  }
};
