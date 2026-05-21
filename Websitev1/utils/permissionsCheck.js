import { validatePermission } from './permissions';
import store from '@/redux/store';

export const hasAccessToPath = (pathname) => {
  const state = store.getState();
  const consolidated = state.accessPermissions.consolidatedPermissions;
  console.log("hasAccessToPath , pathname, consolidated",pathname, consolidated)
  return validatePermission(pathname, consolidated);
};
