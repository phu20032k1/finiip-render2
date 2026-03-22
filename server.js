const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const answerQuestion = require('./services/answerQuestion');
const { getChatReply } = require('./services/chatOrchestrator');
const { importTransactionsFromFile } = require('./services/importService');
const { buildAccountingReport } = require('./services/reportingService');
const { analyzeExcelFile } = require('./services/excelAnalysisService');

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    cb(null, safeName);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/generated_reports', express.static(path.join(__dirname, 'generated_reports')));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/ask', (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }
    const result = answerQuestion(question);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { question, text, history = [], excelContext = null } = req.body || {};
    const payload = question || text;
    if (!payload || typeof payload !== 'string') {
      return res.status(400).json({ error: 'question is required' });
    }
    const result = await getChatReply({ question: payload, history, excelContext });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'Bạn chưa tải file lên.' });
    }
    const result = analyzeExcelFile(req.file.path);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.post('/import-file', (req, res) => {
  try {
    const { filePath, exportExcel = false, exportFormat = 'xlsx' } = req.body || {};
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'filePath is required' });
    }
    const imported = importTransactionsFromFile(filePath);
    const report =
      imported.importMode !== 'transactions'
        ? buildAccountingReport('', {
            exportExcel,
            exportFormat,
            records: imported.records,
            entries: imported.templateJournal.entries,
            importIssues: imported.templateJournal.issues
          })
        : buildAccountingReport(
            `danh sach nghiep vu:\n${imported.transactions.join('\n')}`,
            { exportExcel, exportFormat, records: imported.records }
          );
    return res.json({
      ok: true,
      file: imported,
      exportPath: report.exportPath,
      answer: report.answer,
      statements: report.statements,
      subledgers: report.subledgers,
      discrepancies: report.discrepancies
    });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
