import { useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/context/ThemeContext';
import { serverResponse } from '@/types';

interface AlertProps {
    notification: serverResponse;
}

const Alert: React.FC<AlertProps> = ({ notification }) => {
    const [show, setShow] = useState(true)
    const icon = notification.status === 'success' ? <CheckCircleIcon aria-hidden="true" className="h-5 w-5 text-white" /> : <ExclamationTriangleIcon aria-hidden="true" className="h-5 w-5 text-white" />
    const { locale, removeNotification } = useTheme();

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false)
        }, 5000)

        return () => clearTimeout(timer);
    }, [notification.message])

    const handleClose = () => {
        setShow(false);
    };

    return (
        <Transition
            show={show}
            enter="transition ease-out duration-300"
            enterFrom="transform translate-x-full opacity-0"
            enterTo="transform translate-x-0 opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="transform translate-x-0 opacity-100"
            leaveTo="transform translate-x-full opacity-0"
            appear={true}
            afterLeave={() => removeNotification(notification.message ?? '')}
        >
            <div 
                onClick={handleClose}
                className={`flex items-center justify-center p-3 rounded-3xl m-2 ${
                    notification.status === 'success' 
                        ? 'bg-[var(--bordeaux)] border-4 border-[var(--bordeaux-hover)] hover:bg-[var(--bordeaux-hover)]' 
                        : 'bg-red-600 border-4 border-red-800 hover:bg-red-800'
                } cursor-pointer`}
            >
                <p className="text-xl font-bold text-white text-center px-2">{locale(notification.message ?? '')}</p>
            </div>
        </Transition>
    );
}

export default Alert;

