import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = await req.formData();

    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const phone = formData.get('phone') || 'Not provided';
    const role = formData.get('role');
    const linkedin = formData.get('linkedin') || 'Not provided';
    const message = formData.get('message') || 'No additional message';
    
    const cvFile = formData.get('cv'); 

    let attachments = [];
    if (cvFile && cvFile.name) {
      const arrayBuffer = await cvFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      attachments.push({
        filename: cvFile.name,
        content: buffer,
      });
    }

    const data = await resend.emails.send({
      from: 'ABZEMO Careers <career@abzemo.com>',
      to: ['career@abzemo.com'],
      replyTo: email,
      subject: `New Job Application: ${fullName} - ${role}`,
      html: `
        <h2>New Career Application Received</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Role of Interest:</strong> ${role}</p>
        <p><strong>LinkedIn Profile:</strong> ${linkedin}</p>
        <br/>
        <p><strong>Short Introduction:</strong></p>
        <p>${message}</p>
      `,
      attachments: attachments
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ error: 'Failed to send application email' });
  }
}
