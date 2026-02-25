interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
  serialNumber?: string;
}

interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: BufferSource;
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

interface NDEFReader {
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  write(data: string | NDEFMessageInit, options?: NDEFWriteOptions): Promise<void>;
  addEventListener(
    type: "reading",
    listener: (this: NDEFReader, ev: NDEFReadingEvent) => unknown,
  ): void;
  addEventListener(
    type: "readingerror",
    listener: (this: NDEFReader, ev: Event) => unknown,
  ): void;
}

declare interface NDEFRecordInit {
  recordType: string;
  data?: string | BufferSource;
}

declare interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

declare const NDEFReader: {
  prototype: NDEFReader;
  new (): NDEFReader;
};
