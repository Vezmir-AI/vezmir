import React from 'react';
import UsageConsumptionArea from './UsageConsumptionArea';
import UsageHistoryBar from './UsageHistoryBar';
import UsageProgressionBar from './UsageProgressionBar';


const UsageTab: React.FC = () => {
  return (
    <div>
      <div className="bg-gray-900 text-white p-6 space-y-6">
        <h1 className="text-2xl font-bold">Uzage tab</h1>
        <p className="text-gray-400">Here you will find all the information related to your usage</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 bg-gray-800">
            <UsageProgressionBar desc='over the last 30 days' stat='12.3' previousStat='20' change='7.7' changeType='increase' />
          </div>
          <div className="bg-gray-800">
            <div>
              <UsageConsumptionArea />
            </div>
          </div>
        </div>

        <div className="space-y-2  bg-gray-800">
          <UsageHistoryBar />
        </div>
      </div>
    </div>
  );
};

export default UsageTab;
