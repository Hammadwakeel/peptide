type SubscribeFn = (conversationId: string) => void;

let subscribeConversation: SubscribeFn = () => {};

export function setChatSubscribeHandler(handler: SubscribeFn) {
  subscribeConversation = handler;
}

export function chatSubscribe(conversationId: string) {
  if (!conversationId) return;
  subscribeConversation(conversationId);
}
