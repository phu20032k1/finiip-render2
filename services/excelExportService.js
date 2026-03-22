const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function inferType(value) {
  return typeof value === 'number' && Number.isFinite(value) ? 'Number' : 'String';
}

function cellXml(value) {
  const type = inferType(value);
  return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

function rowXml(row = []) {
  return `<Row>${row.map(cellXml).join('')}</Row>`;
}

function worksheetXml(name, rows) {
  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${rows.map(rowXml).join('')}</Table></Worksheet>`;
}

function workbookXml(sheets) {
  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${sheets.map(sheet => worksheetXml(sheet.name, sheet.rows)).join('\n')}
</Workbook>`;
}

function ensureOutputDir() {
  const dir = path.join(__dirname, '..', 'generated_reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function exportWorkbookXml(filename, sheets) {
  const outputDir = ensureOutputDir();
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, workbookXml(sheets), 'utf8');
  return filePath;
}

function exportWorkbookXlsx(filename, sheets) {
  const outputDir = ensureOutputDir();
  const filePath = path.join(outputDir, filename);
  const tempPayload = path.join(os.tmpdir(), `xlsx_payload_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
  const helper = path.join(__dirname, '..', 'scripts', 'xlsx_helper.py');
  fs.writeFileSync(tempPayload, JSON.stringify({ output: filePath, sheets }, null, 2), 'utf8');
  const result = spawnSync('python3', [helper, 'write', tempPayload], { encoding: 'utf8' });
  try { fs.unlinkSync(tempPayload); } catch (_) {}
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'Không xuất được file xlsx').trim());
  }
  return filePath;
}

function exportWorkbook(filename, sheets, options = {}) {
  const format = (options.format || path.extname(filename).replace('.', '') || 'xlsx').toLowerCase();
  if (format === 'xlsx') return exportWorkbookXlsx(filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`, sheets);
  return exportWorkbookXml(filename.endsWith('.xls') ? filename : `${filename}.xls`, sheets);
}

module.exports = { exportWorkbook, exportWorkbookXml, exportWorkbookXlsx };
