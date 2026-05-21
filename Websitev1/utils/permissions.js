import { sidebarData } from './sidebarData';

// Function to consolidate permissions across multiple roles
export const consolidatePermissions = (rolePermissions) => {
  // console.log("rolePermissions",rolePermissions)
  if (!Array.isArray(rolePermissions)) {
    console.error("rolePermissions is not an array:", rolePermissions);
    return {};
  }

  const consolidated = {};
  rolePermissions.forEach(role => {
    role.permissions.forEach(permission => {
      if (!consolidated[permission.moduleName]) {
        consolidated[permission.moduleName] = { ...permission };
      } else {
        // Merge permissions, favoring the most permissive (true)
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


export const validatePermission = (path, userPermissions) => {
  // console.log("validatePermission  => 1", path,userPermissions)
  if (userPermissions) {
    // Normalize the path by stripping out the dynamic part (e.g., an ID segment)
    const normalizedPath = path?.replace(/\/\[\w+\]$/, '').replace(/\/[^/]+$/, '').replace(/\/$/, '');
    const hasDynamicId = /\/[a-fA-F0-9]{24}$/.test(path); // Adjust regex based on ID format
    // console.log("hasDynamicId", hasDynamicId, "normalizedPath", normalizedPath)
    let routeInfo;

    if (hasDynamicId) {
      routeInfo = getSidebarDataByPath(normalizedPath,userPermissions);
      // console.log("here routeInfo 1", routeInfo)
    } else {
      routeInfo = getSidebarDataByPath(path,userPermissions);
      // console.log("here routeInfo 2 ", routeInfo)
    }
    // Get route info based on the path
    if (!routeInfo) {
      return false; // Route not found in sidebar data
    }
    // return true;
    // console.log("here routeInfo", routeInfo)

    const { module, subModule } = routeInfo;
    const modulePermissions = userPermissions[module];
    // console.log("module", module, "subModule", subModule)
    // console.log("modulePermissions", modulePermissions)

    // Check if path includes a dynamic segment (ID) to determine the action
    if (!modulePermissions) return false; // No permissions for this module
    // Check if the user has permission for the specific action on the subModule or module
    // const action = hasDynamicId ? 'edit' || "view" : subModule;
    const action = hasDynamicId ? (modulePermissions.view ? 'view' : 'edit') : subModule;

    if (subModule) {
      // console.log("modulePermissions[subModule] === action ->1 ", modulePermissions[subModule], action, subModule === action)
        // console.log("action 3",action)
      if (subModule === action) {
        // console.log("modulePermissions[subModule]", modulePermissions[subModule])
        return modulePermissions[subModule] || modulePermissions.all; // Check submodule permission
      } else {
        return modulePermissions[subModule] || modulePermissions.all; // Check submodule permission
      }
    } else {
      // console.log("action 4",action)
      // console.log("modulePermissions[action] =>2", modulePermissions[action])
      // Check module-level permission based on the detected action
      return modulePermissions[action] || modulePermissions.all; // Check for 'create' or 'edit' action or full access
    }
  } else {
    console.log("userPermissions not found in validatePermission", userPermissions)

  }
};

const hasDynamicId = (url) => /\/[a-fA-F0-9]{24}$/.test(url);

export const getSidebarDataByPath = (path, userPermissions) => {
  const normalizedPath = path?.replace(/\/\[\w+\]$/, '').replace(/\/$/, '');

  for (const item of sidebarData) {
    if (item.link === path || item.link === normalizedPath) {
      return { module: item.title, subModule: null };
    }
    if (item.submenu) {
      for (const subItem of item.submenuItems) {
        if (
          subItem.link === path ||
          subItem.link === normalizedPath ||
          path.startsWith(subItem.link)
        ) {
          const action = hasDynamicId(path) ? 'edit' : 'create';
          if (userPermissions[item.title]?.[action]) {
            return { module: item.title, subModule: subItem.subModule };
          }
        }
      }
    }
  }

  return null;
};

