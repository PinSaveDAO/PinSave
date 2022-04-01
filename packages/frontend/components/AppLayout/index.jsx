import React from 'react'
import { useEffect } from 'react';
import { useNetwork } from 'wagmi';
import { useNetworkStore } from '../../store';

const AppLayout = ({ children }) => {
    const [{ data }] = useNetwork();
    const initNetwork = useNetworkStore((state) => state.setNetwork);
    useEffect(() => {
        if (data.chain)
            initNetwork(data.chain?.name ?? "Undefined", data.chain?.id.toFixed());
    }, [data, initNetwork]);
    return (
        <div>
            {children}
        </div>
    )
}

export default AppLayout