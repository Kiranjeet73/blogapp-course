import {Amplify,  withSSRContext} from "aws-amplify";

import awsmobile from "./src/aws-exports";

Amplify.configure({...awsmobile, ssr: true});