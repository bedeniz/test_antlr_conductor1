import { initialise } from "conductor/dist/conductor/runner/util/";
import { SimpleLangEvaluator } from "./SimpleLangEvaluator";

const {runnerPlugin, conduit} = initialise(SimpleLangEvaluator);