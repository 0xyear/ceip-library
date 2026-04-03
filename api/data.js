export default async function handler(req, res) {
  const GAS_URL = "YOUR_GAS_DEPLOY_URL_HERE";
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch from GAS", detail: e.message });
  }
}
