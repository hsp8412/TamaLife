// app/services/stateService.ts
import httpService from "./httpService";

let lastUpdate = 0;
const THROTTLE_TIME = 1000; // 1 second

export const updateArduinoState = async () => {
  try {
    const now = Date.now();
    // Only update if more than THROTTLE_TIME has passed since last update
    if (now - lastUpdate >= THROTTLE_TIME) {
      const response = await httpService.get("state");
      lastUpdate = now;
      return response.data;
    }
  } catch (error) {
    console.error("Failed to update Arduino state:", error);
    throw error;
  }
};
