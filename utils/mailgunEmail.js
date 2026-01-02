const FormData = require('form-data');
const Mailgun = require('mailgun.js');

exports.sendSimpleMessage = async (subject, text, user) => {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });
  try {
    const data = await mg.messages.create(process.env.MAILGUN_SANDBOX_DOMAIN, {
      from: 'Mailgun Sandbox <postmaster@sandboxd0dfd43624b94df0a2bc9c902f6634eb.mailgun.org>',
      to: [`${user.name} <${user.email}>`],
      subject,
      text,
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
};
