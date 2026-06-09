import sys
from pathlib import Path

from config import FRONTEND_URL

COMMON_SERVICE_DIR = Path(__file__).resolve().parent.parent / "common-service"
sys.path.insert(0, str(COMMON_SERVICE_DIR))

from service.send_email import EmailService  # noqa: E402

_email = EmailService()


def _send_email(to_email: str, subject: str, text: str, html: str) -> None:
    _email.send(to_email, subject, text, html)


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


def send_application_rejection_email(to_email: str, clinic_name: str, reason: str) -> None:
    text = (
        f"Dear {clinic_name} team,\n\n"
        f"Thank you for applying to Frontier Nexus Rx. After review, your clinic application "
        f"was not approved at this time.\n\n"
        f"Reason: {reason}\n\n"
        f"If you believe this was made in error or would like to reapply with updated "
        f"information, please contact Frontier Nexus Rx support."
    )
    html = f"""
    <html><body>
      <p>Dear <strong>{clinic_name}</strong> team,</p>
      <p>Thank you for applying to Frontier Nexus Rx. After review, your clinic application
      was <strong>not approved</strong> at this time.</p>
      <p><strong>Reason:</strong> {reason}</p>
      <p>If you believe this was made in error or would like to reapply with updated
      information, please contact Frontier Nexus Rx support.</p>
    </body></html>
    """
    _send_email(to_email, "Frontier Nexus Rx — Clinic Application Not Approved", text, html)


def send_application_approved_email(
    to_email: str,
    clinic_name: str,
    *,
    password: str | None = None,
) -> None:
    login_url = f"{FRONTEND_URL}/login"
    if password:
        creds_text = (
            f"Email: {to_email}\n"
            f"Temporary password: {password}\n\n"
            f"Please log in and change your password after your first sign-in."
        )
        creds_html = (
            f"<p><strong>Email:</strong> {to_email}</p>"
            f"<p><strong>Temporary password:</strong> {password}</p>"
            f"<p>Please log in and change your password after your first sign-in.</p>"
        )
    else:
        creds_text = (
            f"Log in with the email and password you provided during your application.\n"
        )
        creds_html = (
            "<p>Log in with the email and password you provided during your application.</p>"
        )

    text = (
        f"Dear {clinic_name} team,\n\n"
        f"Congratulations! Your clinic application has been approved.\n\n"
        f"Your provider portal and storefront are now active.\n\n"
        f"{creds_text}\n"
        f"Login: {login_url}\n\n"
        f"Welcome to Frontier Nexus Rx."
    )
    html = f"""
    <html><body>
      <p>Dear <strong>{clinic_name}</strong> team,</p>
      <p>Congratulations! Your clinic application has been <strong>approved</strong>.</p>
      <p>Your provider portal and storefront are now active.</p>
      {creds_html}
      <p><a href="{login_url}">Log in to your provider portal</a></p>
      <p>Welcome to Frontier Nexus Rx.</p>
    </body></html>
    """
    _send_email(to_email, "Frontier Nexus Rx — Clinic Application Approved", text, html)


def send_set_password_email(
    to_email: str,
    recipient_name: str,
    setup_link: str,
    *,
    context: str = "account",
) -> None:
    if context == "clinic":
        intro = (
            f"Dear {recipient_name} team,\n\n"
            f"Congratulations! Your clinic application has been approved.\n\n"
            f"To activate your provider portal, set your account password using the secure "
            f"link below:"
        )
        intro_html = (
            f"<p>Dear <strong>{recipient_name}</strong> team,</p>"
            f"<p>Congratulations! Your clinic application has been <strong>approved</strong>.</p>"
            f"<p>To activate your provider portal, set your account password using the secure "
            f"link below:</p>"
        )
    else:
        intro = (
            f"Hello,\n\n"
            f"Your Frontier Nexus Rx {recipient_name} account has been created.\n\n"
            f"Set your password using the secure link below:"
        )
        intro_html = (
            f"<p>Your Frontier Nexus Rx <strong>{recipient_name}</strong> account has been created.</p>"
            f"<p>Set your password using the secure link below:</p>"
        )

    text = (
        f"{intro}\n\n"
        f"{setup_link}\n\n"
        f"For your security, this link can only be used once and will expire soon. "
        f"If it expires, contact Frontier Nexus Rx support to request a new link."
    )
    html = f"""
    <html><body>
      {intro_html}
      <p><a href="{setup_link}">Set your password</a></p>
      <p>For your security, this link can only be used once and will expire soon.
      If it expires, contact Frontier Nexus Rx support to request a new link.</p>
    </body></html>
    """
    _send_email(to_email, "Frontier Nexus Rx — Set Your Password", text, html)


