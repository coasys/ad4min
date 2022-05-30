# Ad4min UI

This desktop interface handles the administration of ad4m services, inclues

- show agent profile
- add trusted agents
- install a new language
- authenticate and authorize a new app to access ad4m

## Development

Install ad4m-host binaries,

```shell
./scripts/setup-binaries.sh
```

Run frontend dev server,

```shell
yarn install
yarn start
```

In another terminal, run the tauri app,

```shell
yarn run tauri dev
```
