export default (err, req, res, next) => {
    console.error(err.stack)
    let status = err.statusCode
    let message = err.message
    if (!status) {
        message = "Internal server error"
        status = 500
    }
    return res.status(status).json({success: false, message})
}