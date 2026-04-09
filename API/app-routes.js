const startupRoutes = require("./api/admin2.0/userManagementnew/startupRoutes.js");

// Routes which should handle requests
/*========== Core Admin ===================*/
const systemAuthRoutes = require("./api/admin2.0/systemSecurity/Routes.js");
const usersRoutes = require("./api/admin2.0/userManagementnew/RoutesUsers.js");
const rolesRoutes = require("./api/admin2.0/rolesManagement/routes.js");
const notificationTemplatesRoutes = require("./api/admin2.0/notificationManagement/RoutesMasterNotification.js");
const sendNotificationRoutes = require("./api/admin2.0/notificationManagement/RoutesNotification.js");

// =======Lupin API ======================
const centersRoutes = require("./api/hrms-2026/centers/routes.js");
const bankRoutes = require("./api/hrms-2026/bank-details/routes.js");
// const approvalLevelRoutes = require("./api/hrms-2026/approval-level/routes.js");
// const subactivitymappingRoutes = require("./api/hrms-2026/SubactivityMapping/route.js");
const subassetsmappingRoutes = require("./api/hrms-2026/subassetsMapping/route.js");
const assetManagementRoutes = require("./api/hrms-2026/assetManagementnew/route.js");
const assetCategoryRoutes = require("./api/hrms-2026/oneFieldModules/assetCategory/route.js");
const assetSubCategoryRoutes = require("./api/hrms-2026/oneFieldModules/assetSubCategory/routes.js");
// const accountHeaderMasterRoutes = require("./api/hrms-2026/oneFieldModules/accountHeaderMaster/route.js");
const tdsMasterRoutes = require("./api/hrms-2026/tdsmaster/route.js");
const vendorMasterRoutes = require("./api/hrms-2026/vendorMaster/route.js");
const locationSubcategoryRoutes = require("./api/hrms-2026/oneFieldModules/locationSubcategory/routes.js");
const departmentMasterRoutes = require("./api/hrms-2026/oneFieldModules/departmentMaster/routes.js");
const subdepartmentMasterRoutes = require("./api/hrms-2026/oneFieldModules/subdepartmentMaster/routes.js");
// const assetAllocationRoutes = require("./api/hrms-2026/assetAllocation/route.js");
const employeeManagementRoutes = require("./api/hrms-2026/employeeManagement/route.js");
const attendanceManagementRoutes = require("./api/hrms-2026/attendanceManagement/route.js");
const payrollManagementRoutes = require("./api/hrms-2026/payrollManagement/route.js");
const reportingSystemRoutes = require("./api/hrms-2026/reportingSystem/route.js");
const dashboardRoutes = require("./api/hrms-2026/dashboard/route.js");

// const programRoutes = require("./api/hrms-2026/oneFieldModules/programManagement/routesNew.js");
// const projectRoutes = require("./api/hrms-2026/oneFieldModules/projectManagement/routesNew.js");
// const activity = require("./api/hrms-2026/oneFieldModules/ActivityManagement/route.js");
// const unitRoutes = require("./api/hrms-2026/oneFieldModules/unitManagement/routesNew.js");
// const utilizationApprovalLevelRoutes = require("./api/hrms-2026/utilization-approval-level/routes.js");

//LeaveRoute
const leaveTypeRoutes = require("./api/hrms-2026/leaveManagement/leaveTypes/route.js");

const appRoutes = (app) => {
  //lupin api
  app.use("/api/centers", centersRoutes);
  app.use("/api/bank-details", bankRoutes);
  // app.use("/api/approvalLevels", approvalLevelRoutes);
  // app.use("/api/utilizationapprovallevel", utilizationApprovalLevelRoutes);
  // app.use("/api/programs", programRoutes);
  // app.use("/api/projects", projectRoutes);
  // app.use("/api/units", unitRoutes);
  // app.use("/api/activity", activity);
  // app.use("/api/subactivity-mapping", subactivitymappingRoutes);

  app.use("/api/subassets", subassetsmappingRoutes);
  app.use("/api/asset-management", assetManagementRoutes);
  app.use("/api/asset-category", assetCategoryRoutes);
  app.use("/api/asset-master-subcategory", assetSubCategoryRoutes);
  app.use("/api/location-subcategory", locationSubcategoryRoutes);
  app.use("/api/department-master", departmentMasterRoutes);
  app.use("/api/subdepartment-master", subdepartmentMasterRoutes);
  app.use("/api/employees", employeeManagementRoutes);
  // app.use("/api/asset-allocation", assetAllocationRoutes);
  // app.use("/api/account-header-master", accountHeaderMasterRoutes);
  app.use("/api/tdsmaster", tdsMasterRoutes);
  app.use("/api/vendor-master", vendorMasterRoutes);
  app.use("/api/attendance", attendanceManagementRoutes);
  app.use("/api/payroll", payrollManagementRoutes);
  app.use("/api/reports", reportingSystemRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // core-admin api
  app.use("/startup", startupRoutes);
  app.use("/api/auth", systemAuthRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/roles", rolesRoutes);
  app.use("/api/masternotifications", notificationTemplatesRoutes);
  app.use("/api/notifications", sendNotificationRoutes);
  //leaveRoutes
  app.use("/api/leave-types", leaveTypeRoutes);
};

module.exports = appRoutes;
