import { storage } from "./storage";

async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Create admin user
    const adminUser = await storage.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@fortress.com",
      role: "admin"
    });
    console.log("Created admin user:", adminUser);

    // Create demo devices
    const demoDevices = [
      {
        name: "Samsung Galaxy Tab A8",
        imei: "352033111234567",
        serialNumber: "SGT001",
        deviceType: "android",
        status: "online" as const,
        batteryLevel: 85,
        location: "New York Office",
        lastSeen: new Date(),
        osVersion: "Android 13",
        model: "Galaxy Tab A8",
        manufacturer: "Samsung",
        isKioskMode: false,
        department: "IT",
        assignedUser: "John Doe"
      },
      {
        name: "iPad Pro 11-inch",
        imei: "352033111234568",
        serialNumber: "IPAD001",
        deviceType: "ios",
        status: "offline" as const,
        batteryLevel: 45,
        location: "San Francisco Office",
        lastSeen: new Date(Date.now() - 3600000),
        osVersion: "iOS 17.1",
        model: "iPad Pro 11-inch",
        manufacturer: "Apple",
        isKioskMode: true,
        department: "Sales",
        assignedUser: "Jane Smith"
      },
      {
        name: "Google Pixel 7",
        imei: "352033111234569",
        serialNumber: "PIXEL001",
        deviceType: "android",
        status: "warning" as const,
        batteryLevel: 15,
        location: "Chicago Office",
        lastSeen: new Date(Date.now() - 1800000),
        osVersion: "Android 14",
        model: "Pixel 7",
        manufacturer: "Google",
        isKioskMode: false,
        department: "Marketing",
        assignedUser: "Bob Johnson"
      }
    ];

    for (const device of demoDevices) {
      const createdDevice = await storage.createDevice(device);
      console.log("Created device:", createdDevice.name);
    }

    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };