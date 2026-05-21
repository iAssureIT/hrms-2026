// not in use - kept for reuse functions

import { NextResponse } from 'next/server';
import { sidebarData } from "@/utils/sidebarData.js"
import { store } from '@/redux/store'; // Import the Redux store
import { fetchRolePermissions } from '@/redux/slices/accessSlice'; // Correct import path

// Function to consolidate permissions across multiple roles
const consolidatePermissions = (rolePermissions) => {
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

const getSidebarDataByPath = (path, userPermissions) => {
  // Remove query parameters and normalize path
  const normalizedPath = path?.replace(/\/\[\w+\]$/, '').replace(/\/$/, '');

  // Helper function to determine if a URL includes a dynamic segment (ID)
  const hasDynamicId = (url) => /\/[a-fA-F0-9]{24}$/.test(url); // Adjust regex based on ID format

  for (const item of sidebarData) {
    if (item.link === path || item.link === normalizedPath) {
      return { module: item.title, subModule: null };
    }
    if (item.submenu) {
      for (const subItem of item.submenuItems) {
        // Check exact path matches
        if (subItem.link === path || subItem.link === normalizedPath) {
          // console.log("item.title", item.title, "subItem.subModule", subItem.subModule)
          return { module: item.title, subModule: subItem.subModule };
        }
        if (path.startsWith(subItem.link)) {
          const action = hasDynamicId(path) ? "edit" || "view" : "create"; // Assuming ID indicates "edit"
          // console.log("action 1",action)
          if (userPermissions[item.title]?.[action]) {
            return { module: item.title, subModule: subItem.subModule };
          }
        }
      }
    }
  }

  // If no exact match, try matching the base paths for dynamic URLs
  for (const item of sidebarData) {
    if (path.startsWith(item.link)) {
      return { module: item.title, subModule: null };
    }
    if (item.submenu) {
      for (const subItem of item.submenuItems) {
        if (path.startsWith(subItem.link)) {
          const action = hasDynamicId(path) ? "edit" || "view" : "create";
          // console.log("action 2",action)

          if (userPermissions.includes(action)) {
            return { module: item.title, subModule: subItem.subModule };
          }
        }
      }
    }
  }

  return null; // Return null if no match or access
};
const validatePermission = (path, userPermissions) => {
  console.log("validatePermission  => 1", path)
  if (userPermissions) {
    // Normalize the path by stripping out the dynamic part (e.g., an ID segment)
    const normalizedPath = path?.replace(/\/\[\w+\]$/, '').replace(/\/[^/]+$/, '').replace(/\/$/, '');
    const hasDynamicId = /\/[a-fA-F0-9]{24}$/.test(path); // Adjust regex based on ID format
    console.log("hasDynamicId", hasDynamicId, "normalizedPath", normalizedPath)
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
    console.log("here routeInfo", routeInfo)

    const { module, subModule } = routeInfo;
    const modulePermissions = userPermissions[module];
    console.log("module", module, "subModule", subModule)
    // console.log("modulePermissions", modulePermissions)

    // Check if path includes a dynamic segment (ID) to determine the action
    if (!modulePermissions) return false; // No permissions for this module
    // Check if the user has permission for the specific action on the subModule or module
    // const action = hasDynamicId ? 'edit' || "view" : subModule;
    const action = hasDynamicId ? (modulePermissions.view ? 'view' : 'edit') : subModule;

    if (subModule) {
      console.log("modulePermissions[subModule] === action ->1 ", modulePermissions[subModule], action, subModule === action)
        console.log("action 3",action)
      if (subModule === action) {
        console.log("modulePermissions[subModule]", modulePermissions[subModule])
        return modulePermissions[subModule] || modulePermissions.all; // Check submodule permission
      } else {
        return modulePermissions[subModule] || modulePermissions.all; // Check submodule permission
      }
    } else {
      console.log("action 4",action)
      console.log("modulePermissions[action] =>2", modulePermissions[action])
      // Check module-level permission based on the detected action
      return modulePermissions[action] || modulePermissions.all; // Check for 'create' or 'edit' action or full access
    }
  } else {
    console.log("userPermissions not found in validatePermission", userPermissions)

  }
};

// export async function middleware(req) {
//   const { pathname } = req.nextUrl;


//   // Extract userRolePermissions from the cookies
//   const rolePermissionsCookie = req.cookies.get('k_rolePermissions');
//   let userRolePermissions = null;
//   // console.log("rolePermissionsCookie",rolePermissionsCookie)
//   if (rolePermissionsCookie) {
//     try {
//       userRolePermissions = JSON.parse(rolePermissionsCookie.value); // Parse the cookie value to JSON
//     } catch (error) {
//       console.error("Failed to parse userRolePermissions cookie:", error);
//     }

//   } else {
//     // Redirect to the loading page if userRolePermissions cookie is missing
//     if (pathname !== '/admin/loading') {
//       return NextResponse.redirect(new URL('/admin/loading', req.nextUrl.origin));
//     }
//     return NextResponse.next();
//   }

//   // Redirect to the dashboard if permissions exist and the path is /admin/loading
//   if (userRolePermissions && pathname === '/admin/loading') {
//     return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl.origin));
//   }

//   const rolePermissions = userRolePermissions;
//   const userPermissions = consolidatePermissions(rolePermissions);

//   // console.log("userPermissions",userPermissions)
//   console.log("validatePermission(pathname, userPermissions)",validatePermission(pathname, userPermissions))
//   if (userPermissions) {
//     try {
//       if (!validatePermission(pathname, userPermissions)) {
//         // Redirect to the 404 page if the user doesn't have the required permission
//         if (pathname !== '/admin/404') {
//           return NextResponse.redirect(new URL('/admin/404', req.nextUrl.origin));
//         }
//       }
//     } catch (error) {  
//       console.error("Failed to validate permissions:", error);
//     }
//   }

//   return NextResponse.next(); // Allow the request if permissions are valid
// }


// export const config = {
//   matcher: [
//     '/admin/:path*', // Protect all routes under /admin
//   ],
// };


const getPermissionsFromStore = () => {
  // Get permissions from Redux store
  return store.getState().accessPermissions.rolePermissions;
};

// Refactor the middleware to use the Redux store for permissions checking
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  const userRoles = req.cookies.get('userRoles');
  // Dispatch action to fetch permissions if they're not in store
  const permissions = getPermissionsFromStore();
  console.log("permissions",permissions)
  if (!permissions || permissions.length === 0) {
    // Trigger permissions fetching in Redux store
    store.dispatch(fetchRolePermissions(userRoles));
    // return NextResponse.redirect(new URL('/admin/loading', req.nextUrl.origin)); // Loading page
  }

  // Permissions are now available in the store, validate permission for the path
  const userPermissions = consolidatePermissions(permissions);

  if (!validatePermission(pathname, userPermissions)) {
    // return NextResponse.redirect(new URL('/admin/404', req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], // Protect all routes under /admin
};
