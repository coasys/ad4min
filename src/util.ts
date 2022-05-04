import { Ad4mClient } from '@perspect3vism/ad4m';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

export function buildAd4mClient(server: string): Ad4mClient {
	let apolloClient = new ApolloClient({
		link: new WebSocketLink({
			uri: server,
			options: { reconnect: true },
			webSocketImpl: WebSocket,
		}),
		cache: new InMemoryCache({ resultCaching: false, addTypename: false }),
		defaultOptions: {
			watchQuery: {
				fetchPolicy: "no-cache",
			},
			query: {
				fetchPolicy: "no-cache",
			}
		},
	});

	//@ts-ignore
	return new Ad4mClient(apolloClient);
}

export function generateLanguageInitials(name: string) {
	const split = name.split('-');

	if (split.length === 1) {
		return name.substring(0, 2);
	} else {
		return split[0][0] + split[1][0]
	}
}

export function isSystemLanguage(name: string) {
	return ['languages', 'agent-expression-store', 'neighbourhood-store', 'perspective-language', 'direct-message-language'].includes(name)
}