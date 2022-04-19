import { createContext, useEffect, useState } from "react";
import App from "./App";
import { buildAd4mClient, buildDefaultAd4mClient } from "./util";

const defaultAd4mClient = buildDefaultAd4mClient();
export const Ad4mContext = createContext(defaultAd4mClient);

const Ad4m = () => {
	const [ad4mClient, setAd4mClient] = useState(defaultAd4mClient);

	useEffect(() => {
		const build = async () => {
			let ad4mClient = await buildAd4mClient();
			setAd4mClient(ad4mClient);
		}
		build();
	}, []);

	return (
		<Ad4mContext.Provider value={ad4mClient}>
			<App />
		</Ad4mContext.Provider>
	);
}

export default Ad4m;