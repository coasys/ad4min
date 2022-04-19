import { Ad4mClient } from '@perspect3vism/ad4m';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { invoke } from '@tauri-apps/api';
import { AD4M_ENDPOINT } from './config';

export async function buildAd4mClient(): Promise<Ad4mClient> {
	let token: string = await invoke("request_credential");

	return buildClient(token);
}

export function buildDefaultAd4mClient(): Ad4mClient {
	return buildClient("test-token");
}

function buildClient(token: string): Ad4mClient {
	let apolloClient = new ApolloClient({
		link: new WebSocketLink({
			uri: AD4M_ENDPOINT,
			options: {
				lazy: true,
				reconnect: true,
				connectionParams: async () => {
					return {
						headers: {
							authorization: token,
						},
					}
				},
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
