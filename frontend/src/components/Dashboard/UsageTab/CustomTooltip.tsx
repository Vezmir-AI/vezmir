import React from "react";

interface CustomTooltipType {
    active: boolean,
    payload: any,
    label: string,
}

const CustomTooltip: React.FC<CustomTooltipType> = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].value) {
        return (
            <>
                <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-semibold text-gray-600 mb-1">{label}</div>
                    <div className="flex flex-col">
                        {payload.map((item: any) => (
                            item.value?(
                            <div key={item.name} className="flex items-center mb-2">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                                <span className="font-bold text-gray-800">{`${item.name}: ${item.value<0.01? "<$0.01" : `$${item.value.toFixed(2)}`}`}</span>
                            </div>): <></>
                        ))}
                    </div>
                </div>
            </>
        );
    }
    return null;
};

export default CustomTooltip;
