import "server-only";

import { cache } from "react";

import { requireSession, type AdvisorSession } from "@/lib/dal";
import { scopedClients } from "@/lib/demo/api-router";
import {
  bookMetrics,
  deriveAlerts,
  deriveOpportunities,
  type BookMetrics,
} from "@/lib/demo/insights";
import { DEMO_PRODUCTS } from "@/lib/demo/seed/products";
import { demoUserById } from "@/lib/demo/seed/users";
import { readDemoDb } from "@/lib/demo/store";
import type {
  DemoAlert,
  DemoClientRecord,
  DemoOpportunity,
  DemoProduct,
  DemoRecommendation,
  DemoReportRecord,
  DemoServiceRequest,
} from "@/lib/demo/types";

/**
 * Everything a page needs about who is looking and what they can see. Cached
 * per request so a page can call it from several components without refetching.
 */
export const getViewer = cache(async () => {
  const session = await requireSession();
  const db = await readDemoDb();
  const user = demoUserById(session.userId);

  const records = user
    ? scopedClients(db, user)
    : db.clients.filter((record) => record.client.advisorId === session.userId);

  return { session, db, records };
});

export type Viewer = Awaited<ReturnType<typeof getViewer>>;

export async function getScopedClientRecords(): Promise<DemoClientRecord[]> {
  const { records } = await getViewer();
  return records;
}

export async function getClientRecord(
  clientId: string,
): Promise<DemoClientRecord | null> {
  const { records } = await getViewer();
  return (
    records.find((record) => record.client.id === clientId) ?? null
  );
}

/**
 * Rule-derived alerts plus stored event alerts, newest first. One feed backs
 * both the Overview attention column and the notification centre.
 */
export async function getAlertFeed(): Promise<DemoAlert[]> {
  const { db, records } = await getViewer();
  const visibleIds = new Set(records.map((record) => record.client.id));
  const readIds = new Set(db.readAlertIds);

  const events = db.alerts.filter(
    (alert) => !alert.clientId || visibleIds.has(alert.clientId),
  );

  return [...deriveAlerts(records), ...events]
    .map((alert) => ({ ...alert, read: readIds.has(alert.id) }))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getOpportunityFeed(): Promise<DemoOpportunity[]> {
  const { records } = await getViewer();
  return deriveOpportunities(records).sort((a, b) => b.valueUsd - a.valueUsd);
}

export async function getBookMetrics(): Promise<BookMetrics> {
  const { db, records } = await getViewer();
  const visibleIds = new Set(records.map((record) => record.client.id));
  const escalations = db.serviceRequests.filter(
    (request) =>
      request.status !== "resolved" && visibleIds.has(request.clientId),
  ).length;

  return bookMetrics(records, escalations);
}

export async function getRecommendations(options?: {
  clientId?: string;
  statuses?: DemoRecommendation["status"][];
}): Promise<DemoRecommendation[]> {
  const { db, records } = await getViewer();
  const visibleIds = new Set(records.map((record) => record.client.id));

  return db.recommendations
    .filter((recommendation) => visibleIds.has(recommendation.clientId))
    .filter((recommendation) =>
      options?.clientId ? recommendation.clientId === options.clientId : true,
    )
    .filter((recommendation) =>
      options?.statuses
        ? options.statuses.includes(recommendation.status)
        : true,
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getServiceRequests(
  clientId?: string,
): Promise<DemoServiceRequest[]> {
  const { db, records } = await getViewer();
  const visibleIds = new Set(records.map((record) => record.client.id));

  return db.serviceRequests
    .filter((request) => visibleIds.has(request.clientId))
    .filter((request) => (clientId ? request.clientId === clientId : true))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getComplianceRecords(clientId: string) {
  const { db } = await getViewer();
  return db.compliance.filter((record) => record.clientId === clientId);
}

export async function getReports(
  clientId?: string,
): Promise<DemoReportRecord[]> {
  const { db, records } = await getViewer();
  const visibleIds = new Set(records.map((record) => record.client.id));

  return db.reports
    .filter((report) => visibleIds.has(report.clientId))
    .filter((report) => (clientId ? report.clientId === clientId : true))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getProducts(): DemoProduct[] {
  return DEMO_PRODUCTS;
}

export async function getClientThread(clientId: string) {
  const { db } = await getViewer();
  return db.threads.find((thread) => thread.clientId === clientId) ?? null;
}

export async function getClientTasks(clientId: string) {
  const { db } = await getViewer();
  return db.tasks.filter((task) => task.clientId === clientId);
}

export async function getClientDocuments(clientId: string) {
  const { db } = await getViewer();
  return db.documents
    .filter((document) => document.clientId === clientId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getClientAppointments(clientId: string) {
  const { db } = await getViewer();
  return db.appointments
    .filter((appointment) => appointment.clientId === clientId)
    .sort(
      (a, b) =>
        Date.parse(b.scheduledAt ?? b.planYear) -
        Date.parse(a.scheduledAt ?? a.planYear),
    );
}

export async function getUnreadAlertCount(): Promise<number> {
  const alerts = await getAlertFeed();
  return alerts.filter((alert) => !alert.read).length;
}

export type { AdvisorSession };
