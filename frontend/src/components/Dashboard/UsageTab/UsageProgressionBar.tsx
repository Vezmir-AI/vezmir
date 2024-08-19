import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}
interface UsageProgressionBarProps {
    desc: string;
    stat: string;
    previousStat: string;
    change: string;
    changeType: string;
}

const UsageProgressionBar: React.FC<UsageProgressionBarProps> = (progression) => {
    return (
        <>
            <h2 className="text-lg font-semibold p-2">Money Saved</h2>
            <div className="h-24">

                <div className="h-full w-full overflow-hidden rounded-lg bg-white shadow">
                    <div className="flex h-full">
                        <div className="flex-1 flex flex-col justify-center px-4 py-3 sm:p-4">
                            <dt className="text-xs font-normal text-gray-400 mb-1">{progression.desc}</dt>
                            <dd className="flex flex-col items-start">
                                <span className="text-2xl font-semibold text-vezmir">${progression.stat}</span>
                                <span className="text-xs text-gray-500">from ${progression.previousStat}</span>
                            </dd>
                        </div>
                        <div className="flex-1"></div>
                        <div className="flex-1 flex items-center justify-center">
                            <div className={classNames(
                                progression.changeType === 'increase' ? 'bg-green-100' : 'bg-red-100',
                                'rounded-full p-4 flex items-center'
                            )}>
                                {progression.changeType === 'increase' ? (
                                    <ArrowUpIcon className="h-6 w-6 text-green-500 mr-2" />
                                ) : (
                                    <ArrowDownIcon className="h-6 w-6 text-red-500 mr-2" />
                                )}
                                <span className={classNames(
                                    progression.changeType === 'increase' ? 'text-green-800' : 'text-red-800',
                                    'text-xl font-bold'
                                )}>${progression.change}</span>
                            </div>
                        </div>
                        <div className="flex-1"></div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default UsageProgressionBar;