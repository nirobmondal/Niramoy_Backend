import app from "./app";
import { config } from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port;

async function main() {
  try {
    await prisma.$connect();
    
    console.log("Connected to database successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on: http://localhost:${PORT}`);
    })
  } catch (error) {
    console.log("An error occured:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();