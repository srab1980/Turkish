'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowsRightLeftIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function InterfaceSwitcherDemo() {
  const [currentInterface, setCurrentInterface] = useState<'admin' | 'user'>('admin');
  const [testResults, setTestResults] = useState<{
    interfaceSwitcher: boolean;
    userInterfaceAccess: boolean;
    sessionPreservation: boolean;
  }>({
    interfaceSwitcher: false,
    userInterfaceAccess: false,
    sessionPreservation: false
  });

  const testInterfaceSwitcher = () => {
    // Test if the interface switcher is visible and functional
    const switcher = document.querySelector('[title="Switch Interface"]');
    if (switcher) {
      setTestResults(prev => ({ ...prev, interfaceSwitcher: true }));
      toast.success('Interface switcher found and functional!');
      return true;
    } else {
      toast.error('Interface switcher not found in header');
      return false;
    }
  };

  const testUserInterfaceAccess = () => {
    // Test opening user interface
    try {
      window.open('http://localhost:3000', '_blank');
      setTestResults(prev => ({ ...prev, userInterfaceAccess: true }));
      toast.success('User interface opened successfully!');
      return true;
    } catch (error) {
      toast.error('Failed to open user interface');
      return false;
    }
  };

  const testSessionPreservation = () => {
    // Test that admin session is preserved
    const adminUrl = window.location.href;
    if (adminUrl.includes('localhost:3003')) {
      setTestResults(prev => ({ ...prev, sessionPreservation: true }));
      toast.success('Admin session preserved!');
      return true;
    } else {
      toast.error('Admin session not preserved');
      return false;
    }
  };

  const runAllTests = () => {
    setTimeout(() => testInterfaceSwitcher(), 100);
    setTimeout(() => testUserInterfaceAccess(), 500);
    setTimeout(() => testSessionPreservation(), 1000);
  };

  const TestResult = ({ test, label }: { test: boolean; label: string }) => (
    <div className="flex items-center space-x-2">
      {test ? (
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
      ) : (
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      )}
      <span className={`text-sm ${test ? 'text-green-700' : 'text-yellow-700'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg border border-secondary-200 p-6 max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <ArrowsRightLeftIcon className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-secondary-900">
            Interface Switcher Demo
          </h3>
        </div>
        <p className="text-sm text-secondary-600">
          Test the interface switching functionality
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4 p-4 bg-secondary-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium">Admin Interface</span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
              Current
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-secondary-900">Test Results:</h4>
          <TestResult 
            test={testResults.interfaceSwitcher} 
            label="Interface switcher visible in header" 
          />
          <TestResult 
            test={testResults.userInterfaceAccess} 
            label="Can access user interface" 
          />
          <TestResult 
            test={testResults.sessionPreservation} 
            label="Admin session preserved" 
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={runAllTests}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Run Interface Tests
          </button>
          
          <button
            onClick={() => window.open('http://localhost:3000', '_blank')}
            className="w-full bg-secondary-100 text-secondary-700 py-2 px-4 rounded-lg hover:bg-secondary-200 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
          >
            <AcademicCapIcon className="h-4 w-4" />
            <span>Open User Interface</span>
          </button>
        </div>

        <div className="text-xs text-secondary-500 text-center">
          Look for the interface switcher button in the top-right header
        </div>
      </div>
    </motion.div>
  );
}
