### Optional Configuration

By providing the following ENV variables you can override default configuration.

```bash
docker run --rm -it -p 4000:4000 \
--env PORT="4000" \
--env TEZOS_NODE="https://api.tezos.org.ua" \
--env ENABLE_API_KEY="true" \
--env API_KEY="random!@#123String" \
tezoslive/taas-graphql-subscriptions
```

-   `PORT` configuration for the port on which NodeJS server listens. Default is `4000`.
-   `TEZOS_NODE` configuration for the Tezos Node RPC API endpoint. Default is [`https://api.tezos.org.ua`](https://api.tezos.org.ua)
Apollo.
-   `ENABLE_API_KEY` if enabled API Key is required with each request. API key needs to be provided in the `X-TaaS-Key` header. Default is `false`.
-   `API_KEY` configures the API key value. There is no default value.
