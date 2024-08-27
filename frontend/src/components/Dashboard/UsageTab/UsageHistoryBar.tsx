import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Switch } from '@headlessui/react'
import { useProfile } from '@/context/ProfileContext';
import { usageData } from '@/types';
import { formatDate, formatDateReadable } from '@/utils';
import CustomTooltip from './CustomTooltip';


const UsageHistoryBar: React.FC = () => {
    const [displayedData, setDisplayedData] = useState<usageData[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [futureMonthDisabled, setFutureMonthDisabled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const { usage, getMoneyUsage } = useProfile();

    // relaods data on route change
    useEffect(() => {
        if (usage.money_usage) {
            const startDate = new Date(currentYear, currentMonth, 1);
            const endDate = new Date(currentYear, currentMonth + 1, 0);
            getMoneyUsage(formatDate(startDate), formatDate(endDate));
        }
    }, [])

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        if (isMobile) {
            // Display only every 10th tick on mobile
            return index % 10 === 0 ? value : '';
        }
        // Display only every 5th tick on desktop
        return index % 5 === 0 ? value : '';
    };

    return (
        <div className={`${loading ? 'bg-gradient-to-r from-[var(--gray-800) via-[var(--gray-600) to-[var(--gray-800) animate-gradient-loading' : ''}`}>
            <div className="flex flex-col items-center justify-between p-2 space-y-4 sm:space-y-0 sm:flex-row">
                <h2 className="text-lg font-semibold">Usage</h2>
                <div className="flex items-center justify-center w-full sm:flex-1">
                    <div className="flex items-center justify-between w-full max-w-[280px] sm:w-64">
                        <button 
                            onClick={handlePreviousMonth} 
                            className="p-2 rounded-full transition-colors duration-200 hover:bg-[var(--bordeaux-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--bordeaux-hover)] focus:ring-opacity-50" 
                            disabled={loading}
                        >
                            <ChevronLeftIcon className="w-6 h-6 sm:w-5 sm:h-5" />
                        </button>
                        <span className="text-center text-base sm:text-sm font-medium">
                            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button 
                            onClick={handleNextMonth} 
                            className={`p-2 rounded-full transition-colors duration-200 hover:bg-[var(--bordeaux-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--bordeaux-hover)] focus:ring-opacity-50 ${
                                futureMonthDisabled 
                                    ? 'text-[var(--gray-500)] bg-[var(--gray-600)] hover:bg-[var(--gray-600)]' 
                                    : ''
                            }`} 
                            disabled={futureMonthDisabled || loading}
                        >
                            <ChevronRightIcon className="w-6 h-6 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-[var(--gray-400)]">Show Details</span>
                    <Switch
                        checked={showDetails}
                        onChange={() => setShowDetails(!showDetails)}
                        className="usage-switch group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out"
                    >
                        <span className="sr-only">Use setting</span>
                        <span
                            className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                        />
                    </Switch>
                </div>
            </div>
            <div className="w-full">
                {loading ? (
                    <div className="h-[300px] flex justify-center items-center px-10" />
                ) : (
                    <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                        <BarChart
                            data={displayedData}
                            margin={{
                                top: 20,
                                right: 10,
                                left: 10,
                                bottom: 5,
                            }}
                            onMouseMove={(state) => {
                                if (hasData && state.isTooltipActive) {
                                    setActiveIndex(state.activeTooltipIndex ?? -1);
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
                                tick={{ fill: 'white', fontSize: isMobile ? 8 : 12 }}
                            />
                            <YAxis
                                tickFormatter={(value) => `$${value}`}
                                tick={{ fill: 'white', fontSize: isMobile ? 8 : 9 }}
                                domain={[0.01, 'dataMax']}
                                width={40}
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
                                <Bar dataKey="total" fill="#8F22FC" stroke="#FFF" radius={[10, 10, 0, 0]}>
                                    {displayedData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            accentHeight={0.01}
                                            fill={activeIndex === index ? '#B469FF' : '#8F22FC'}
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