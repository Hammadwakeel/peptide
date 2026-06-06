import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import SMTP_EMAIL, SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT


def _send_email(to_email: str, subject: str, text: str, html: str) -> None:
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = SMTP_FROM
    message["To"] = to_email
    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, to_email, message.as_string())


def send_otp_email(to_email: str, otp_code: str) -> None:
    text = f"Your Frontier Nexus Rx verification code is: {otp_code}\n\nThis code expires in 10 minutes."
    html = f"""
    <html><body>
      <p>Your Frontier Nexus Rx verification code is:</p>
      <h2 style="letter-spacing:4px;">{otp_code}</h2>
      <p>This code expires in 10 minutes. Do not share it with anyone.</p>
    </body></html>
    """
    _send_email(to_email, "Frontier Nexus Rx — Your verification code", text, html)


def send_credentials_email(to_email: str, password: str, role_label: str) -> None:
    text = (
        f"Your Frontier Nexus Rx {role_label} account has been approved.\n\n"
        f"Email: {to_email}\n"
        f"Password: {password}\n\n"
        f"Please log in and change your password after first sign-in."
    )
    html = f"""
    <html><body>
      <p>Your Frontier Nexus Rx <strong>{role_label}</strong> account is ready.</p>
      <p><strong>Email:</strong> {to_email}</p>
      <p><strong>Password:</strong> {password}</p>
      <p>Please log in and change your password after your first sign-in.</p>
    </body></html>
    """
    _send_email(to_email, f"Frontier Nexus Rx — Your {role_label} account credentials", text, html)


def send_patient_invite_email(
    to_email: str,
    invite_link: str,
    doctor_name: str,
    clinic_name: str,
) -> None:
    text = (
        f"{doctor_name} at {clinic_name} has invited you to Frontier Nexus Rx.\n\n"
        f"Accept your invitation: {invite_link}\n\n"
        f"Enter your email to activate your account. A password will be sent automatically."
    )
    html = f"""
    <html><body>
      <p><strong>{doctor_name}</strong> at <strong>{clinic_name}</strong> has invited you
      to join their patient portal.</p>
      <p><a href="{invite_link}">Accept Invitation</a></p>
      <p>Enter your email to activate your account. Your password will be emailed automatically.</p>
    </body></html>
    """
    _send_email(to_email, "Frontier Nexus Rx — Patient Invitation", text, html)


def send_password_reset_email(to_email: str, new_password: str) -> None:
    text = (
        f"Your Frontier Nexus Rx password has been updated.\n\n"
        f"Email: {to_email}\n"
        f"New password: {new_password}\n\n"
        f"Please log in and change your password."
    )
    html = f"""
    <html><body>
      <p>Your Frontier Nexus Rx password has been updated by an administrator.</p>
      <p><strong>Email:</strong> {to_email}</p>
      <p><strong>New password:</strong> {new_password}</p>
    </body></html>
    """
    _send_email(to_email, "Frontier Nexus Rx — Password Updated", text, html)
