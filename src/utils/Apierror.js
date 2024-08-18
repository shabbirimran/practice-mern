class ApiError extends Error{
    contructor(
        statusCode,
        message="somehing went wrong",
        error=[],
        stack="",

    ){
        super(message)
        this.statusCode = statusCode
        this.data=null,
        this.message = message,
        this.error = error,
        this.success=false

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.contructor)
        }

    }
}
export {ApiError}