def send_affiliate_credentials_email(
    to_email: str,
    password: str,
    affiliate_code: str,
    affiliate_type: str,
) -> None:
    login_url = f"{FRONTEND_URL}/login"
    type_label = "Main Affiliate" if affiliate_type == "main" else "Sub-Affiliate"
    text = (
        f"Your Frontier Nexus Rx {type_label} account has been created.\n\n"
        f"Email: {to_email}\n"
        f"Password: {password}\n"
        f"Affiliate code: {affiliate_code}\n\n"
        f"Login: {login_url}\n\n"
        f"Share your affiliate code with clinics to track referrals."
    )
    html = f"""
    <html><body>
      <p>Your Frontier Nexus Rx <strong>{type_label}</strong> account has been created.</p>
      <p><strong>Email:</strong> {to_email}</p>
      <p><strong>Password:</strong> {password}</p>
      <p><strong>Affiliate code:</strong> {affiliate_code}</p>
      <p><a href="{login_url}">Log in to the affiliate portal</a></p>
      <p>Share your affiliate code with clinics to track referrals.</p>
    </body></html>
    """
    _send_email(to_email, f"Frontier Nexus Rx — Your {type_label} Account", text, html)


def send_more_info_request_email(to_email: str, clinic_name: str, admin_note: str) -> None:
    text = (
        f"Additional information is needed for your clinic application ({clinic_name}).\n\n"
        f"Admin note: {admin_note}\n\n"
        f"Please resubmit the requested documents to continue your application."
    )
    html = f"""
    <html><body>
      <p>Additional information is needed for your clinic application
      (<strong>{clinic_name}</strong>).</p>
      <p><strong>Admin note:</strong> {admin_note}</p>
      <p>Please resubmit the requested documents to continue your application.</p>
    </body></html>
    """
    _send_email(to_email, "Frontier Nexus Rx — Application Needs More Information", text, html)


def send_welcome_email(to_email: str, clinic_name: str) -> None:
    text = (
        f"Welcome to Frontier Nexus Rx, {clinic_name}!\n\n"
        f"Your clinic application has been approved. You can now log in with the email "
        f"and password you provided during signup.\n\n"
        f"Your storefront is active with default branding."
    )
    html = f"""
    <html><body>
      <p>Welcome to Frontier Nexus Rx, <strong>{clinic_name}</strong>!</p>
      <p>Your clinic application has been approved. Log in with the email and password
      you provided during signup.</p>
      <p>Your storefront is active with default branding.</p>
    </body></html>
    """
    _send_email(to_email, "Frontier Nexus Rx — Welcome to the Provider Portal", text, html)


def send_doctor_referral_invite_email(
    to_email: str,
    affiliate_code: str,
    referral_link: str,
) -> None:
    text = (
        f"You have been invited to join Frontier Nexus Rx as a clinic provider.\n\n"
        f"Use affiliate code: {affiliate_code}\n"
        f"Or apply directly: {referral_link}\n\n"
        f"Complete the clinic application to get started."
    )
    html = f"""
    <html><body>
      <p>You have been invited to join <strong>Frontier Nexus Rx</strong> as a clinic provider.</p>
      <p><strong>Affiliate code:</strong> {affiliate_code}</p>
      <p><a href="{referral_link}">Start clinic application</a></p>
      <p>Complete the application to get started.</p>
    </body></html>
    """
    _send_email(to_email, "Frontier Nexus Rx — Clinic Provider Invitation", text, html)


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
