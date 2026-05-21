// import ls from "localstorage-slim";

export const getRolePermission = (url) => {
  // Get user details from localStorage
  // const userDetails = ls.get('userDetails', { decrypt: true });
  const userDetails = localStorage.getItem("userDetails");
  const userDetailsParse = JSON.parse(userDetails);
  const rolePermissions = userDetailsParse?.accessAuthData;
  // console.log("userDetails",userDetails)
  // console.log("rolePermissions",rolePermissions.length)
  if (!rolePermissions) {
    return { hasAccess: false, subModules: {} }; // No permissions found
  }

  // Map the URL to the corresponding module name
  const moduleName = getModuleNameFromUrl(url);
  console.log("moduleName",moduleName)
  if (!moduleName) {
    return { hasAccess: false, subModules: {} }; // URL doesn't match any module
  }

  // Consolidate role permissions into a single object
  const userPermissions = consolidatePermissions(rolePermissions);
  const modulePermissions = userPermissions[moduleName];
  console.log("modulePermissions",modulePermissions)

  if (!modulePermissions) {
    return { hasAccess: false, subModules: {} }; // No permissions for the module
  }

  // Build the object of submodules the user has access to
  const subModules = Object.keys(modulePermissions)
    .filter(key => key !== "moduleName" && key !== "_id" && key !== "all")
    .reduce((acc, subModule) => {
      acc[subModule] = modulePermissions[subModule];
      return acc;
    }, {}); // Create an object instead of an array
    // console.log("modulePermissions.all",modulePermissions.all, "Object.values(subModules).some(Boolean)",Object.values(subModules).some(Boolean))
    // console.log("subModules",subModules)
  // Return the result with overall access and submodule permissions as an object
  return {
    hasAccess: modulePermissions.all || Object.values(subModules).some(Boolean),
    subModules: subModules, // Submodules is now an object of objects
  };
};

// Helper function to map URL to the corresponding module name
const getModuleNameFromUrl = (url) => {
  const moduleMapping = {
    "/admin/dashboard": "Dashboard",
    "/admin/user-profile":"User Profile",
    "/admin/user-management": "User Management",
    "/admin/notification-management": "Notification Management",
    "/admin/client-management": "Client Management",
    "/admin/access-management": "Access Management",
    "/admin/subscription-management": "Subscription Management",
    "/admin/global-settings": "Global Setting",
    "/admin/study-management": "Study Management",
    "/admin/master-data":"Master Data",
    "admin/blogs/blog-list":"Blogs Management",
    "/admin/news":"News Management",
    "/admin/blogs":"Blogs Management",
    "/admin/events":"Events Management",
    "/admin/photo":"Photo Gallery",
    "/admin/video":"Video Gallery",
    "/admin/podcast-management":"Podcast Management",
    "/admin/subscriber-management":"Subscriber Management",
    "/admin/trading-call":"Trading Call",   
    "/admin/trading-call-new":"Trading Call New",   
    "/admin/research-report-management" : "Research Report Management",
    "/admin/knowledge-center" : "Knowledge Center",
    "/admin/stock-basket" : "Stock Basket",
    // Add more mappings as needed
  };
  return moduleMapping[url] || null;
};

// Consolidate permissions across multiple roles
const consolidatePermissions = (rolePermissions) => {
  const consolidated = {};
  rolePermissions.forEach(role => {
    role.permissions.forEach(permission => {
      if (!consolidated[permission.moduleName]) {
        consolidated[permission.moduleName] = { ...permission };
      } else {
        Object.keys(permission).forEach(key => {
          if (key !== "moduleName" && key !== "_id") {
            consolidated[permission.moduleName][key] = consolidated[permission.moduleName][key] || permission[key];
          }
        });
      }
    });
  });
  return consolidated;
};
