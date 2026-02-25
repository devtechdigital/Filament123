const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://filament.home";

export function nfcSupported() {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

export async function writeSpoolTag(spoolId: string) {
  if (!nfcSupported()) {
    throw new Error("Web NFC is not supported on this browser/device.");
  }

  const reader = new NDEFReader();
  const targetUrl = `${BASE_URL.replace(/\/$/, "")}/spool/${spoolId}`;

  await reader.write({
    records: [
      { recordType: "url", data: targetUrl },
      { recordType: "text", data: spoolId },
    ],
  });

  return targetUrl;
}

function decodeRecordText(record: NDEFRecord) {
  if (!record.data) return null;
  try {
    return new TextDecoder(record.encoding ?? "utf-8").decode(record.data as BufferSource);
  } catch {
    return null;
  }
}

export function extractSpoolIdFromNfcMessage(message: NDEFMessage): string | null {
  let fallbackText: string | null = null;

  for (const record of message.records) {
    if (record.recordType === "url") {
      const urlText = decodeRecordText(record);
      if (!urlText) continue;
      try {
        const url = new URL(urlText);
        const match = url.pathname.match(/^\/spool\/([0-9A-HJKMNP-TV-Z]{26})$/i);
        if (match) return match[1];
      } catch {
        continue;
      }
    }

    if (record.recordType === "text") {
      fallbackText = decodeRecordText(record)?.trim() ?? null;
    }
  }

  if (fallbackText && /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(fallbackText)) {
    return fallbackText;
  }

  return null;
}
