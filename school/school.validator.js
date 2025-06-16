/**
 * Validates school input before saving to the database.
 * Ensures required fields such as school name and address are present and properly formatted.
 * Throws an error containing validation messages if any rule is violated.
 *
 * @function ValidateSchoolInput
 * @param {Object} school_input - The input data for a school.
 * @param {string} school_input.school_legal_name - Required. The official legal name of the school. Must be a string.
 * @param {string} school_input.school_commercial_name - Required. The commercial or commonly used name of the school. Must be a string.
 * @param {Array<Object>} school_input.address - Required. At least one address object must be present.
 * Each address must include `street`, `city`, `province`, and `postal_code`.
 *
 * @throws {Error} Throws an error if any validation rule fails, with a message listing all validation issues.
 */
function ValidateSchoolInput(school_input) {
  // *************** Variable to contain error
  const error = [];

  // *************** validate school school_legal_name
  if (
    !school_input.school_legal_name ||
    typeof school_input.school_legal_name !== 'string'
  ) {
    // *************** error message if the input not valid
    error.push('school legal name is required and must be string');
  }

  // *************** validate school school_commercial_name
  if (
    !school_input.school_commercial_name ||
    typeof school_input.school_commercial_name !== 'string'
  ) {
    // *************** error message if the input not valid
    error.push('school commercial name is required and must be string');
  }

  // *************** validate school address
  if (
    !Array.isArray(school_input.address) ||
    school_input.address.length === 0
  ) {
    // *************** error message if the input not valid
    error.push('Address is required.');
  } else {
    // *************** validate each address array
    school_input.address.forEach((addr) => {
      const invalidAddressComponent = [];

      if (typeof addr.street !== 'string' || addr.street.trim() === '')
        invalidAddressComponent.push('street');
      if (typeof addr.city !== 'string' || addr.city.trim() === '')
        invalidAddressComponent.push('city');
      if (typeof addr.province !== 'string' || addr.province.trim() === '')
        invalidAddressComponent.push('province');
      if (
        typeof addr.postal_code !== 'string' ||
        addr.postal_code.trim() === ''
      )
        invalidAddressComponent.push('postal_code');

      if (invalidAddressComponent.length > 0) {
        error.push(
          `Address at ${invalidAddressComponent.join(', ')} not valid`
        );
      }
    });
  }

  // *************** checking if there's error message
  if (error.length > 0) {
    throw new Error(error.join(' '));
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateSchoolInput };
