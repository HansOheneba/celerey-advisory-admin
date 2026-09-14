import type { Client } from "@/types/client";
import type { DemoClientRecord, DemoDatabase } from "@/lib/demo/types";

/** Segment lives on DemoClientRecord; keep nested client.summary in sync for list APIs. */
export function resolveClientSegment(record: DemoClientRecord): Client["segment"] {
  return record.client.segment ?? record.segment;
}

export function clientSummaryFromRecord(record: DemoClientRecord): Client {
  return {
    ...record.client,
    segment: resolveClientSegment(record),
  };
}

/** Backfill client.segment from record.segment for stores saved before segment moved onto Client. */
export function syncClientSegmentsOnRecords(db: DemoDatabase): boolean {
  let dirty = false;

  for (const record of db.clients) {
    const segment = resolveClientSegment(record);
    if (record.client.segment !== segment) {
      record.client.segment = segment;
      dirty = true;
    }
    if (record.segment !== segment) {
      record.segment = segment;
      dirty = true;
    }
  }

  return dirty;
}
