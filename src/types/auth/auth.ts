export type LoginParams = {
    email: string;
    password: string;
};

export type RegistrationParams = {
    name: string;
    lastname: string;
    email: string;
    password: string;
};

export type ParamsVerificateEmail = {
  verificationCode: string;
  email: string;
};

export type NewPasswordParams = {
  password: string;
  activatedLink: string;
};

export type ResetPasswordParams = {
  verificationCode: string;
  email: string;
};

export type AuthProvider = 'google' | 'apple' | 'demo';

export type AuthUserLike = {
  id: string;
  email: string;
  isActivated?: boolean;
  fullName?: string;
  name?: string;
};


export type AuthUser = {
  id: string;
  email: string;
  isActivated: boolean;
  fullName: string;
  name: string;
};


type AuthFieldError = {
  field: string;
  message: string;
};

export type FormErrorResponse = {
  errors?: AuthFieldError[];
};