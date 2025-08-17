// hooks/useApiStatus.ts
import { useState, useEffect } from 'react';
import { subscribeToApiCallCount, subscribeToRequestStatus, getApiCallCount, getRequestStatus } from '../utils/apiManager.ts';

export const useApiStatus = () => {
    const [apiCallCount, setApiCallCount] = useState(getApiCallCount());
    const [requestStatus, setRequestStatus] = useState(getRequestStatus());

    useEffect(() => {
        const unsubscribeCount = subscribeToApiCallCount(setApiCallCount);
        const unsubscribeStatus = subscribeToRequestStatus(setRequestStatus);

        return () => {
            unsubscribeCount();
            unsubscribeStatus();
        };
    }, []);

    const isApiRequestActive = requestStatus === 'active';
    const isStopping = requestStatus === 'stopping';

    return { apiCallCount, isApiRequestActive, isStopping };
};