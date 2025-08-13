import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Building2,
  Package,
  BarChart3
} from 'lucide-react';
import { useUIStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface SidebarModule {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  children?: {
    name: string;
    path: string;
    icon?: React.ComponentType<any>;
  }[];
}

const modules: SidebarModule[] = [
  {
    name: 'Home',
    icon: Home,
    path: '/',
  },
  {
    name: 'Setup',
    icon: Settings,
    path: '/setup',
    children: [
      { name: 'Company', path: '/setup/company' },
      { name: 'Users', path: '/setup/users' },
      { name: 'Roles', path: '/setup/roles' },
    ]
  },
  {
    name: 'Accounts',
    icon: DollarSign,
    path: '/accounts',
    children: [
      { name: 'Chart of Accounts', path: '/accounts/chart-of-accounts' },
      { name: 'Journal Entry', path: '/accounts/journal-entry' },
      { name: 'Payment Entry', path: '/accounts/payment-entry' },
      { name: 'Sales Invoice', path: '/accounts/sales-invoice' },
      { name: 'Purchase Invoice', path: '/accounts/purchase-invoice' },
    ]
  },
  {
    name: 'Selling',
    icon: ShoppingCart,
    path: '/selling',
    children: [
      { name: 'Customer', path: '/selling/customer' },
      { name: 'Lead', path: '/selling/lead' },
      { name: 'Opportunity', path: '/selling/opportunity' },
      { name: 'Quotation', path: '/selling/quotation' },
      { name: 'Sales Order', path: '/selling/sales-order' },
    ]
  },
  {
    name: 'Buying',
    icon: Package,
    path: '/buying',
    children: [
      { name: 'Supplier', path: '/buying/supplier' },
      { name: 'Request for Quotation', path: '/buying/request-for-quotation' },
      { name: 'Supplier Quotation', path: '/buying/supplier-quotation' },
      { name: 'Purchase Order', path: '/buying/purchase-order' },
    ]
  },
  {
    name: 'Stock',
    icon: Building2,
    path: '/stock',
    children: [
      { name: 'Item', path: '/stock/item' },
      { name: 'Warehouse', path: '/stock/warehouse' },
      { name: 'Stock Entry', path: '/stock/stock-entry' },
      { name: 'Stock Reconciliation', path: '/stock/stock-reconciliation' },
    ]
  },
  {
    name: 'HR',
    icon: Users,
    path: '/hr',
    children: [
      { name: 'Employee', path: '/hr/employee' },
      { name: 'Leave Application', path: '/hr/leave-application' },
      { name: 'Attendance', path: '/hr/attendance' },
      { name: 'Salary Structure', path: '/hr/salary-structure' },
    ]
  },
  {
    name: 'Reports',
    icon: BarChart3,
    path: '/reports',
  },
];

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, currentModule, setCurrentModule } = useUIStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2"
            >
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">ERPNext</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {modules.map((module) => (
          <SidebarItem
            key={module.name}
            module={module}
            collapsed={sidebarCollapsed}
            isActive={currentModule === module.name}
            onClick={() => setCurrentModule(module.name)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              ERPNext Frontend v1.0.0
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

interface SidebarItemProps {
  module: SidebarModule;
  collapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ module, collapsed, isActive, onClick }) => {
  const [isExpanded, setIsExpanded] = React.useState(isActive);
  const Icon = module.icon;

  React.useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  const handleClick = () => {
    onClick();
    if (module.children) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <NavLink
        to={module.path}
        onClick={handleClick}
        className={({ isActive: isNavActive }) =>
          clsx(
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
            {
              'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300': isNavActive || isActive,
              'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white': !isNavActive && !isActive,
            }
          )
        }
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 truncate"
            >
              {module.name}
            </motion.span>
          )}
        </AnimatePresence>
        {!collapsed && module.children && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        )}
      </NavLink>

      {/* Submenu */}
      <AnimatePresence>
        {!collapsed && module.children && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="ml-8 mt-1 space-y-1"
          >
            {module.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200',
                    {
                      'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300': isActive,
                      'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300': !isActive,
                    }
                  )
                }
              >
                <span className="truncate">{child.name}</span>
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;