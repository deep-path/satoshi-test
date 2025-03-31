export function getExtendConfig(
) {
      return {
        RPC_LIST: {
          defaultRpc: {
            url: "https://near.lava.build",
            simpleName: "lava rpc",
          },
          officialRpc: {
            url: "https://rpc.mainnet.near.org",
            simpleName: "official rpc",
          },
          betaRpc: {
            url: "https://beta.rpc.mainnet.near.org",
            simpleName: "official beta rpc",
          },
          fastnearRpc: {
            url: "https://free.rpc.fastnear.com",
            simpleName: "fastnear rpc",
          },
          // pagodaRpc: {
          //   url: "https://rpc.mainnet.pagoda.co",
          //   simpleName: "pagoda rpc",
          // },
        },
      };
}
