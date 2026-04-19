import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const ownerNotificationEmail = process.env.OWNER_NOTIFICATION_EMAIL;

if (!resendApiKey) {
  throw new Error("Missing RESEND_API_KEY.");
}

if (!ownerNotificationEmail) {
  throw new Error("Missing OWNER_NOTIFICATION_EMAIL.");
}

const resend = new Resend(resendApiKey);
const ownerEmail: string = ownerNotificationEmail;

const FROM_EMAIL = "Christina Massage <buchung@christina-massage.com>";
const REPLY_TO_EMAIL = "christina.massage.fdm@gmail.com";

type BookingMailData = {
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price?: number;
};

export async function sendCustomerBookingRequestEmail(data: BookingMailData) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    replyTo: REPLY_TO_EMAIL,
    subject:
      "Buchungsanfrage erhalten – Christina Massage | Foglalási kérés megérkezett",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>Vielen Dank für deine Buchungsanfrage 🌿</h2>
        <p>Hallo ${data.name},</p>
        <p>deine Buchungsanfrage ist bei Christina Massage eingegangen.</p>

        <p>
          <strong>Behandlung:</strong> ${data.service}<br />
          <strong>Datum:</strong> ${data.date}<br />
          <strong>Uhrzeit:</strong> ${data.time}<br />
          <strong>Dauer:</strong> ${data.duration} Minuten<br />
          <strong>Preis:</strong> ${data.price ?? "-"} €
        </p>

        <p>Du erhältst eine weitere E-Mail, sobald dein Termin bestätigt wurde.</p>

        <hr style="margin: 30px 0;" />

        <h2>Köszönjük a foglalási kérésedet 🌿</h2>
        <p>Kedves ${data.name},</p>
        <p>A foglalási kérelmed megérkezett a Christina Massage oldalára.</p>

        <p>
          <strong>Kezelés:</strong> ${data.service}<br />
          <strong>Dátum:</strong> ${data.date}<br />
          <strong>Időpont:</strong> ${data.time}<br />
          <strong>Időtartam:</strong> ${data.duration} perc<br />
          <strong>Ár:</strong> ${data.price ?? "-"} €
        </p>

        <p>Hamarosan újabb emailt kapsz, amint az időpontodat visszaigazoltuk.</p>

        <hr style="margin: 30px 0;" />

        <p style="font-size: 12px; color: #666;">
          Christina Massage • Offizielle Terminbenachrichtigung
        </p>
      </div>
    `,
  });
}

export async function sendOwnerNewBookingEmail(data: BookingMailData) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ownerEmail,
    replyTo: REPLY_TO_EMAIL,
    subject: "Neue Buchungsanfrage eingegangen",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>Neue Buchungsanfrage 🌿</h2>

        <p>
          <strong>Name:</strong> ${data.name}<br />
          <strong>E-Mail:</strong> ${data.email}<br />
          <strong>Behandlung:</strong> ${data.service}<br />
          <strong>Datum:</strong> ${data.date}<br />
          <strong>Uhrzeit:</strong> ${data.time}<br />
          <strong>Dauer:</strong> ${data.duration} Minuten<br />
          <strong>Preis:</strong> ${data.price ?? "-"} €
        </p>
      </div>
    `,
  });
}

export async function sendCustomerConfirmedEmail(data: BookingMailData) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    replyTo: REPLY_TO_EMAIL,
    subject:
      "Dein Termin wurde bestätigt – Christina Massage | Az időpontod visszaigazolva",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>Dein Termin wurde bestätigt 🌿</h2>
        <p>Hallo ${data.name},</p>
        <p>dein Termin bei Christina Massage wurde bestätigt.</p>

        <p>
          <strong>Behandlung:</strong> ${data.service}<br />
          <strong>Datum:</strong> ${data.date}<br />
          <strong>Uhrzeit:</strong> ${data.time}<br />
          <strong>Dauer:</strong> ${data.duration} Minuten
        </p>

        <hr style="margin: 30px 0;" />

        <h2>Az időpontod visszaigazolva 🌿</h2>
        <p>Kedves ${data.name},</p>
        <p>A Christina Massage oldalon lefoglalt időpontod visszaigazolásra került.</p>

        <p>
          <strong>Kezelés:</strong> ${data.service}<br />
          <strong>Dátum:</strong> ${data.date}<br />
          <strong>Időpont:</strong> ${data.time}<br />
          <strong>Időtartam:</strong> ${data.duration} perc
        </p>
      </div>
    `,
  });
}

export async function sendCustomerCancelledEmail(data: BookingMailData) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    replyTo: REPLY_TO_EMAIL,
    subject:
      "Dein Termin wurde storniert – Christina Massage | Az időpontod törölve",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>Dein Termin wurde storniert</h2>
        <p>Hallo ${data.name},</p>
        <p>dein Termin bei Christina Massage wurde storniert.</p>

        <p>
          <strong>Behandlung:</strong> ${data.service}<br />
          <strong>Datum:</strong> ${data.date}<br />
          <strong>Uhrzeit:</strong> ${data.time}<br />
          <strong>Dauer:</strong> ${data.duration} Minuten
        </p>

        <hr style="margin: 30px 0;" />

        <h2>Az időpontod törölve</h2>
        <p>Kedves ${data.name},</p>
        <p>A Christina Massage oldalon lefoglalt időpontod törölve lett.</p>

        <p>
          <strong>Kezelés:</strong> ${data.service}<br />
          <strong>Dátum:</strong> ${data.date}<br />
          <strong>Időpont:</strong> ${data.time}<br />
          <strong>Időtartam:</strong> ${data.duration} perc
        </p>
      </div>
    `,
  });
}