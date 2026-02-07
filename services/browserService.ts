
/**
 * BROWSERBASE INTEGRATION SERVICE
 * 
 * Connected to Google Cloud Run Service.
 * 
 * INSTRUCTIONS:
 * 1. Deploy your backend to Google Cloud Run.
 * 2. Copy the URL (e.g., https://koda-browser-service-xyz.run.app).
 * 3. Paste it into your .env file as CLOUD_RUN_URL.
 * 4. Alternatively, paste it directly below into MANUAL_CLOUD_RUN_URL for testing.
 */

const MANUAL_CLOUD_RUN_URL = ""; // Paste your URL here if .env doesn't work immediately
const CLOUD_RUN_URL = process.env.CLOUD_RUN_URL || MANUAL_CLOUD_RUN_URL;

export const getWaitroseOffers = async (): Promise<string> => {
    
    // 1. If Cloud Run URL is configured, fetch real data
    if (CLOUD_RUN_URL && CLOUD_RUN_URL.startsWith('http')) {
        try {
            console.log("Fetching offers from Cloud Run:", CLOUD_RUN_URL);
            
            // TIMEOUT HANDLING: Cloud Run cold starts can take 10s. We wait max 8s.
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch(`${CLOUD_RUN_URL}/offers`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const json = await response.json();
            
            if (json.success && json.data) {
                console.log("Successfully fetched live Waitrose data.");
                return `Live Waitrose Data: ${json.data}`;
            } else {
                console.warn("Cloud Run returned error structure:", json.error);
                // Fallthrough to mock
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.warn("Cloud Run request timed out (Cold start?). Switching to local data.");
            } else {
                console.error("Failed to connect to Cloud Run:", error.message);
            }
            // Fallthrough to mock
        }
    } else {
        console.log("CLOUD_RUN_URL not set or invalid. Using mock data.");
    }

    // 2. Fallback Mock Data (if server fails, times out, or isn't set up)
    console.log("Using Mock Waitrose Data");
    return new Promise((resolve) => {
        // Resolve quickly so UI doesn't hang
        setTimeout(() => {
            resolve(`
                (Note: Using cached/mock data. Check Cloud Run URL configuration.)
                Waitrose Offers Page Scrape (${new Date().toLocaleDateString()}):
                1. Waitrose Duchy Organic Salmon Fillets (240g) - Save 25% - Now £6.00 (Was £8.00). High in Omega 3.
                2. Waitrose Tenderstem Broccoli (200g) - 2 for £4.00.
                3. Essential Waitrose Chicken Breast Fillets (650g) - Save 1/3. Lean protein source.
                4. Waitrose Avocado Ripened - 2 for £3.00.
                5. Tilda Basmati Rice (1kg) - Half Price - £2.50.
                6. Waitrose Greek Style Natural Yogurt (500g) - Save 20p.
                7. Waitrose Blueberries - 2 for £5.
            `);
        }, 500);
    });
};
