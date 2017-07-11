#!/usr/bin/env node
import * as rc from 'rc';
import deploy from './index';

const config = rc('deploy', {
  dry: false
});

deploy(config);
