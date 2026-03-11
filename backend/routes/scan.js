const express = require('express');
const auth = require('../middleware/auth');
const { runFullScan } = require('../utils/awsScanner');

const router = express.Router();

// In-memory scan results store (keyed by user ID)
const scanResults = {};

// POST /api/scan — Run a new security scan
router.post('/', auth, async (req, res) => {
  try {
    const { accessKey, secretKey, region, scanDepth } = req.body;

    if (!accessKey || !secretKey || !region) {
      return res.status(400).json({ error: 'AWS Access Key, Secret Key, and Region are required.' });
    }

    console.log(`[SCAN] User ${req.user.email} starting ${scanDepth || 'standard'} scan in ${region}`);

    const result = await runFullScan(accessKey, secretKey, region);

    // Store results for this user
    scanResults[req.user.id] = {
      ...result,
      scanDepth: scanDepth || 'standard',
      userId: req.user.id,
    };

    console.log(`[SCAN] Completed: ${result.findings.length} findings for user ${req.user.email}`);

    res.json({
      message: 'Scan completed successfully.',
      findings: result.findings,
      summary: result.summary,
    });
  } catch (error) {
    console.error('[SCAN] Error:', error.message);
    res.status(500).json({ error: `Scan failed: ${error.message}` });
  }
});

// GET /api/scan/results — Get latest scan results
router.get('/results', auth, (req, res) => {
  const results = scanResults[req.user.id];
  if (!results) {
    return res.status(404).json({ error: 'No scan results found. Run a scan first.' });
  }
  res.json(results);
});

// Export for use by report routes
router.getScanResults = (userId) => scanResults[userId];

module.exports = router;
