const API_BASE = "https://drive-pulse-uber.onrender.com";

/**
 * Fetch continuous pulse scores for a driver
 */
export async function getDriverPulse(driverId: string) {

  const response = await fetch(`${API_BASE}/pulse/${driverId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch driver pulse data");
  }

  const data = await response.json();

  return data;
}