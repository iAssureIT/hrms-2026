------------------------------------Access Management----------------------------------------------

    Most IMP - Add ACCESS_MANAGEMENT_ARRAY in your next.config.mjs to see the list of modules in access-allocation.

    ACCESS_MANAGEMENT_ARRAY: '["Dashboard","User Management","Notification Management","Subscription Management","Client Management","Access Management","Global Setting","Study Management","Patient Data Collection" ]',

****************************************************************************************************
    1) Login Functionality
    In API - 
		login api -> In user Details ->add only user's role permissions from Access. 
        
    In frontend -> login 
        -> set/save localstorage using encrypted Localstorage package
            then userDetails are stored in Cookies to call in middleware.

	Not done - login -> user Details -> save localstorage -> check role -> if 'admin' ==> admin/dashboard
						-> if 'user' ==> user/dashboard

	2) Sidebar - which is located in components/common/Sidebar.
                In Sidebar, we show only those Modules and Submodules which are accessible/permissible to the roles of logged-in User
                -> Make sure you have added all URLs in sidebarData array which sent by /user/layout to sidebar with submodules.
                -> create new functions 
                    - checkPermission  
                        - Initially, it combines the role Pemissions of multiple roles of logged-in user 
                        - this function verifies whether the main module has permission
                        - if YES then returns true
                    - checkSubmodulePermission  
                        - this function verifies whether the sub module has permission
                ->  In sidebar modulePermission and submodulePermission are true then only those modules and their submodules will show in Sidebar.
                    
    3)Middleware-  which is located in root folder of project.
            Middleware is used to find whether current path is accessible or permissible to roles of logged-in user. If not it redirects to 404 page.

            -> here, 404 page is customised page 
            -> In middleware, we can't access localstorage, 
                hence userDetails are stored in Cookies in layout.js of app folder.
			-> check url 
            -> from cookies, we got rolePermissions from userDetails  
			-> check access by calculation consolidated permissions of multiple roles in userPermissions
            -> In userPermissions, we get the all permission of that user having its roles 
			-> Then we validate permissions, to find their respective role permissions of current path
            -> If no access, then redirect to 404.         
			-> If access, then show the page. 

            -> If userDetails from cookies or accessAuthData i.e. rolePermissions from UserDetails are not found then redirect   to the loading page
                here we have loading.js to work smoothly until we get userDetails which is located in /user/loading.js.
                In this file same functionlity is done as mentioned above
                once, userdetails and accessAuthData i.e. rolePermissions are received it redirects to their respective path.

            -> To comapare all URLs with particular accessible URL, we have to add array of all URLs with submodules. So,they are added as sidebarData in sidebar.js which is called in middleware.js and loading.js both.
            Please make sure that you have entered all the URLs used in website with correct spelling and it is case sensitive.
            


    4)Global Function - rolePermissions.js
        rolePermissions.js created in utils folder which is located in root folder of project.
        
        we are using this page for actions of individual modules to find whether those are accessible or not
        In this page also same functionality is done as above

        Please make sure that you have added all Modules name in this file.
        Import this page in each module page like given below:
            import { getRolePermission } from '@/utils/rolePermission.js';

            To get permissions call it in useEffect

            useEffect(() => {
                // Call the function with the URL of the module you are checking
                const result = getRolePermission('/admin/user-management');

                setPermission(result);
            }, []); 

            Use these permissions in each components for each actions in conditions
            here we get the permission Object for submodule actions:
            for ex:
            
            {
                permission?.subModules?.create
                ?
                <Your component or part of code>
                :null
            }


db.accesses.insertOne(
  {
    _id: ObjectId('66fa9514c492b3eaec77cbd9'),
    role: 'admin',
    permissions: [
      {
        moduleName: 'User Management',
        all: true,
        create: true,
        view: true,
        list: true,
        edit: true,
        delete: true,
        _id: ObjectId('66fa9514c492b3eaec77cbdb')
      },
      {
        moduleName: 'Notification Management',
        all: true,
        create: true,
        view: true,
        list: true,
        edit: true,
        delete: true,
        _id: ObjectId('66fa9514c492b3eaec77cbdc')
      },
      {
        moduleName: 'Blogs Management',
        all: true,
        create: true,
        view: true,
        list: true,
        edit: true,
        delete: true,
        _id: ObjectId('66fa9514c492b3eaec77cbdd')
      },
      {
        moduleName: 'News Management',
        all: true,
        create: true,
        view: true,
        list: true,
        edit: true,
        delete: true,
        _id: ObjectId('66fa9514c492b3eaec77cbde')
      },
      {
        moduleName: 'Dashboard',
        all: true,
        create: true,
        view: true,
        list: true,
        edit: true,
        delete: true,
        _id: ObjectId('66fa9514c492b3eaec77cbdf')
      },
      {
        moduleName: 'Access Management',
        all: true,
        create: true,
        view: true,
        list: true,
        edit: true,
        delete: true,
        _id: ObjectId('66fa9514c492b3eaec77cbe0')
      },
      {
        moduleName: 'Photo Gallery',
        all: true,
        create: true,
        view: true,
        list: true,
        edit: true,
        delete: true,
        _id: ObjectId('66fa9514c492b3eaec77cbe0')
      },
      {
        moduleName: 'Events Management',
        all: true,
        create: true,
        view: true,
        list: true,
        edit: true,
        delete: true,
        _id: ObjectId('66fa9514c492b3eaec77cbe0')
      },
      {
        moduleName: 'Video Gallery',
        all: true,
        create: true,
        view: true,
        list: true,
        edit: true,
        delete: true,
        _id: ObjectId('66fa9514c492b3eaec77cbe0')
      }
    ],
    createdBy: ObjectId('66bf36cd31bbf1c7870b9c9f'),
    createdAt: ISODate('2024-09-30T12:09:56.908Z'),
    updateLog: [],
    __v: 0
  }
)