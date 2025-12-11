// api/server.js
import serverless from "serverless-http";
import app from "../app.js"; // adjust if app.js is in a different folder

export const handler = serverless(app);
export default handler;
