export const validationProps = (error: boolean, errorMessage: string) => ({
  error,
  errorMessage,
});

export const isBlank = (value: string) => {
  const trimmedVal = value.trim();
  if (!trimmedVal && trimmedVal.length === 0) {
    return true;
  }
  return false;
};

export const validateName = (value: string, message: any, validLength = 3) => {
  if (isBlank(value) || value.length < validLength) {
    return validationProps(true, message);
  }
  return validationProps(false, "");
};

export const validateMobile = (value: string, message: any) => {
  if (/^\d{10}$/.test(value)) {
    return validationProps(false, "");
  }
  return validationProps(true, message);
};

export const validateEmail = (value: any, message: any) => {
  /* eslint-disable */
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(String(value).toLowerCase())) return validationProps(false, "");
  return validationProps(true, message);
  /* eslint-enable */
};

export const validateOption = (value: any, message: any) => {
  if (isBlank(value) || !value) {
    return validationProps(true, message);
  }
  return validationProps(false, "");
};

export const validatePassword = (
  value: string,
  message: any,
  validLength = 6
) => {
  if (isBlank(value) || value.length < validLength) {
    return validationProps(true, message);
  }
  return validationProps(false, "");
};
