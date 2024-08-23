class Apierror extends Error{
    constructor(
        statusCode,
        message="somehing went wrong",
        errors=[],
        stack="",
)
    {
        super(message)
        this.statusCode = statusCode
        this.data=null,
        this.message = message,
        this.error = errors,
        this.success=false

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.contructor)
        }

    }
}
export {Apierror}