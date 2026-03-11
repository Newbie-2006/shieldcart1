import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateCertificate({ orderId, productName, platform, inspectorName, checklist, inspectedAt }) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // Colors matching ShieldCart palette
    const olive = rgb(0.36, 0.42, 0.23);    // #5c6b3a
    const bark = rgb(0.23, 0.18, 0.12);     // #3b2f1e
    const burnt = rgb(0.60, 0.49, 0.25);    // #9a7c3f
    const stone = rgb(0.48, 0.43, 0.38);    // #7a6e62
    const sandBg = rgb(0.95, 0.93, 0.89);   // #f2ece2
    const olivePale = rgb(0.93, 0.94, 0.90);// #edf0e6
    const white = rgb(1, 1, 1);

    // Background
    page.drawRectangle({
        x: 0, y: 0, width, height,
        color: rgb(0.98, 0.97, 0.95), // canvas
    });

    // Top border bar
    page.drawRectangle({
        x: 0, y: height - 8, width, height: 8,
        color: olive,
    });

    // Shield icon area
    page.drawRectangle({
        x: 40, y: height - 120, width: width - 80, height: 80,
        color: olivePale,
        borderColor: olive,
        borderWidth: 1,
    });

    // Title
    page.drawText('ShieldCart', {
        x: 60, y: height - 80,
        size: 28,
        font: helveticaBold,
        color: bark,
    });
    page.drawText('®', {
        x: 222, y: height - 68,
        size: 10,
        font: helvetica,
        color: burnt,
    });

    page.drawText('INSPECTION CERTIFICATE', {
        x: 60, y: height - 108,
        size: 12,
        font: helveticaBold,
        color: olive,
    });

    // Certificate ID
    page.drawText(`Certificate ID: SC-${orderId.substring(0, 8).toUpperCase()}`, {
        x: 340, y: height - 80,
        size: 10,
        font: helvetica,
        color: stone,
    });

    page.drawText(`Issued: ${new Date(inspectedAt).toLocaleString('en-IN')}`, {
        x: 340, y: height - 96,
        size: 9,
        font: helvetica,
        color: stone,
    });

    // Divider
    page.drawLine({
        start: { x: 40, y: height - 140 },
        end: { x: width - 40, y: height - 140 },
        thickness: 1,
        color: sandBg,
    });

    // "This certifies that..." section
    let yPos = height - 180;

    page.drawText('This certifies that the following product has been physically inspected', {
        x: 40, y: yPos,
        size: 12,
        font: timesItalic,
        color: stone,
    });
    yPos -= 18;
    page.drawText('and verified by a ShieldCart Quality Inspector.', {
        x: 40, y: yPos,
        size: 12,
        font: timesItalic,
        color: stone,
    });

    // Order details box
    yPos -= 40;
    const boxHeight = 140;
    page.drawRectangle({
        x: 40, y: yPos - boxHeight + 20, width: width - 80, height: boxHeight,
        color: white,
        borderColor: sandBg,
        borderWidth: 1,
    });

    yPos -= 10;
    const labelX = 60;
    const valueX = 200;
    const detailSize = 11;

    const details = [
        ['Order ID:', orderId],
        ['Product:', productName],
        ['Platform:', platform],
        ['Inspector:', inspectorName],
        ['Inspected At:', new Date(inspectedAt).toLocaleString('en-IN')],
    ];

    details.forEach(([label, value]) => {
        page.drawText(label, { x: labelX, y: yPos, size: detailSize, font: helveticaBold, color: bark });
        page.drawText(value || 'N/A', { x: valueX, y: yPos, size: detailSize, font: helvetica, color: stone });
        yPos -= 22;
    });

    // Checklist section
    yPos -= 30;
    page.drawText('INSPECTION CHECKLIST', {
        x: 40, y: yPos,
        size: 12,
        font: helveticaBold,
        color: olive,
    });

    yPos -= 8;
    page.drawLine({
        start: { x: 40, y: yPos },
        end: { x: 240, y: yPos },
        thickness: 2,
        color: olive,
    });

    yPos -= 25;
    const checklistItems = [
        { key: 'packaging_intact', label: 'Packaging Intact' },
        { key: 'correct_item', label: 'Correct Item Received' },
        { key: 'no_defects', label: 'No Defects Found' },
        { key: 'serial_number_matches', label: 'Serial Number Matches' },
        { key: 'all_accessories_present', label: 'All Accessories Present' },
    ];

    checklistItems.forEach(({ key, label }) => {
        const passed = checklist?.[key] ?? false;
        const statusText = passed ? '✓ PASS' : '✗ FAIL';
        const statusColor = passed ? olive : rgb(0.69, 0.25, 0.25);

        page.drawRectangle({
            x: 40, y: yPos - 4, width: width - 80, height: 24,
            color: passed ? olivePale : rgb(0.98, 0.94, 0.94),
        });

        page.drawText(label, { x: 60, y: yPos, size: 11, font: helvetica, color: bark });
        page.drawText(statusText, { x: 420, y: yPos, size: 11, font: helveticaBold, color: statusColor });
        yPos -= 28;
    });

    // Result banner
    yPos -= 20;
    page.drawRectangle({
        x: 40, y: yPos - 10, width: width - 80, height: 50,
        color: olive,
    });

    page.drawText('RESULT: PASSED ✓', {
        x: 200, y: yPos + 8,
        size: 20,
        font: helveticaBold,
        color: white,
    });

    // Footer
    page.drawLine({
        start: { x: 40, y: 80 },
        end: { x: width - 40, y: 80 },
        thickness: 1,
        color: sandBg,
    });

    page.drawText('ShieldCart — Consumer Safety Platform', {
        x: 40, y: 58,
        size: 9,
        font: helvetica,
        color: stone,
    });

    page.drawText('This certificate is digitally generated and verifiable.', {
        x: 40, y: 44,
        size: 8,
        font: timesItalic,
        color: stone,
    });

    page.drawText('www.shieldcart.in', {
        x: 440, y: 58,
        size: 9,
        font: helvetica,
        color: olive,
    });

    // Bottom border bar
    page.drawRectangle({
        x: 0, y: 0, width, height: 6,
        color: olive,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
