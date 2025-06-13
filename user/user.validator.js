/**
 * Validates user input before storing it in the database.
 * Checks for required fields, data types, value constraints, and proper formats.
 * Throws an error if any validation rules are violated.
 *
 * @function ValidateUserInput
 * @param {Object} user_input - The user input object containing registration or profile data.
 * @param {string} user_input.first_name - Required. The user's first name. Must be a string.
 * @param {string} user_input.last_name - Required. The user's last name. Must be a string.
 * @param {string} user_input.civility - Required. Civility title. Must be one of: "Mr", "Mrs".
 * @param {string} [user_input.office_phone] - Optional. Office phone number. Maximum 12 characters.
 * @param {string} [user_input.direct_line] - Optional. Direct line phone number. Maximum 12 characters.
 * @param {string} user_input.mobile_phone - Required. Mobile phone number. Maximum 12 characters.
 * @param {string} user_input.entity - Required. User's entity. Must be one of: "ADMTC", "Academic", "Company".
 * @param {Array<Object>} user_input.address - Required. Must be a non-empty array of address objects.
 * Each address must contain `street`, `city`, `province`, and `postal_code`.
 * @param {string} user_input.email - Required. Must be a valid email address.
 * @param {string} user_input.password - Required. Minimum 6 characters.
 * @param {string} user_input.role - Required. User's role. Must be a string.
 *
 * @throws {Error} Throws a combined error message if any validation rule fails.
 */
function ValidateUserInput(user_input) {
  // *************** Variable to contain error
  const error = [];

  // *************** validate user first_name
  if (!user_input.first_name || typeof user_input.first_name !== 'string') {
    // *************** error message if the input not valid
    error.push('first name is required and must be string');
  }

  // *************** validate user last_name
  if (!user_input.last_name || typeof user_input.last_name !== 'string') {
    // *************** error message if the input not valid
    error.push('last name is required and must be string');
  }

  // *************** set value of civilities
  const civilities = ['Mr', 'Mrs'];
  // *************** validate user civility
  if (!user_input.civility || !civilities.includes(user_input.civility)) {
    // *************** error message if the input not valid
    error.push(`Civility must be one of: ${civilities.join(', ')}`);
  }

  // *************** validate user office_phone
  if (user_input.office_phone && user_input.office_phone.length > 12) {
    // *************** error message if the input not valid
    error.push('Office phone cannot exceed 12 characters.');
  }

  // *************** validate user direct_line
  if (user_input.direct_line && user_input.direct_line.length > 12) {
    // *************** error message if the input not valid
    error.push('Direct line cannot exceed 12 characters.');
  }

  // *************** validate user mobile_phone
  if (!user_input.mobile_phone || user_input.mobile_phone.length > 12) {
    // *************** error message if the input not valid
    error.push('Mobile phone is required and must not exceed 12 characters.');
  }

  // *************** set value of entity
  const entities = ['ADMTC', 'Academic', 'Company'];
  // *************** validate user entitiy
  if (!user_input.entity || !entities.includes(user_input.entity)) {
    // *************** error message if the input not valid
    error.push(`Entity must be one of: ${entities.join(', ')}`);
  }

  // *************** validate user address
  if (!Array.isArray(user_input.address) || user_input.address.length === 0) {
    // *************** error message if the input not valid
    error.push('Address is required.');
  } else {
    // *************** validate each address array
    user_input.address.forEach((addr, idx) => {
      if (!addr.street || !addr.city || !addr.province || !addr.postal_code) {
        // *************** error message if the input not valid
        error.push(`Address at index ${idx} is missing required fields.`);
      }
    });
  }

  // *************** validate user email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user_input.email || !emailRegex.test(user_input.email)) {
    // *************** error message if the input not valid
    error.push('A valid email is required.');
  }

  // *************** validate user password
  if (!user_input.password || user_input.password.length < 6) {
    // *************** error message if the input not valid
    error.push('Password is required and must be at least 6 characters.');
  }

  // *************** validate user role
  if (!user_input.role || typeof user_input.role !== 'string') {
    // *************** error message if the input not valid
    error.push('Role is required.');
  }

  // *************** checking if there's error message
  if (error.length > 0) {
    throw new Error(error.join(' '));
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateUserInput };
