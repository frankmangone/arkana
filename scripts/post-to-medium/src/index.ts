import { MediumPublisher } from "./medium-publisher";

// Main execution
async function main(): Promise<void> {
  const publisher = new MediumPublisher({
    headless: false,
    devtools: true,
    timeout: 30000,
    captureRequests: true,
    outputDir: "./output",
  });

  try {
    console.log("🎯 Medium API Exploration Tool");
    console.log("================================");

    await publisher.init();
    await publisher.waitForLogin();
    await publisher.captureCredentials();
    // await publisher.createDraftAndTest();
    // await publisher.testAPICall();
    // await publisher.saveCapturedData();

    console.log("\n🎉 Exploration completed!");
    console.log("📋 Next steps:");
    console.log("   1. Check the output/ directory for captured data");
    console.log("   2. Analyze the captured deltas/batch operations");
    console.log("   3. Reverse engineer the draft creation endpoint");
    console.log("   4. Build the markdown-to-deltas converter");
  } catch (error) {
    console.error("💥 Error:", error);
  } finally {
    await publisher.cleanup();
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}
