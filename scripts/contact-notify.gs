
const OWNER_EMAIL = "prithivirajb26@gmail.com";
const OWNER_NAME = "Prithiviraj B";

function notifyOnMessage(e) {
  if (!e || !e.namedValues) {
    throw new Error(
      "Submit the linked Google Form to trigger this function."
    );
  }

  const values = e.namedValues;

  const note = {
    when: getValue(values, "Timestamp"),
    name: getValue(values, "Your name"),
    email: getValue(values, "Your email"),
    topic: getValue(values, "What is this about?"),
    message: getValue(values, "Message")
  };

  if (!note.email && !note.message) return;

  mailOwner(note);

  if (isEmail(note.email)) {
    mailSender(note);
  }
}

function authorize() {
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: "Portfolio mail is connected",
    body: "Your portfolio contact form email notifications are authorized."
  });
}

function mailOwner(note) {
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    replyTo: isEmail(note.email) ? note.email : OWNER_EMAIL,
    subject: "Portfolio message from " + (note.name || "someone"),
    body: [
      "A new message was received through your portfolio.",
      "",
      "When: " + note.when,
      "Name: " + note.name,
      "Email: " + note.email,
      "About: " + note.topic,
      "",
      "Message:",
      note.message
    ].join("\n")
  });
}

function mailSender(note) {
  MailApp.sendEmail({
    to: note.email,
    name: OWNER_NAME,
    subject: "I received your message",
    body: [
      "Hello " + (note.name || "there") + ",",
      "",
      "Thank you for contacting me through my portfolio.",
      "This email confirms that I received your message.",
      "",
      "About: " + note.topic,
      "",
      "Your message:",
      note.message,
      "",
      "I will reply if a response is needed.",
      "",
      OWNER_NAME
    ].join("\n")
  });
}

function getValue(values, key) {
  const value = values[key];
  return Array.isArray(value) ? value.join(", ") : (value || "");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
}
