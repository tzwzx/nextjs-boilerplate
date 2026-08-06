import { GlobalRegistrator } from "@happy-dom/global-registrator";

// bunfig.toml の preload とテストからの import の両方で読まれても安全にする
if (!GlobalRegistrator.isRegistered) {
  // oxlint-disable-next-line jest/require-hook
  GlobalRegistrator.register();
}
