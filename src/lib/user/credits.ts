"use server";

import "server-only";

import { decrementMetric, getMetricByUserIdAndName } from "./metrics";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env["POLAR_ACCESS_TOKEN"] ?? "",
  server: "sandbox",
});

const getFreeUserCredits = async (userId: string): Promise<number> => {
  return (await getMetricByUserIdAndName({ userId, metricName: "credits" }))
    .metricValue;
};

const getCustomerCredits = async (userId: string): Promise<number> => {
  const customerState = await polar.customers.getStateExternal({
    externalId: userId,
  });
  const chatMeter = customerState.activeMeters.find(
    (meter: any) => meter.meterId === "01ff6235-edee-4420-ab51-82f391bb91eb"
  );
  return chatMeter ? chatMeter.balance : 0;
};

export const getRemainingCredits = async (userId: string) => {
  try {
    return await getCustomerCredits(userId);
  } catch (error) {
    return await getFreeUserCredits(userId);
  }
};

export const updateCredits = async (userId: string, amount: number) => {
  try {
    await polar.events.ingest({
      events: [
        {
          name: "ai_cost_deduction",
          externalCustomerId: userId,
          metadata: {
            cost_units: amount,
          },
        },
      ],
    });
  } catch (error) {
    console.log("yoyoyoyo")
    await decrementMetric({ userId, metricName: "credits", value: amount });
  }
};
