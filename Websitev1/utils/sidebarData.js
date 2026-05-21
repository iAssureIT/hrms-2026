// called in middleware.js and loading.js
export const sidebarData = [
  { title: "Dashboard", link: "/admin/dashboard" },
  {
    title: "Master Data",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Designation Master",
        link: "/admin/master-data/designation",
      },
      {
        subModule: "list",
        title: "Department Master",
        link: "/admin/master-data/department",
      },
      {
        subModule: "list",
        title: "Complex Master",
        link: "/admin/master-data/complex",
      },
      {
        subModule: "list",
        title: "Report Type Master",
        link: "/admin/master-data/reporttype",
      },
      {
        subModule: "list",
        title: "Script Master",
        link: "/admin/master-data/script-master/add-script-master",
      },
      {
        subModule: "create",
        title: "Script Master",
        link: "/admin/master-data/script-master/bulk-upload",
      },
      {
        subModule: "list",
        title: "Coupon Code Master",
        link: "/admin/master-data/coupon-code",
      },
      {
        subModule: "create",
        title: "Subscription Master",
        link: "/admin/master-data/subscription-management",
      },
      {
        subModule: "list",
        title: "Subscription Master",
        link: "/admin/master-data/subscription-management/subscription-list",
      },
      {
        subModule: "create",
        title: "Sub-Call Type Master",
        link: "/admin/master-data/sub-call-type-master/add-sub-call",
      },
      {
        subModule: "create",
        title: "Sub-Call Type Master",
        link: "/admin/master-data/sub-call-type-master/bulk-upload",
      },
      {
        subModule: "list",
        title: "Sub-Call Type Master",
        link: "/admin/master-data/sub-call-type-master/sub-call-type-list",
      },
      {
        subModule: "list",
        title: "Telegram Group Master",
        link: "/admin/master-data/telegram-group-master",
      },
      {
        subModule: "list",
        title: "Telegram Group Name Master",
        link: "/admin/master-data/telegram-group-name-master",
      },
      {
        subModule: "create",
        title: "Script Master",
        link: "/admin/master-data/section",
      },
      {
        subModule: "create",
        title: "Knowledge Center",
        link: "/admin/master-data/knowledge-center-subcategory",
      },
      {
        subModule: "create",
        title: "Knowledge Center",
        link: "/admin/master-data/knowledge-center-category",
      },
      {
        subModule: "create",
        title: "Add Third Party Trading call",
        link: "/admin/thirdparty-tradingcall/add-new-integration",
      },
    ],
  },
  {
    title: "User Management",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Users List",
        link: "/admin/user-management",
      },
      {
        subModule: "list",
        title: "Manage Roles",
        link: "/admin/role-management",
      },
      {
        subModule: "list",
        title: "Create New User",
        link: "/admin/user-management/create-user",
      },
      {
        subModule: "list",
        title: "Deleted Users",
        link: "/admin/user-management/deleted-users",
      },
      {
        subModule: "list",
        title: "Login History",
        link: "/admin/user-management/login-history",
      },
      {
        subModule: "view",
        title: "User Profile",
        link: "/admin/user-management/user-profile",
      },
    ],
  },
  {
    title: "User Profile",
    submenu: true,
    submenuItems: [
      {
        subModule: "view",
        title: "User Profile",
        link: "/admin/user-profile",
      },
    ],
  },
  {
    title: "Notification Management",
    submenu: true,
    submenuItems: [
      {
        subModule: "create",
        title: "Create New Template",
        link: "/admin/notification-management/create-new-template",
      },
      {
        subModule: "list",
        title: "Email Template",
        link: "/admin/notification-management/email-template",
      },
      {
        subModule: "list",
        title: "SMS Template",
        link: "/admin/notification-management/sms-template",
      },
      {
        subModule: "list",
        title: "Whatsapp Template",
        link: "/admin/notification-management/whatsapp-template",
      },
      {
        subModule: "list",
        title: "Telegram Template",
        link: "/admin/notification-management/telegram-template",
      },
      {
        title: "Add Manual Notification",
        subModule: "list",
        link: "/admin/notification-management/add-manual-notification",
      },
    ],
  },
  {
    title: "Blogs Management",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Blogs Management",
        link: "/admin/blogs/blog-list",
      },
      {
        subModule: "create",
        title: "Create Blogs",
        link: "/admin/blogs/create-new-article",
      },
      {
        subModule: "view",
        title: "View Blogs",
        link: "/admin/blogs",
      },
    ],
  },
  {
    title: "Subscriber Management",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Subscribers List",
        link: "/admin/subscriber-management/subscribers-list",
      },
      {
        subModule: "list",
        title: "Payment approval List",
        link: "/admin/subscriber-management/payment-list",
      },
      {
        subModule: "create",
        title: "Add new Subscriber",
        link: "/admin/subscriber-management/add-new-subscriber",
      },
      {
        subModule: "edit",
        title: "Subscription Process",
        link: "/admin/subscriber-management/subscription-process",
      },
      {
        subModule: "view",
        title: "Invoice",
        link: "/admin/subscriber-management/subscriber-invoice",
      },
      {
        subModule: "view",
        title: "profile",
        link: "/admin/subscriber-management/subscriber-profile",
      },
      {
        subModule: "view",
        title: "Invoice",
        link: "/admin/subscriber-management/view-invoice",
      },
    ],
  },
  {
    title: "Reseller Management",
    link: "/admin/partner-management",
    submenu: true,
    submenuItems: [
      {
        subModule: "view",
        title: "Reseller management",
        link: "/admin/partner-management/subscriberlist",
      },
      {
        subModule: "list",
        title: "Resellers List",
        link: "/admin/partner-management",
      },
    ],
  },
  {
    title: "News Management",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "News Management",
        link: "/admin/news/news-list",
      },
      {
        subModule: "create",
        title: "Create News",
        link: "/admin/news/create-new-article",
      },
      {
        subModule: "view",
        title: "View News",
        link: "/admin/news",
      },
    ],
  },
  {
    title: "Events Management",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Events Management",
        link: "/admin/events/events-list",
      },
      {
        subModule: "create",
        title: "Create Events",
        link: "/admin/events/create-new-event",
      },
      {
        subModule: "view",
        title: "View Events",
        link: "/admin/events",
      },
    ],
  },
  {
    title: "Research Report Management",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Research Report List",
        link: "/admin/research-report-management/report-list",
      },
      {
        subModule: "list",
        title: "Research Report WhatsApp Summary",
        link: "/admin/research-report-management/whatsapp-summary",
      },
      {
        subModule: "create",
        title: "Create Research Report",
        link: "/admin/research-report-management/add-research-report",
      },
      // {
      //   subModule:"view",
      //   title: "View News",
      //   link: "/admin/news",
      // },
    ],
  },
  {
    title: "Technical View",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Research Report List",
        link: "/admin/research-report-management/report-list",
      },
      {
        subModule: "create",
        title: "Create Research Report",
        link: "/admin/research-report-management/add-research-report",
      },
      // {
      //   subModule:"view",
      //   title: "View News",
      //   link: "/admin/news",
      // },
    ],
  },
  {
    title: "Knowledge Center",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Knowledge Center List",
        link: "/admin/knowledge-center/knowledge-center-list",
      },
      {
        subModule: "create",
        title: "Create Knowledge Center",
        link: "/admin/knowledge-center/add-knowledge-center",
      },
      {
        subModule: "edit",
        title: "Edit Knowledge Center",
        link: "/admin/master-data/knowledgecentersubcategory",
      },
      {
        subModule: "edit",
        title: "Edit Knowledge Center",
        link: "/admin/master-data/knowledgecentercategory",
      },
      {
        subModule: "view",
        title: "View Knowledge Center",
        link: "/admin/knowledge-center/",
      },

      // {
      //   subModule:"view",
      //   title: "View News",
      //   link: "/admin/news",
      // },
    ],
  },
  {
    title: "Photo Gallery",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Photo Gallery",
        link: "/admin/photo/photo-gallery",
      },
      {
        subModule: "create",
        title: "Create Photo",
        link: "/admin/photo/add-new-photo",
      },
      {
        subModule: "view",
        title: "View Photo",
        link: "/admin/photo/photo-details",
      },
    ],
  },
  {
    title: "Video Gallery",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Video Gallery",
        link: "/admin/video/video-gallery",
      },
      {
        subModule: "create",
        title: "Create Video",
        link: "/admin/video/add-new-video",
      },
      {
        subModule: "view",
        title: "View Video",
        link: "/admin/video/video-details",
      },
    ],
  },
  {
    title: "Podcast Management",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Podcast Gallery",
        link: "/admin/podcast-management/podcast-gallery",
      },
      {
        subModule: "create",
        title: "Create Podcast",
        link: "/admin/podcast-management/add-new-podcast",
      },
      {
        subModule: "view",
        title: "View Podcast",
        link: "/admin/podcast-management/podcast-details",
      },
    ],
  },
  {
    title: "Access Management",
    submenu: true,
    submenuItems: [
      {
        subModule: "create",
        title: "Access Allocation",
        link: "/admin/access-management/access-allocation",
      },
      {
        subModule: "list",
        title: "Access List",
        link: "/admin/access-management/access-list",
      },
      {
        subModule: "create",
        title: "Access Profile",
        link: "/admin/access-management/access-profile",
      },
    ],
  },
  {
    title: "Trading Call",
    submenu: true,
    submenuItems: [
      {
        subModule: "create",
        title: "Add New Trading Call",
        link: "/admin/trading-call/add-trading-call",
      },
      {
        subModule: "create",
        title: "Add New Multi-leg Call",
        link: "/admin/trading-call/add-multileg-call",
      },
      {
        subModule: "list",
        title: "Trading List",
        link: "/admin/trading-call/trading-call-list",
      },
      {
        subModule: "list",
        title: "WhatsApp Summary",
        link: "/admin/trading-call/whatsapp-summary",
      },
      {
        subModule: "create",
        title: "trading call Profile",
        link: "/admin/trading-call/trading-call-profile",
      },
    ],
  },
  {
    title: "Test Trading Call",
    submenu: true,
    submenuItems: [
      {
        subModule: "create",
        title: "Add New Trading Call",
        link: "/admin/trading-call-new/add-trading-call",
      },
      // {
      //   subModule: "list",
      //   title: "Trading List",
      //   link: "/admin/trading-call/trading-call-list",
      // },
      // {
      //   subModule: "list",
      //   title: "WhatsApp Summary",
      //   link: "/admin/trading-call/whatsapp-summary",
      // },
      // {
      //   subModule: "create",
      //   title: "trading call Profile",
      //   link: "/admin/trading-call/trading-call-profile",
      // },
    ],
  },
  {
    title: "Stock Basket",
    submenu: true,
    submenuItems: [
      {
        subModule: "list",
        title: "Basket List",
        link: "/admin/stock-basket/basket-list",
      },
      {
        subModule: "create",
        title: "Create Basket",
        link: "/admin/stock-basket/add-new-basket",
      },
      {
        subModule: "view",
        title: "View Basket",
        link: "/admin/stock-basket/view-basket",
      },
      {
        subModule: "create",
        title: "BhavCopy List",
        link: "/admin/stock-basket/bhavCopy-list",
      },
      {
        subModule: "create",
        title: "BulkUpload",
        link: "/admin/stock-basket/bulk-upload",
      },
    ],
  },
];
