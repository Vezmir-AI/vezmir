import React from 'react';
import UsageConsumptionArea from './UsageConsumptionArea';
import UsageHistoryBar from './UsageHistoryBar';
import UsageSummaryCard from './UsageSummaryCard';
import { useTheme } from '@/context/ThemeContext';

const UsageTab: React.FC = () => {
  const { locale } = useTheme();
  return (
    <div className="xl:px-16 bg-[var(--gray-800)] h-screen">
      <div className="max-w-7xl px-4 mt-12 sm:px-6 lg:px-8">
        <h1 className="text-2xl px-2 font-semibold leading-7 text-white mb-4">{locale('dashboard_usage_information')}</h1>
        <p className="mt-1 px-2 text-sm leading-6 text-gray-400 mb-6">{locale('dashboard_usage_information_description')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[var(--gray-700)] rounded-lg p-6">
            <UsageSummaryCard />
          </div>
          <div className="bg-[var(--gray-700)] rounded-lg p-6">
            <UsageConsumptionArea />
          </div>
        </div>

        <div className="bg-[var(--gray-700)] rounded-lg p-6 mt-8">
          <UsageHistoryBar />
        </div>
      </div>
    </div>
  );
};

export default UsageTab;
