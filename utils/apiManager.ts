// utils/apiManager.ts
// Centralized module for managing global API state like rate limiting, call counts, and cancellation.

const RATE_LIMIT_MS = 500; // 0.5 seconds = 2 requests per second
const MAX_CONTINUOUS_FAILURES = 10;
const CIRCUIT_BREAKER_COOLDOWN_MS = 30000; // 30 seconds

let lastApiCallTimestamp = 0;
let continuousFailureCount = 0;
let circuitBreakerCooldownUntil = 0;


// --- Circuit Breaker ---
const checkCircuitBreaker = () => {
    const now = Date.now();
    if (circuitBreakerCooldownUntil > now) {
        const timeLeft = ((circuitBreakerCooldownUntil - now) / 1000).toFixed(1);
        throw new Error(`Circuit breaker active due to repeated failures. Please wait ${timeLeft}s.`);
    }
};

const tripCircuitBreaker = () => {
    circuitBreakerCooldownUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS;
    console.warn(`Circuit breaker tripped. API calls suspended for ${CIRCUIT_BREAKER_COOLDOWN_MS / 1000} seconds.`);
};

const incrementContinuousFailureCount = () => {
    continuousFailureCount++;
    if (continuousFailureCount >= MAX_CONTINUOUS_FAILURES) {
        tripCircuitBreaker();
    }
};

const resetContinuousFailureCount = () => {
    continuousFailureCount = 0;
    circuitBreakerCooldownUntil = 0; // Also reset cooldown if a call succeeds
};


// --- Rate Limiting ---
export const enforceRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallTimestamp;
    if (timeSinceLastCall < RATE_LIMIT_MS) {
        const delay = RATE_LIMIT_MS - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
};

export const updateRateLimitTimestamp = () => {
    lastApiCallTimestamp = Date.now();
};

// --- API Call Counter (Pub/Sub) ---
let apiCallCount = 0;
const countListeners: Set<(count: number) => void> = new Set();

export const getApiCallCount = () => apiCallCount;

export const incrementApiCallCount = () => {
    apiCallCount++;
    countListeners.forEach(listener => listener(apiCallCount));
};

export const subscribeToApiCallCount = (callback: (count: number) => void): (() => void) => {
    countListeners.add(callback);
    return () => countListeners.delete(callback); // Unsubscribe function
};

// --- Request Cancellation (AbortController) & Status ---
type RequestStatus = 'idle' | 'active' | 'stopping';

let currentAbortController: AbortController | null = null;
let requestStatus: RequestStatus = 'idle';
const statusListeners: Set<(status: RequestStatus) => void> = new Set();

export const getRequestStatus = () => requestStatus;

export const setRequestStatus = (status: RequestStatus) => {
    requestStatus = status;
    statusListeners.forEach(listener => listener(requestStatus));
}

export const subscribeToRequestStatus = (callback: (status: RequestStatus) => void): (() => void) => {
    statusListeners.add(callback);
    return () => statusListeners.delete(callback);
}

export const getNewAbortSignal = (): AbortSignal => {
    checkCircuitBreaker();
    // The automatic abort on new request generation was causing sequential calls in deep analysis to cancel each other.
    // This has been removed. Cancellation now only happens explicitly via `abortCurrentRequest`.
    currentAbortController = new AbortController();
    return currentAbortController.signal;
};

export const abortCurrentRequest = () => {
    if (currentAbortController && requestStatus === 'active') {
        setRequestStatus('stopping');
        // Add a custom message to distinguish user-triggered aborts
        currentAbortController.abort("Request explicitly cancelled by user via stop button.");
    }
};

export const clearAbortController = () => {
    currentAbortController = null;
};

// Export failure handlers for use in Service.ts
export { incrementContinuousFailureCount, resetContinuousFailureCount };