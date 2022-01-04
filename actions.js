import AWS from 'aws-sdk';
let NAMES_DB = {};

/*
  IMPORTANT: remove 'https://' and '@connections' from the Connection URL that you copy over
  example:
    Connection URL https://xxxxxxxxxxx/execute-api.us-east-1.amazonaws.com/production/@connections
  turns to:
    ENDPOINT = 'xxxxxxxxxxx/execute-api.us-east-1.amazonaws.com/production/'
  see minute 7:00 https://youtu.be/BcWD-M2PJ-8?t=420
*/
const ENDPOINT = '>>>ENTER_YOUR_ENDPOINT_HERE<<<';
const client = new AWS.ApiGatewayManagementApi({ endpoint: ENDPOINT });

const sendToOne = async (id, body) => {
  try {
    await client.postToConnection({
      'ConnectionId': id,
      'Data': Buffer.from(JSON.stringify(body)),
    }).promise();
  } catch (err) {
    console.error(err);
  }
};

const sendToAll = async (ids, body) => {
  const all = ids.map(i => sendToOne(i, body));
  return Promise.all(all);
};

export const $connect = async () => {
  return {};
};

export const setName = async (payload, meta) => {
  NAMES_DB[meta.connectionId] = payload.name;
  await sendToAll(Object.keys(NAMES_DB), { members: Object.values(NAMES_DB) });
  await sendToAll(Object.keys(NAMES_DB), { systemMessage: `${NAMES_DB[meta.connectionId]} has joined the chat` })
  return {};
};

export const sendPublic = async (payload, meta) => {
  await sendToAll(Object.keys(NAMES_DB), { publicMessage: `${NAMES_DB[meta.connectionId]}: ${payload.message}` })
  return {};
};

export const sendPrivate = async (payload, meta) => {
  const to = Object.keys(NAMES_DB).find(key => NAMES_DB[key] === payload.to);
  await sendToOne(to, { privateMessage: `${NAMES_DB[meta.connectionId]}: ${payload.message}` });
  return {};
};

export const $disconnect = async (payload, meta) => {
  await sendToAll(Object.keys(NAMES_DB), { systemMessage: `${NAMES_DB[meta.connectionId]} has left the chat` })
  delete NAMES_DB[meta.connectionId];
  await sendToAll(Object.keys(NAMES_DB), { members: Object.values(NAMES_DB) })
  return {};
};