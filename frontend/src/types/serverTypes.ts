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