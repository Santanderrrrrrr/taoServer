const { format } = require('date-fns')
const { v4: uuid } = require('uuid')

const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async(message)=>{
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
    const logItem = `${dateTime}\t ${uuid()}\t${message}\n`
    console.log(logItem)
    try {
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname,'..', 'logs'))
        }
        //testing
        await fsPromises.appendFile(path.join(__dirname, '..','logs', 'eventLog.txt'), logItem)
    } catch (err) {
        console.error(err)
    }
}

const logger = async (req, res, next) => {
    await logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);
    next();
}

const errorHandler = async (err, req, res, next) => {
    await logEvents(`${err.name}: ${err.message}`, 'errLog.txt');
    console.error(err.stack)
    res.status(500).send(err.message);
}


module.exports = { logger, errorHandler };

