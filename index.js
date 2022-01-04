import { LambdaActions } from 'lambda-actions';
import { $connect, $disconnect, setName, sendPublic, sendPrivate } from './actions';

export const handler = async (event, context) => {

  if (!event.requestContext) {
    return {};
  }

  try {

    const connectionId = event.requestContext.connectionId;
    const routeKey = event.requestContext.routeKey;
    const body = JSON.parse(event.body || '{}');

    const lambdaActions = new LambdaActions();
    lambdaActions.action('$connect', $connect);
    lambdaActions.action('$disconnect', $disconnect);
    lambdaActions.action('setName', setName);
    lambdaActions.action('sendPublic', sendPublic);
    lambdaActions.action('sendPrivate', sendPrivate);

    await lambdaActions.fire({
      action: routeKey,
      payload: body,
      meta: { connectionId },
    });

  } catch (err) {
    console.error(err);
  }

  return {};
};