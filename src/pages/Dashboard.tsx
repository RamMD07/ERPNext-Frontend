import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Users, 
  FileText, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Plus,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import frappeAPI from '../lib/api';

interface DashboardMetric {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<any>;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

interface QuickCreate {
  label: string;
  doctype: string;
  module: string;
  icon: React.ComponentType<any>;
  color: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick create items
  const quickCreateItems: QuickCreate[] = [
    {
      label: 'Customer',
      doctype: 'Customer',
      module: 'selling',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'Sales Invoice',
      doctype: 'Sales Invoice',
      module: 'accounts',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      label: 'Sales Order',
      doctype: 'Sales Order',
      module: 'selling',
      icon: ShoppingCart,
      color: 'bg-purple-500'
    },
    {
      label: 'Item',
      doctype: 'Item',
      module: 'stock',
      icon: Activity,
      color: 'bg-orange-500'
    },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard metrics (simplified)
      const mockMetrics: DashboardMetric[] = [
        {
          title: 'Total Sales',
          value: '$45,231',
          change: '+12.5%',
          icon: DollarSign,
          color: 'text-green-600',
          trend: 'up'
        },
        {
          title: 'New Customers',
          value: 156,
          change: '+8.2%',
          icon: Users,
          color: 'text-blue-600',
          trend: 'up'
        },
        {
          title: 'Pending Orders',
          value: 23,
          change: '-4.1%',
          icon: ShoppingCart,
          color: 'text-orange-600',
          trend: 'down'
        },
        {
          title: 'Total Revenue',
          value: '$125,847',
          change: '+15.3%',
          icon: TrendingUp,
          color: 'text-purple-600',
          trend: 'up'
        },
      ];

      setMetrics(mockMetrics);

      // Load recent documents
      try {
        const recent = await frappeAPI.getList('ToDo', {
          fields: ['name', 'description', 'status', 'creation'],
          limit_page_length: 5,
          order_by: 'creation desc'
        });
        setRecentDocs(recent);
      } catch (error) {
        console.error('Failed to load recent documents:', error);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreate = (item: QuickCreate) => {
    navigate(`/${item.module}/${item.doctype}/new`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.full_name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening with your business today.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </p>
                    <p className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                      {metric.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.color.replace('text-', 'bg-').replace('-600', '-100')} dark:${metric.color.replace('text-', 'bg-').replace('-600', '-900')}`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Create */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Quick Create
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                {quickCreateItems.map((item) => (
                  <Button
                    key={item.doctype}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleQuickCreate(item)}
                  >
                    <div className={`p-1 rounded ${item.color} text-white mr-3`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    {item.label}
                  </Button>
                ))}
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </Card.Title>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Content>
              {recentDocs.length > 0 ? (
                <div className="space-y-4">
                  {recentDocs.map((doc, index) => (
                    <div key={doc.name} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.description || doc.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(doc.creation).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        doc.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        doc.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Sales Overview
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Charts will be implemented with a charting library</p>
                <p className="text-sm mt-2">Consider using Chart.js, D3.js, or Recharts</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;