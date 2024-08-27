import React, { useEffect, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import { useProfile } from '@/context/ProfileContext';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const UsageSummaryCard: React.FC = () => {
    const { usage, getMoneySpent } = useProfile();
    const [currentSpending, setCurrentSpending] = useState(0);
    const [moneySaved, setMoneySaved] = useState(0);
    const [changeType, setChangeType] = useState<'increase' | 'decrease'>('increase');

    // relaods data on route change
    useEffect(() => {
        if (usage.money_usage) {
            getMoneySpent();
        }
    }, [])

    useEffect(() => {
        if (usage.money_spent === undefined) {
            getMoneySpent();
        } else {
            setCurrentSpending(usage.money_spent);
            const saved = 20 - usage.money_spent;
            setMoneySaved(saved);
            setChangeType(saved >= 0 ? 'increase' : 'decrease');
        }
    }, [usage.money_spent]);

    return (
        <>
            <h2 className="text-lg font-semibold p-2 text-white">Usage Summary</h2>
            <div className="h-24">
                <div className="h-full w-full overflow-hidden rounded-lg bg-[var(--gray-800)] shadow">
                    <div className="flex h-full">
                        <div className="flex-1 flex flex-col justify-center px-2 py-4 sm:p-4">
                            <dt className="text-xs font-normal text-[var(--gray-400)] mb-1">Current Spending</dt>
                            <dd className="flex flex-col items-start">
                                <span className="text-2xl font-semibold text-[var(--bordeaux-clear)]">${currentSpending.toFixed(2)}</span>
                                <span className="text-xs text-[var(--gray-400)]">out of $20 for the last month</span>
                            </dd>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <div className={classNames(
                                changeType === 'increase' ? 'bg-[var(--gray-700)]' : 'bg-[var(--gray-700)]',
                                'rounded-full p-4 flex items-center'
                            )}>
                                {changeType === 'increase' ? (
                                    <ArrowUpIcon className="h-6 w-6 text-green-500 mr-2" />
                                ) : (
                                    <ArrowDownIcon className="h-6 w-6 text-red-500 mr-2" />
                                )}
                                <div className="flex flex-col">
                                    <span className={classNames(
                                        changeType === 'increase' ? 'text-green-400' : 'text-red-400',
                                        'text-xl font-bold'
                                    )}>${Math.abs(moneySaved).toFixed(2)}</span>
                                    <span className="text-xs text-[var(--gray-400)]">
                                        {changeType === 'increase' ? 'Money Saved' : 'Over Budget'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default UsageSummaryCard;