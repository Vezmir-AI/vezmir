import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Switch } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { useProfile } from "@/context/ProfileContext";
import { usageData } from '@/types'
import { getWeekStart, getWeekEnd, formatDate } from '@/utils';

const UsageConsumptionArea: React.FC = () => {
    const [showDetails, setShowDetails] = useState(false);
    const [displayData, setDisplayData] = useState<usageData[]>([]);
    const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
    const thisWeek = getWeekStart(new Date());
    const [futureWeekDisabled, setFutureWeekDisabled] = useState(formatDate(currentWeek) === formatDate(thisWeek));
    const [hasData, setHasData] = useState(true);
    const [loading, setLoading] = useState(false);
    const { usage, getTokenUsage } = useProfile();

    // reloads data on route change
    useEffect(()=>{
        if (usage.money_usage){
            const weekStart = getWeekStart(currentWeek);
            const weekEnd = getWeekEnd(weekStart);
            getTokenUsage(formatDate(weekStart), formatDate(weekEnd));
        }
    },[])

    useEffect(() => {
        setFutureWeekDisabled(formatDate(currentWeek) === formatDate(thisWeek))
        const weekStart = getWeekStart(currentWeek);
        const weekEnd = getWeekEnd(weekStart);

        if (usage.token_usage && usage.token_usage.some(item => item.date === formatDate(weekEnd))) {
            setLoading(false);
            const weekData = generateWeekData(weekStart);
            setDisplayData(weekData);
        } else {
            setLoading(true);
            getTokenUsage(formatDate(weekStart), formatDate(weekEnd));
        }
    }, [currentWeek, usage.token_usage]);

    const generateWeekData = (weekStart: Date) => {
        const weekData = [];
        let hasDataForWeek = false;
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(currentDate.getDate() + i);
            const formattedDate = formatDate(currentDate);
            const existingData = usage.token_usage?.find(item => item.date === formattedDate)

            if (existingData) {
                weekData.push(existingData);
                if (existingData.total > 0) {
                    hasDataForWeek = true;
                }
            }
        }
        setHasData(hasDataForWeek);
        return weekData;
    };

    const handlePreviousWeek = () => {
        setCurrentWeek(prevWeek => {
            const newDate = new Date(prevWeek);
            newDate.setDate(newDate.getDate() - 7);
            return newDate;
        });
    };

    const handleNextWeek = () => {
        if (currentWeek !== thisWeek) {
            setCurrentWeek(nextWeek => {
                const newDate = new Date(nextWeek);
                newDate.setDate(newDate.getDate() + 7);
                return newDate;
            });
        }
    };

    const formatWeekRange = (date: Date) => {
        const weekStart = getWeekStart(date);
        const weekEnd = getWeekEnd(weekStart);
        return `${weekStart.getDate()} ${weekStart.toLocaleString('default', { month: 'short' })} ${weekStart.getFullYear()} - ${weekEnd.getDate()} ${weekEnd.toLocaleString('default', { month: 'short' })} ${weekEnd.getFullYear()}`;
    };


    return (
        <div className={`${loading ? 'bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 animate-gradient-loading' : ''}`}>
            <div className="flex justify-between items-center p-2">
                <h2 className="text-lg font-semibold">Models used</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Show Details</span>
                    <Switch
                        checked={showDetails}
                        onChange={() => setShowDetails(!showDetails)}
                        className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-vezmir focus:ring-offset-2 data-[checked]:bg-vezmir"
                    >
                        <span className="sr-only">Use setting</span>
                        <span
                            aria-hidden="true"
                            className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                        />
                    </Switch>
                </div>
            </div>

            {loading ? (
                <div className="h-24 flex justify-center items-center px-10" />
            ) : (
                <>
                    <div className="h-24">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={displayData}
                                margin={{
                                    top: 5,
                                    right: 25,
                                    left: 0,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="day" />
                                <YAxis />
                                {hasData && (
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none' }}
                                        labelStyle={{ color: '#333' }}
                                        itemStyle={{ color: '#6D071A' }}
                                        formatter={(value, name) => [`${value} tokens`, name]}
                                    />
                                )}
                                {showDetails ? (
                                    <>
                                        <Area type="monotone" dataKey="chatgpt" stackId="1" stroke="#00B48C" fill="#00B48C" animationDuration={500} />
                                        <Area type="monotone" dataKey="claude" stackId="1" stroke="#D4A27F" fill="#D4A27F" animationDuration={500} />
                                        <Area type="monotone" dataKey="gemini" stackId="1" stroke="#4C9EDD" fill="#4C9EDD" animationDuration={500} />
                                    </>
                                ) : (
                                    <Area type="monotone" dataKey="total" stroke="#FFF" fill="#6D071A" animationDuration={500} />
                                )}
                                {!hasData && (
                                    <text x="50%" y="30%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="14">
                                        No data available for this week
                                    </text>
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
            <div className="flex justify-between items-center">
                <button
                    onClick={handlePreviousWeek}
                    className={`p-2 sm:p-3 flex items-center rounded-md ${loading ? 'bg-transparent' : 'bg-gray-500 sm:bg-gray-800'}`}
                    disabled={loading}
                >
                    <ChevronLeftIcon className="h-6 w-6 sm:h-5 sm:w-5" />
                    <span className="ml-1 text-sm hidden sm:inline">Previous</span>
                </button>
                <span className="text-sm font-medium">{formatWeekRange(currentWeek)}</span>
                <button
                    onClick={handleNextWeek}
                    className={`p-2 sm:p-3 flex items-center rounded-md ${loading ? 'bg-transparent' : 'bg-gray-500 sm:bg-gray-800'} ${futureWeekDisabled ? 'text-gray-600' : ''}`}
                    disabled={futureWeekDisabled || loading}
                >
                    <span className="mr-1 text-sm hidden sm:inline">Next</span>
                    <ChevronRightIcon className="h-6 w-6 sm:h-5 sm:w-5" />
                </button>
            </div>
        </div>
    )
}


export default UsageConsumptionArea;