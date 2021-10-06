const os = require("os")
var networkInterfaces = os.networkInterfaces()

// Get computer's internal IP (e.g. 192.168.1.103) automatically
module.exports = function getMachineIp() {
    console.log(networkInterfaces.en0[1].address)
    return networkInterfaces.en0[1].address
}
