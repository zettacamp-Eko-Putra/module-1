// *************** IMPORT LIBRARY ***************
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using the configured SendGrid mail client.
 * Formats the body as plain text and HTML (inside `<pre>` tag).
 *
 * @async
 * @function sendEmail
 * @param {string} to - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} bodyText - Plain text body of the email.
 * @returns {Promise<void>} - Resolves when email is sent or logs an error on failure.
 *
 * @throws {Error} - Will not throw but logs the error if email sending fails.
 */
async function SendEmail(to, subject, bodyText) {
  // *************** Construct the email message object
  const msg = {
    to,
    from: process.env.EMAIL_SENDER,
    subject,
    text: bodyText,
    html: `<pre>${bodyText}</pre>`,
  };

  try {
    // *************** send the email using SendGrid
    await sgMail.send(msg);
    // *************** message if email has been send
    console.log('Email success send to:', to);
  } catch (error) {
    // *************** message if email failed to send
    console.error(
      'failed send email:',
      error.response && error.response.body ? error.response.body : error
    );
  }
}

// *************** EXPORT MODULE ***************
module.exports = SendEmail;
