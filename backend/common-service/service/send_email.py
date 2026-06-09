import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(SERVICE_DIR / ".env", override=True)


class EmailService:
    """SMTP email sender for plain-text and HTML messages."""

    def __init__(
        self,
        host: str | None = None,
        port: int | None = None,
        email: str | None = None,
        password: str | None = None,
        sender: str | None = None,
    ):
        self.host = host or os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.port = port or int(os.getenv("SMTP_PORT", "587"))
        self.email = email or os.getenv("SMTP_EMAIL", "")
        self.password = password or os.getenv("SMTP_PASSWORD", "")
        self.sender = sender or os.getenv("SMTP_FROM", self.email)

    def send(
        self,
        to_email: str,
        subject: str,
        text: str,
        html: str | None = None,
    ) -> None:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = self.sender
        message["To"] = to_email
        message.attach(MIMEText(text, "plain"))
        if html:
            message.attach(MIMEText(html, "html"))

        with smtplib.SMTP(self.host, self.port) as server:
            server.starttls()
            server.login(self.email, self.password)
            server.sendmail(self.sender, to_email, message.as_string())
