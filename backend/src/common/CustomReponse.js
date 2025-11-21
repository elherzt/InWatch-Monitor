export const TypeOfResponse = {
    OK: 0,
    Error: 1,
    Exception: 2,
    TimeOut: 3,
    Other: 4
}

export function CustomResponse(typeOfResponse, message, data = null) {
    return {
        typeOfResponse,
        message,
        data
    };
}