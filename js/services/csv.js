/** RFC-4180 CSV output with spreadsheet-formula injection protection.
 * Strings beginning with = + - @, including leading whitespace/control
 * characters, are forced to text. Numeric values retain their numeric type.
 */
export function encodeCsvCell(value) {
  let cell = String(value ?? '');
  if (typeof value === 'string' && /^[\u0000-\u0020]*[=+\-@]/.test(cell)) cell = "'" + cell;
  return '"' + cell.replaceAll('"', '""') + '"';
}

export function encodeCsvRows(rows) {
  if (!Array.isArray(rows)) throw new TypeError('CSV rows must be an array');
  return '\ufeff' + rows.map(row => row.map(encodeCsvCell).join(',')).join('\r\n') + '\r\n';
}
