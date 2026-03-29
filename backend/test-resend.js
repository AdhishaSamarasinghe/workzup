require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || "re_Dfu4r6L5_DKDX6mQMNfddEvA52aAc1kz2");

async function test() {
  console.log("Using API Key:", "re_Dfu4r6L5_DKDX6mQMNfddEvA52aAc1kz2");
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'sharahasanjan@gmail.com',
      subject: 'Test Email',
      html: '<p>Test.</p>',
    });
    
    if (error) {
      console.error("Resend Error:", error);
    } else {
      console.log("Success:", data);
    }
  } catch (err) {
    console.error("Catch Error:", err);
  }
}

test();
