import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileTab from "./Dashboard/ProfileTab";
import UsageTab from './Dashboard/UsageTab';
import BillingTab from './Dashboard/BillingTab';

const Dashboard: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  let Component: React.FC = () => <div> No tab {section} exists. Redirecting...</div>
  switch (section) {
    case "profile":
      Component = ProfileTab;
      break;
    case "usage":
      Component = UsageTab;
      break;
    case "billing":
      Component = BillingTab;
      break;
    default:
      console.error("No tab exists")
      setTimeout(() => {
        navigate("/dashboard/profile")
      }, 3000);
  }
  return (
    <div>
      <Component />
    </div>
  );
};

export default Dashboard;