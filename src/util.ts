import { Ad4mClient, LinkExpression } from '@perspect3vism/ad4m';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { invoke } from '@tauri-apps/api';

export async function buildAd4mClient(server: string): Promise<Ad4mClient> {
	let token: string = await invoke("request_credential");

	return buildClient(server, token);
}

// export function buildDefaultAd4mClient(server: string): Ad4mClient {
// 	return buildClient(server, "test-token");
// }

function buildClient(server: string, token: string): Ad4mClient {
	let apolloClient = new ApolloClient({
		link: new WebSocketLink({
			uri: server,
			options: {
				lazy: true,
				reconnect: true,
				connectionParams: async () => {
					return {
						headers: {
							authorization: token
						}
					}
				}
			},
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

export function sanitizeLink(link: LinkExpression) {
	const newLink = JSON.parse(
		JSON.stringify(link)
	);

	newLink.__typename = undefined;
	newLink.data.__typename = undefined;
	newLink.proof.__typename = undefined;

	return newLink
}