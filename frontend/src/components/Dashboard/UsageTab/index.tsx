import React from 'react';
import UsageConsumptionArea from './UsageConsumptionArea';
import UsageHistoryBar from './UsageHistoryBar';
import UsageSummaryCard from './UsageSummaryCard';

const UsageTab: React.FC = () => {
  return (
    <div className="bg-[var(--gray-900)] text-white p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Usage</h1>
      <p className="text-[var(--gray-400)]">Here you will find all the information related to your usage</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--gray-800)] rounded-lg p-4">
          <UsageSummaryCard />
        </div>
        <div className="bg-[var(--gray-800)] rounded-lg p-4">
          <UsageConsumptionArea />
        </div>
      </div>

      <div className="bg-[var(--gray-800)] rounded-lg p-4">
        <UsageHistoryBar />
      </div>
    </div>
  );
};

export default UsageTab;
