import React from 'react';

const LoadingComponent: React.FC = () => {
    return (
        <div className="w-full h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-gradient-loading" />
    );
};

export default LoadingComponent;