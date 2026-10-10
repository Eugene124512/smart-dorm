-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billingPeriod" TEXT NOT NULL,
    "utilityType" TEXT NOT NULL,
    "masterAmount" REAL NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tenantId" TEXT,
    CONSTRAINT "Bill_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bill" ("billingPeriod", "id", "masterAmount", "roomNumber", "status", "utilityType") SELECT "billingPeriod", "id", "masterAmount", "roomNumber", "status", "utilityType" FROM "Bill";
DROP TABLE "Bill";
ALTER TABLE "new_Bill" RENAME TO "Bill";
CREATE TABLE "new_OccupancyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "checkInTime" DATETIME NOT NULL,
    "checkOutTime" DATETIME,
    "durationHours" REAL,
    CONSTRAINT "OccupancyLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OccupancyLog" ("checkInTime", "checkOutTime", "durationHours", "id", "tenantId") SELECT "checkInTime", "checkOutTime", "durationHours", "id", "tenantId" FROM "OccupancyLog";
DROP TABLE "OccupancyLog";
ALTER TABLE "new_OccupancyLog" RENAME TO "OccupancyLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
