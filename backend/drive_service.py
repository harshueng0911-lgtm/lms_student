import os
import io
import json

from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2 import service_account

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]


def get_drive_service():
    try:
        credentials_json = os.getenv("GOOGLE_CREDENTIALS_JSON")

        if not credentials_json:
            raise Exception("GOOGLE_CREDENTIALS_JSON environment variable not found")

        creds_dict = json.loads(credentials_json)

        creds = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=SCOPES
        )

        service = build("drive", "v3", credentials=creds)

        print("✅ Google Drive service initialized")

        return service

    except Exception as e:
        print("❌ DRIVE AUTH ERROR:", str(e))
        raise Exception(f"Drive authentication failed: {str(e)}")


def download_excel(file_id):
    try:
        service = get_drive_service()

        # Check file type
        file_metadata = service.files().get(
            fileId=file_id,
            fields="mimeType"
        ).execute()

        mime_type = file_metadata.get("mimeType")

        print("📄 File MIME type:", mime_type)

        # Handle Google Sheets export
        if mime_type == "application/vnd.google-apps.spreadsheet":
            request = service.files().export_media(
                fileId=file_id,
                mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        else:
            request = service.files().get_media(fileId=file_id)

        # Download file
        file_stream = io.BytesIO()
        downloader = MediaIoBaseDownload(file_stream, request)

        done = False
        while not done:
            _, done = downloader.next_chunk()

        file_stream.seek(0)

        print("✅ File downloaded successfully. Size:", len(file_stream.getvalue()))

        return file_stream

    except Exception as e:
        print("❌ DOWNLOAD ERROR:", str(e))
        raise Exception(f"Failed to download Excel file: {str(e)}")