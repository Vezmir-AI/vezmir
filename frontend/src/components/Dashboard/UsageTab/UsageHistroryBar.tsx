import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import CustomTooltip from './CustomTooltip';
import { Switch } from '@headlessui/react'
import { useProfile } from '@/context/ProfileContext';
import { usageData } from '@/types/serverTypes';
import { formatDate, formatDateReadable } from '@/utils';


const UsageHistoryBar: React.FC = () => {
    const [displayedData, setDisplayedData] = useState<usageData[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [futureMonthDisabled, setFutureMonthDisabled] = useState(false);

    const { usage, getMoneyUsage } = useProfile();

    // relaods data on route change
    useEffect(()=>{
        if (usage.money_usage){
            const startDate = new Date(currentYear, currentMonth, 1);
            const endDate = new Date(currentYear, currentMonth + 1, 0);
            getMoneyUsage(formatDate(startDate), formatDate(endDate));
        }
    },[])

    useEffect(() => {
        const today = new Date();
        setFutureMonthDisabled(currentYear === today.getFullYear() && currentMonth === today.getMonth());

        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        if (usage.money_usage && usage.money_usage.some(item => formatDate(new Date(item.date)) === formatDate(endDate))) {
            setLoading(false);
            const monthData = generateMonthData(currentMonth, currentYear);
            setDisplayedData(monthData);
        } else {
            setLoading(true);
            getMoneyUsage(formatDate(startDate), formatDate(endDate));
        }
    }, [currentMonth, usage.money_usage]);

    const generateMonthData = (month: number, year: number) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthData: usageData[] = [];
        let hasDataForMonth = false;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const formattedDate = formatDate(date);
            const existingData = usage.money_usage?.find(item => item.date === formattedDate);

            if (existingData) {
                monthData.push({
                    ...existingData,
                    date: formatDateReadable(date)
                });
                if (existingData.total > 0) {
                    hasDataForMonth = true;
                }
            }
        }

        setHasData(hasDataForMonth);
        return monthData;
    };

    const handlePreviousMonth = () => {
        if (!loading) {
            setCurrentMonth(prevMonth => {
                if (prevMonth === 0) {
                    setCurrentYear(prevYear => prevYear - 1);
                    return 11;
                }
                return prevMonth - 1;
            });
        }
    };

    const handleNextMonth = () => {
        if (!loading && !futureMonthDisabled) {
            setCurrentMonth(prevMonth => {
                if (prevMonth === 11) {
                    setCurrentYear(prevYear => prevYear + 1);
                    return 0;
                }
                return prevMonth + 1;
            });
        }
    };

    const tickFormatter = (value: string, index: number) => {
        // Display only every 5th tick
        if (index % 5 === 0) {
            return value;
        }
        return '';
    };

    return (
        <div className={`${loading ? 'bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 animate-gradient-loading' : ''}`}>
            <div className="flex items-center justify-between p-2">
                <h2 className="text-lg font-semibold">Usage</h2>
                <div className="flex items-center justify-center flex-1">
                    <div className="flex items-center justify-between w-64">
                        <button onClick={handlePreviousMonth} className="p-1 rounded-full hover:bg-gray-200" disabled={loading}>
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <span className="text-center">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={handleNextMonth} className={`p-1 rounded-full ${futureMonthDisabled ? 'text-gray-600' : 'hover:bg-gray-200'}`} disabled={futureMonthDisabled || loading}>
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
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
            <div className="w-full">
                {loading ? (
                    <div className="h-[300px] flex justify-center items-center px-10" />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={displayedData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                            onMouseMove={(state) => {
                                if (hasData && state.isTooltipActive) {
(state.activeTooltipIndex ?? -1);
                                } else {
                                    setActiveIndex(-1);
                                }
                            }}
                            onMouseLeave={() => setActiveIndex(-1)}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={tickFormatter}
                                allowDataOverflow={true}
                                scale="band"
                                type="category"
                                tick={{ fill: 'white' }}
                            />
                            <YAxis 
                                tickFormatter={(value) => `$${value}`} 
                                tick={{ fill: 'white' }} 
                                domain={[0.01, 'dataMax']}
                            />
                            {hasData && (
                                <Tooltip
                                    formatter={(value) => `$${value}`}
                                    cursor={false}
                                    position={{ y: 30 }}
                                    content={<CustomTooltip active={activeIndex !== -1} payload={displayedData[activeIndex]} label={displayedData[activeIndex]?.date} />}
                                />
                            )}
                            <Legend />
                            {!showDetails ? (
                                <Bar dataKey="total" fill="#6D071A" stroke="#FFF" radius={[10, 10, 0, 0]}>
                                    {displayedData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            accentHeight={0.01}
                                            fill={activeIndex === index ? '#8B0000' : '#6D071A'}
                                            stroke="#FFF"
                                            opacity={!hasData || activeIndex === -1 || activeIndex === index ? 1 : 0.3}
                                        />
                                    ))}
                                </Bar>
                            ) : (
                                <>
                                    {['chatgpt', 'claude', 'gemini'].map((dataKey, i) => (
                                        <Bar key={dataKey} dataKey={dataKey} stackId="a" fill={['#00B48C', '#D4A27F', '#4C9EDD'][i]} stroke="#FFF">
                                            {displayedData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    opacity={!hasData || activeIndex === -1 || activeIndex === index ? 1 : 0.3}
                                                />
                                            ))}
                                        </Bar>
                                    ))}
                                </>
                            )}
                            {!hasData && (
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="14">
                                    No data available for this month
                                </text>
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}

export default UsageHistoryBar;