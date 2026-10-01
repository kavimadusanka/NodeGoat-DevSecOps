module.exports = {
   zapHostName: process.env.ZAP_HOST || "127.0.0.1",
   zapPort: process.env.ZAP_PORT || "8080",
   zapApiKey: process.env.ZAP_API_KEY || "",
   zapApiFeedbackSpeed: Number(process.env.ZAP_API_FEEDBACK_SPEED || 5000)
};
