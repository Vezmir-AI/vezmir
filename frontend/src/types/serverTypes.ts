export interface serverResponse {
    status: number;
    message: string;
}

export interface userProfile {
    first_name: string;
    last_name: string;
    preferred_model: string;
    email: string;
}

export interface profileUpdate {
    first_name?: string;
    last_name?: string;
    preferred_model?: string;
}

export interface passwordUpdate {
    old_password: string;
    new_password: string;
}

export type usageData = {
    date: string;
    chatgpt?: number;
    claude?: number;
    sample?: number;
    total: number;
};

export type usageSpendings = {
    money_spent: number;
}

export interface userUsage {
    money_spent?: usageSpendings;
    money_usage?: usageData[];
    token_usage?: usageData[];
}
