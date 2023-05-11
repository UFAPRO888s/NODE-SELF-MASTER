const Client = require("../Client")

/**
 * 
 * @param {Client} client 
 * @param {any} op 
 */
module.exports = async(client, op) =>{
    let where = op.param1;
    let channel = client.groups.cache.get(where)
    
    if(channel) {
        client.groups.cache.delete(where)
        client.emit("chat_leave",channel)
    }
}