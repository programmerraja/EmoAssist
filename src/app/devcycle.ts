import { setupDevCycle } from "@devcycle/nextjs-sdk/server";

const getUserIdentity = async () => {
  const myUser = { id: "123" };
  return {
    user_id: myUser.id,
  };
};

export const { getVariableValue, getClientContext, getAllVariables } =
  setupDevCycle({
    serverSDKKey: process.env.DEVCYCLE_SERVER_SDK_KEY ?? "",
    clientSDKKey: process.env.NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY ?? "",
    userGetter: getUserIdentity,
    options: {},
  });
