import { launcher, LaunchError } from "@zxteam/launcher";

import runtimeFactory from "./index";

launcher(async () => null, runtimeFactory);
