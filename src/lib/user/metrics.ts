'use server'

import 'server-only';

import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { userUsageMetrics } from '../db/schema';
import * as schema from '../db/schema';

import { ChatSDKError } from '../errors';

const client = postgres(process.env.POSTGRES_URL!); // biome-ignore lint: Forbidden non-null assertion.
const db = drizzle(client, { schema });

// Fonctions pour manipuler les métriques des utilisateurs

export async function incrementMetric({
  userId,
  metricName,
  value = 1,
}: {
  userId: string;
  metricName: string;
  value?: number;
}) {
  try {
    const [existingMetric] = await db
      .select()
      .from(userUsageMetrics)
      .where(and(eq(userUsageMetrics.userId, userId), eq(userUsageMetrics.metricName, metricName)));

    if (existingMetric) {
      await db
        .update(userUsageMetrics)
        .set({ metricValue: existingMetric.metricValue + value, lastUpdatedAt: new Date() })
        .where(eq(userUsageMetrics.id, existingMetric.id));
    } else {
      await db.insert(userUsageMetrics).values({
        userId,
        metricName,
        metricValue: value,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      });
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to increment metric ${metricName} for user ${userId}`,
    );
  }
}

export const decrementMetric = async ({
  userId,
  metricName,
  value = 1,
}: {
  userId: string;
  metricName: string;
  value?: number;
}) => {
  try {
    const [existingMetric] = await db
      .select()
      .from(userUsageMetrics)
      .where(and(eq(userUsageMetrics.userId, userId), eq(userUsageMetrics.metricName, metricName)));

    if (existingMetric) {
      await db
        .update(userUsageMetrics)
        .set({ metricValue: existingMetric.metricValue - value, lastUpdatedAt: new Date() })
        .where(eq(userUsageMetrics.id, existingMetric.id));
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to decrement metric ${metricName} for user ${userId}`,
    );
  }
};

export async function getMetricByUserIdAndName({
  userId,
  metricName,
}: {
  userId: string;
  metricName: string;
}) {
  try {
    const [metric] = await db
      .select()
      .from(userUsageMetrics)
      .where(and(eq(userUsageMetrics.userId, userId), eq(userUsageMetrics.metricName, metricName)));
    return metric;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to get metric ${metricName} for user ${userId}`,
    );
  }
}

export async function getAllMetricsByUserId({
  userId,
}: {
  userId: string;
}) {
  try {
    const metrics = await db
      .select()
      .from(userUsageMetrics)
      .where(eq(userUsageMetrics.userId, userId));
    return metrics;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to get all metrics for user ${userId}`,
    );
  }
}

export async function resetMetric({
  userId,
  metricName,
  value = 0,
}: {
  userId: string;
  metricName: string;
  value?: number;
}) {
  try {
    await db
      .update(userUsageMetrics)
      .set({ metricValue: value, lastUpdatedAt: new Date() })
      .where(and(eq(userUsageMetrics.userId, userId), eq(userUsageMetrics.metricName, metricName)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to reset metric ${metricName} for user ${userId}`,
    );
  }
}


export const createMetric = async ({
  userId,
  metricName,
  value = 0,
}: {
  userId: string;
  metricName: string;
  value?: number;
}) => {
  try {
    await db.insert(userUsageMetrics).values({
      userId,
      metricName,
      metricValue: value,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to create metric ${metricName} for user ${userId}`,
    );
  }
};