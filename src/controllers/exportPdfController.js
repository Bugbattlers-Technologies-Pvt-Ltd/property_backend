// src/controllers/exportPdfController.js

const PDFDocument = require('pdfkit');
const Property = require('../models/Property');
const { ROLES, ADMIN_ONLY_FIELDS } = require('../utils/constants');

exports.exportPropertiesPdf = async (req, res) => {
    try {
        const { fields = [], filter = {} } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;

        console.log('--- PDF Export Request Received (Property per Page - Clean Continuation) ---');
        console.log('Requested fields:', fields);
        console.log('Requested filter:', filter);
        console.log('User Role:', userRole);
        console.log('User ID:', userId);

        let query = {};
        if (filter.location) query.location = { $regex: filter.location, $options: 'i' };
        if (filter.area) query.area = { $regex: filter.area, $options: 'i' };
        if (filter.status) query.status = filter.status;

        if ([ROLES.AGENT, ROLES.EMPLOYEE].includes(userRole)) {
            query.createdBy = userId;
            console.log(`Applying creator filter for ${userRole}:`, query.createdBy);
        }

        console.log('MongoDB Query:', JSON.stringify(query));

        const properties = await Property.find(query).lean();
        console.log('Number of properties found:', properties.length);

        if (properties.length === 0) {
            return res.status(404).json({ message: 'No properties found matching the criteria for PDF export.' });
        }

        const doc = new PDFDocument({ margin: 50 }); // Generous margins for readability
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="property_details_report.pdf"');
        doc.pipe(res);

        // --- PDF Content Generation ---

        // Determine fields to export based on request and user role
        const fieldsToExport = fields.filter(field => {
            if (ADMIN_ONLY_FIELDS.includes(field) && userRole !== ROLES.ADMIN) {
                console.log(`Excluding admin-only field for ${userRole}: ${field}`);
                return false;
            }
            return true;
        });

        if (fieldsToExport.length === 0) {
            doc.fontSize(16).font('Helvetica').text('No fields selected or accessible for your role to export.', { align: 'center' });
            doc.end();
            return;
        }

        // --- Layout Constants ---
        const labelColumnWidth = 200; // Width reserved for the label text
        const valueColumnStart = doc.page.margins.left + labelColumnWidth + 20; // Start of value column
        const valueColumnWidth = doc.page.width - doc.page.margins.right - valueColumnStart; // Remaining width for value

        // Iterate through each property
        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            
            // Add a new page for each property, except the very first property's first page
            if (i > 0) {
                doc.addPage();
            }

            // --- Draw Property Header (only on the first page for this property) ---
            // This entire block only runs once per property (on its first page)
            doc.font('Helvetica-Bold').fontSize(26).text(`Property Details`, { align: 'center' });
            doc.moveDown(0.5);

            if (property.gatNumber) {
                 doc.fontSize(20).text(`(Gat No: ${property.gatNumber})`, { align: 'center' });
                 doc.moveDown(1);
            } else {
                doc.moveDown(1.5);
            }
            
            doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
            doc.moveDown(1);

            // Set initial Y position for content
            let currentY = doc.y;

            // --- Display each field as a key-value pair ---
            for (const field of fieldsToExport) {
                let label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                
                if (label.includes('Plot Rate Nearby')) label = 'Plot Rate Nearby';
                if (label.includes('Agent Mobile Number')) label = 'Agent Mobile Number';
                if (label.includes('Soch Nakasha')) label = 'Soch Nakasha';
                if (label.includes('Photo Upload')) label = 'Photos';
                if (label.includes('Gat Number')) label = 'Gat Number';

                let value = property[field];

                if (Array.isArray(value)) {
                    value = value.map(url => String(url).split('/').pop()).join(', ');
                } else if (typeof value === 'object' && value !== null) {
                    if (field === 'mapLocation' && value.latitude && value.longitude) {
                        value = `Lat: ${value.latitude}, Lng: ${value.longitude}`;
                    } else if (value.toString && value.toString() !== '[object Object]') {
                        value = value.toString();
                    } else {
                        value = JSON.stringify(value);
                    }
                } else if (value === undefined || value === null || value === '') {
                    value = 'N/A';
                }
                
                value = String(value);

                // Calculate estimated height for this field entry
                const labelHeight = doc.heightOfString(label, { width: labelColumnWidth, lineGap: 2, fontSize: 18 });
                const valueHeight = doc.heightOfString(value, { width: valueColumnWidth, lineGap: 2, fontSize: 18 });
                const estimatedLineHeight = Math.max(labelHeight, valueHeight) + 12;

                // Check if current content will fit on page, if not, add new page *within the same property*
                if (currentY + estimatedLineHeight > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    currentY = doc.page.margins.top; // Reset Y for new page
                    
                    // --- IMPORTANT CHANGE HERE: REMOVE CONTINUATION TEXT ---
                    // Instead of a "continued" title, just add a subtle line for visual break
                    doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
                    doc.moveDown(0.75); // Small space after the line
                }

                // Print Label (left-aligned in its column)
                doc.font('Helvetica-Bold').fontSize(18).text(`${label}:`, doc.page.margins.left, currentY, {
                    width: labelColumnWidth,
                    align: 'left',
                    lineGap: 2
                });

                // Print Value (aligned to start after label column)
                doc.font('Helvetica').fontSize(18).text(value, valueColumnStart, currentY, {
                    width: valueColumnWidth,
                    align: 'left',
                    lineGap: 2
                });

                // Move Y cursor down to the bottom of the tallest text (label or value) plus spacing
                const actualLabelHeight = doc.heightOfString(`${label}:`, { width: labelColumnWidth, lineGap: 2, fontSize: 18 });
                const actualValueHeight = doc.heightOfString(value, { width: valueColumnWidth, lineGap: 2, fontSize: 18 });
                currentY += Math.max(actualLabelHeight, actualValueHeight) + 12;
            }

            // Add a footer or page number for current page
            doc.fontSize(10).text(`Page ${doc.page.number}`, doc.page.margins.left, doc.page.height - 30, { align: 'right' });

        } // End of property loop

        doc.end(); // Finalize the PDF
        console.log('PDF generation complete (Property per Page - Clean Continuation).');

    } catch (error) {
        console.error('Error in exportPropertiesPdf (Property per Page - Clean Continuation):', error);
        res.status(500).json({ message: 'Error generating PDF report', error: error.message });
    }
};