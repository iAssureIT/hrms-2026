const startupRoutes = require("./api/admin2.0/userManagementnew/startupRoutes.js");

// Routes which should handle requests
/*========== Core Admin ===================*/
const systemAuthRoutes = require("./api/admin2.0/systemSecurity/Routes.js");
const usersRoutes = require("./api/admin2.0/userManagementnew/RoutesUsers.js");
const rolesRoutes = require("./api/admin2.0/rolesManagement/routes.js");
const notificationTemplatesRoutes = require("./api/admin2.0/notificationManagement/RoutesMasterNotification.js");
const sendNotificationRoutes = require("./api/admin2.0/notificationManagement/RoutesNotification.js");

// =======Lupin API ======================
const centersRoutes = require("./api/lupin/centers/routes.js");
const bankRoutes = require("./api/lupin/bank-details/routes.js");
const approvalLevelRoutes = require("./api/lupin/approval-level/routes.js");
const subactivitymappingRoutes = require("./api/lupin/SubactivityMapping/route.js");
const subassetsmappingRoutes = require("./api/lupin/subassetsMapping/route.js");
const assetManagementRoutes = require("./api/lupin/assetManagement/route.js");
const assetCategoryRoutes = require("./api/lupin/oneFieldModules/assetCategory/route.js");
const assetSubCategoryRoutes = require("./api/lupin/oneFieldModules/assetSubCategory/routes.js");
const accountHeaderMasterRoutes = require("./api/lupin/oneFieldModules/accountHeaderMaster/route.js");
const tdsMasterRoutes = require("./api/lupin/tdsmaster/route.js")
const vendorMasterRoutes = require("./api/lupin/vendorMaster/route.js")
const locationSubcategoryRoutes = require("./api/lupin/oneFieldModules/locationSubcategory/routes.js");
const departmentMasterRoutes = require("./api/lupin/oneFieldModules/departmentMaster/routes.js");
const subdepartmentMasterRoutes = require("./api/lupin/oneFieldModules/subdepartmentMaster/routes.js");
const assetAllocationRoutes = require("./api/lupin/assetAllocation/route.js");
const employeeManagementRoutes = require("./api/lupin/employeeManagement/route.js");

const programRoutes = require("./api/lupin/oneFieldModules/programManagement/routesNew.js");
const projectRoutes = require("./api/lupin/oneFieldModules/projectManagement/routesNew.js");
const activity = require("./api/lupin/oneFieldModules/ActivityManagement/route.js");
const unitRoutes = require("./api/lupin/oneFieldModules/unitManagement/routesNew.js");
const utilizationApprovalLevelRoutes = require("./api/lupin/utilization-approval-level/routes.js");

const appRoutes = (app) => {
  //lupin api
  app.use("/api/centers", centersRoutes);
  app.use("/api/bank-details", bankRoutes);
  app.use("/api/approvalLevels", approvalLevelRoutes);
  app.use("/api/utilizationapprovallevel", utilizationApprovalLevelRoutes);
  app.use("/api/programs", programRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/units", unitRoutes);
  app.use("/api/activity", activity);
  app.use("/api/subactivity-mapping", subactivitymappingRoutes);

  app.use("/api/subassets", subassetsmappingRoutes)
  app.use("/api/asset-management", assetManagementRoutes)
  app.use("/api/asset-category", assetCategoryRoutes)
  app.use("/api/asset-master-subcategory", assetSubCategoryRoutes)
  app.use("/api/location-subcategory", locationSubcategoryRoutes)
  app.use("/api/department-master", departmentMasterRoutes)
  app.use("/api/subdepartment-master", subdepartmentMasterRoutes)
  app.use("/api/employees", employeeManagementRoutes)
  app.use("/api/asset-allocation", assetAllocationRoutes)
  app.use("/api/account-header-master", accountHeaderMasterRoutes)
  app.use("/api/tdsmaster", tdsMasterRoutes)
  app.use("/api/vendor-master", vendorMasterRoutes)

  // core-admin api
  app.use("/startup", startupRoutes);
  app.use("/api/auth", systemAuthRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/roles", rolesRoutes);
  app.use("/api/masternotifications", notificationTemplatesRoutes);
  app.use("/api/notifications", sendNotificationRoutes);
};

module.exports = appRoutes;


module.exports = appRoutes;
