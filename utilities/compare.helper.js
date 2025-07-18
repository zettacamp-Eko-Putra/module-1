/**
 * Function: Compare
 * Purpose: Evaluate a comparison between a mark and a minimum mark using the specified operator.
 *
 * @param {string} operator - The comparison operator ('GREATER_THAN' or 'GREATER_THAN_OR_EQUAL').
 * @param {number} mark - The actual mark to be compared.
 * @param {number} minMark - The minimum threshold mark for comparison.
 * @returns {boolean} - Returns true if the condition is met, otherwise false.
 */
function Compare(operator, mark, minMark) {
  switch (operator) {
    case 'GREATER_THAN':
      return mark > minMark;
    case 'GREATER_THAN_OR_EQUAL':
      return mark >= minMark;
    default:
      return false;
  }
}

// *************** EXPORT MODULE ***************
module.exports = Compare;
