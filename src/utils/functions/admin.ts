import { TestInfo } from "@playwright/test";

export interface AdminCredentials {
    username: string;
    password: string;
}

/**
 * Resolve admin credentials for the current worker slot.
 *
 * config.private.json may define an `admin_users` array (provisioned via
 * `admin-users.sh create --count=N --write-config`) so concurrent workers
 * each log in as a distinct admin account instead of racing on shared
 * per-user state (e.g. ui_bookmark grid columns/filters). Workers are
 * assigned round-robin by `parallelIndex` — the stable [0, workers) slot
 * index Playwright assigns per concurrent worker, unlike `workerIndex`
 * which increments forever across worker restarts.
 *
 * Falls back to the single admin_username/admin_password pair when no
 * admin_users are configured, so buckets that don't opt in are unaffected.
 */
export const getAdminForWorker = (workerInfo: TestInfo): AdminCredentials => {
    const users: AdminCredentials[] = JSON.parse(process.env.admin_users || "[]");

    if (users.length > 0) {
        return users[workerInfo.parallelIndex % users.length];
    }

    const username = process.env.admin_username;
    const password = process.env.admin_password;

    if (!username || !password) {
        throw new Error('Admin credentials not found. Set admin_username/admin_password (or admin_users) in config.private.json');
    }

    return { username, password };
};
