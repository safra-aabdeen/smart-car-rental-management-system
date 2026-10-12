import emailjs from "@emailjs/browser";

export const sendBookingEmail = async (data) => {
  const targetEmail = data.to_email || data.user_email || data.email || data.userEmail || data.toEmail || data.recipient_email;
  console.log("📧 Sending email via EmailJS with data:", data);
  alert(`Sending email to: ${targetEmail}\nStatus: ${data.status || data.subject}`);
  try {
    const result = await emailjs.send(
      "service_8c2dwyp",
      "template_w6kz91m",
      data,
      "8nIVcpGw1HQizIVhn"
    );

    console.log("✓ EmailJS Result:", result.text);
  } catch (error) {
    console.error("❌ EmailJS Error:", error);
    alert(`EmailJS Error: ${error.text || error.message || error}`);
  }
};