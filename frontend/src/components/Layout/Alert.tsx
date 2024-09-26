import { useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { useTheme } from '@/context/ThemeContext';
import { serverResponse } from '@/types';

interface AlertProps {
    notification: serverResponse;
}

const Alert: React.FC<AlertProps> = ({ notification }) => {
    const [show, setShow] = useState(true)
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
                className={`flex items-center justify-center p-2 rounded-3xl m-2 ${
                    notification.status === 'success'
                        ? 'bg-vezmir border-4 border-vezmir-hover hover:bg-vezmir-hover'
                        : 'bg-red-600 border-2 border-red-800 hover:bg-red-800'
                } cursor-pointer`}
            >
                <p className="text-lg font-bold text-white text-center px-2">{locale("alert_" + notification.message) ?? ''}</p>
            </div>
        </Transition>
    );
}

export default Alert;
