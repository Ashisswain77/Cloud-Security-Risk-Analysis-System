const express = require('express');
const auth = require('../middleware/auth');
const { generateCSV, generatePDF } = require('../utils/reportGenerator');
const scanRoutes = require('./scan');

const router = express.Router();

// POST /api/report/csv — Generate CSV report
router.post('/csv', auth, (req, res) => {
  try {
    const { findings, summary } = req.body;

    if (!findings || !summary) {
      return res.status(400).json({ error: 'Findings and summary are required.' });
    }

    const csv = generateCSV(findings, summary);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=shadowguard-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('[REPORT] CSV error:', error.message);
    res.status(500).json({ error: 'Failed to generate CSV report.' });
  }
});

// POST /api/report/pdf — Generate PDF report
router.post('/pdf', auth, async (req, res) => {
  try {
    const { findings, summary } = req.body;

    if (!findings || !summary) {
      return res.status(400).json({ error: 'Findings and summary are required.' });
    }

    const pdfBuffer = await generatePDF(findings, summary);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=shadowguard-report.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[REPORT] PDF error:', error.message);
    res.status(500).json({ error: 'Failed to generate PDF report.' });
  }
});

module.exports = router;
